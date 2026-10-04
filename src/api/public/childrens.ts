import express from 'express';
import type { PrismaClient } from '@prisma/client';
import type { Resend } from 'resend';
import { isModulePublicOperationOpen } from '../admin/modules.js';
import { ensureChildrensDaySchema } from '../childrens-schema.js';
import { consumeRateLimit } from '../../lib/server/rateLimit.js';

const MODULE_ID = 'criancas';
const MAX_CHILDREN = 10;
const MAX_FAMILY_MEMBERS = 15;
const MAX_TOTAL_PEOPLE = 25;
const MAX_NOTES_LENGTH = 500;

export type ChildrensMemberInput = { name: string; age: number };

export interface ChildrensRegistrationPayload {
  guardianName: string;
  phone: string;
  email?: string;
  notes?: string;
  bringsBreakfast?: boolean;
  bringsSideDish?: boolean;
  bringsDrink?: boolean;
  breakfastItems?: string;
  sideDishItems?: string;
  children?: ChildrensMemberInput[];
  familyMembers?: ChildrensMemberInput[];
}

export interface ValidatedChildrensRegistration {
  guardianName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  bringsBreakfast: boolean;
  bringsSideDish: boolean;
  bringsDrink: boolean;
  breakfastItems: string | null;
  sideDishItems: string | null;
  children: ChildrensMemberInput[];
  familyMembers: ChildrensMemberInput[];
}

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

function normalizeMembers(value: unknown, kind: 'children' | 'familyMembers'): ChildrensMemberInput[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;
  const limit = kind === 'children' ? MAX_CHILDREN : MAX_FAMILY_MEMBERS;
  if (value.length > limit) return null;
  const members: ChildrensMemberInput[] = [];
  for (const raw of value) {
    const name = String((raw as ChildrensMemberInput)?.name ?? '').trim();
    const age = Number((raw as ChildrensMemberInput)?.age);
    const ageLimit = kind === 'children' ? 17 : 120;
    if (name.length < 2 || name.length > 120 || !Number.isInteger(age) || age < 0 || age > ageLimit) return null;
    members.push({ name, age });
  }
  return members;
}

export function validateChildrensRegistration(body: ChildrensRegistrationPayload): ValidatedChildrensRegistration | null {
  const guardianName = String(body?.guardianName ?? '').trim();
  const phone = String(body?.phone ?? '').replace(/\D/g, '');
  const rawEmail = String(body?.email ?? '').trim().toLowerCase();
  const email = rawEmail.length === 0 ? null : rawEmail;
  const notes = String(body?.notes ?? '').trim().slice(0, MAX_NOTES_LENGTH) || null;
  const breakfastItems = String(body?.breakfastItems ?? '').trim().slice(0, 200) || null;
  const sideDishItems = String(body?.sideDishItems ?? '').trim().slice(0, 200) || null;
  const children = normalizeMembers(body?.children, 'children');
  const familyMembers = normalizeMembers(body?.familyMembers, 'familyMembers');

  if (guardianName.length < 3 || guardianName.length > 120) return null;
  if (phone.length < 10 || phone.length > 11) return null;
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160)) return null;
  if (!children || children.length === 0) return null;
  if (!familyMembers) return null;
  if (children.length + familyMembers.length > MAX_TOTAL_PEOPLE) return null;

  return {
    guardianName,
    phone,
    email,
    notes,
    bringsBreakfast: body?.bringsBreakfast === true,
    bringsSideDish: body?.bringsSideDish === true,
    bringsDrink: body?.bringsDrink === true,
    breakfastItems,
    sideDishItems,
    children,
    familyMembers,
  };
}

function buildNotificationHtml(editionName: string, data: ValidatedChildrensRegistration): string {
  const memberRows = (members: ChildrensMemberInput[]) => members.map((member) => `<li>${escapeHtml(member.name)} — ${member.age} ano(s)</li>`).join('');
  const totalPeople = 1 + data.children.length + data.familyMembers.length;
  return `
    <h2>${escapeHtml(editionName)}</h2>
    <p><b>Responsável (contabilizado como participante):</b> ${escapeHtml(data.guardianName)}</p>
    <p><b>Telefone:</b> ${escapeHtml(data.phone)}</p>
    ${data.email ? `<p><b>E-mail:</b> ${escapeHtml(data.email)}</p>` : ''}
    <p><b>Total de participantes:</b> ${totalPeople}</p>
    <h3>Crianças</h3>
    <ul>${memberRows(data.children)}</ul>
    ${data.familyMembers.length > 0 ? `<h3>Demais familiares</h3><ul>${memberRows(data.familyMembers)}</ul>` : ''}
    <p><b>Levará café da manhã:</b> ${data.bringsBreakfast ? 'Sim' : 'Não'}${data.breakfastItems ? ` — ${escapeHtml(data.breakfastItems)}` : ''}</p>
    <p><b>Levará acompanhamento:</b> ${data.bringsSideDish ? 'Sim' : 'Não'}${data.sideDishItems ? ` — ${escapeHtml(data.sideDishItems)}` : ''}</p>
    <p><b>Levará refrigerante/suco:</b> ${data.bringsDrink ? 'Sim' : 'Não'}</p>
    ${data.notes ? `<p><b>Observações:</b> ${escapeHtml(data.notes)}</p>` : ''}
  `;
}

function buildFamilyConfirmationHtml(data: ValidatedChildrensRegistration): string {
  const firstName = escapeHtml(data.guardianName.split(' ')[0]);
  const childrenList = data.children.map((child) => `<li>${escapeHtml(child.name)} — ${child.age} ano(s)</li>`).join('');
  const familyList = data.familyMembers.length > 0 ? data.familyMembers.map((member) => `<li>${escapeHtml(member.name)} — ${member.age} ano(s)</li>`).join('') : '';
  const totalPeople = 1 + data.children.length + data.familyMembers.length;
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; background-color: #fff;">
      <div style="background-color: #f59e0b; padding: 35px 20px; text-align: center;">
        <h1 style="color: #1c1917; margin: 0; font-size: 26px; font-family: Georgia, serif;">Igreja Batista Olaria</h1>
        <p style="color: #1c1917; margin: 10px 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Dia das Crianças</p>
      </div>
      <div style="padding: 35px 30px; line-height: 1.6;">
        <p style="font-size: 18px;">Olá, <strong>${firstName}</strong>!</p>
        <p>Recebemos a inscrição da sua família. Será uma alegria celebrar este dia com vocês.</p>
        <div style="margin-top: 25px; border-top: 2px solid #f59e0b; padding-top: 20px;">
          <h3 style="margin-bottom: 10px;">Sua família inscrita</h3>
          <p style="margin: 5px 0;"><strong>Crianças:</strong></p>
          <ul style="margin-top: 0;">${childrenList}</ul>
          ${familyList ? `<p style="margin: 5px 0;"><strong>Demais familiares:</strong></p><ul style="margin-top: 0;">${familyList}</ul>` : ''}
          <p style="margin-top: 10px; font-size: 14px; color: #666;">Incluindo você, responsável, serão <strong>${totalPeople} pessoa(s)</strong> da sua família no evento.</p>
        </div>
        <div style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px;">
          <h3 style="margin-bottom: 10px;">Programação</h3>
          <p style="margin: 5px 0;"><strong>Data:</strong> 11 de outubro (domingo)</p>
          <p style="margin: 5px 0;"><strong>Horário:</strong> das 9h às 16h</p>
          <p style="margin: 5px 0;"><strong>Local:</strong> Espaço de Eventos Casarão</p>
          <p style="margin: 10px 0 0;"><a href="https://maps.app.goo.gl/jUkjmX8ZE7poMEPn9" style="color: #b45309;">Ver localização no mapa</a></p>
        </div>
        <div style="margin-top: 25px; padding: 20px; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7;">
          <h3 style="margin-top: 0; color: #92400e;">O que levar</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 18px;">
            <li>Café da manhã para compartilhar</li>
            <li>Um acompanhamento para o almoço e refrigerante/suco</li>
            <li>Toalha, roupa de banho, protetor solar e itens de higiene pessoal</li>
            <li>Roupa extra para as crianças</li>
          </ul>
        </div>
        <p style="margin-top: 25px; font-size: 14px; color: #666;">Atenção: os pais ou responsáveis são responsáveis pela supervisão e segurança dos filhos durante todo o evento, especialmente na área da piscina.</p>
        <p style="margin-top: 25px;">Em Cristo,</p>
        <p style="margin: 0; font-weight: bold;">Igreja Batista Olaria</p>
        <p style="margin: 0; font-size: 13px; color: #666;">Porto Velho — Rondônia</p>
      </div>
    </div>
  `;
}

export function createPublicChildrensRouter(prisma: PrismaClient, getResend: () => Resend | null) {
  const router = express.Router();

  router.use(async (_req, _res, next) => {
    await ensureChildrensDaySchema(prisma);
    next();
  });

  router.post('/registrations', async (req, res) => {
    const rateLimit = await consumeRateLimit(prisma, req, { scope: 'criancas-registration', limit: 6, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) { res.setHeader('Retry-After', rateLimit.retryAfterSeconds); return res.status(429).json({ error: 'Limite de inscrições atingido. Tente novamente mais tarde.' }); }
    if (!(await isModulePublicOperationOpen(prisma, MODULE_ID))) return res.status(410).json({ error: 'As inscrições do Dia das Crianças estão encerradas.' });

    const data = validateChildrensRegistration(req.body ?? {});
    if (!data) return res.status(400).json({ error: 'Revise os dados informados. Informe ao menos uma criança e confira nome, idade e telefone.' });

    try {
      const edition = await prisma.siteEdition.findFirst({ where: { moduleId: MODULE_ID, status: 'ACTIVE' }, orderBy: [{ year: 'desc' }, { createdAt: 'desc' }], select: { id: true, name: true } });
      if (!edition) return res.status(409).json({ error: 'Nenhuma edição ativa do Dia das Crianças foi configurada.' });

      const registration = await prisma.$transaction(async (tx) => {
        const created = await tx.childrensDayRegistration.create({
          data: {
            editionId: edition.id,
            guardianName: data.guardianName,
            phone: data.phone,
            email: data.email,
            bringsBreakfast: data.bringsBreakfast,
            bringsSideDish: data.bringsSideDish,
            bringsDrink: data.bringsDrink,
            breakfastItems: data.breakfastItems,
            sideDishItems: data.sideDishItems,
            notes: data.notes,
          },
        });
        await tx.childrensDayMember.createMany({
          data: [
            ...data.children.map((member) => ({ registrationId: created.id, kind: 'CRIANCA' as const, name: member.name, age: member.age })),
            ...data.familyMembers.map((member) => ({ registrationId: created.id, kind: 'FAMILIAR' as const, name: member.name, age: member.age })),
          ],
        });
        return created;
      });

      const resend = getResend();
      if (resend) {
        void resend.emails.send({
          from: 'Dia das Crianças IBO <contato@ibopvh.com.br>',
          to: 'contato@ibopvh.com.br',
          subject: `Nova inscrição — Dia das Crianças — ${data.guardianName}`,
          html: buildNotificationHtml(edition.name, data),
        }).catch((error) => console.error('Childrens day email error:', error));
        if (data.email) {
          void resend.emails.send({
            from: 'Igreja Batista Olaria <contato@ibopvh.com.br>',
            to: data.email,
            subject: 'Inscrição confirmada — Dia das Crianças IBO',
            html: buildFamilyConfirmationHtml(data),
          }).catch((error) => console.error('Childrens day confirmation email error:', error));
        }
      }

      res.status(201).json({ success: true, id: registration.id });
    } catch (error) {
      console.error('Childrens day registration error:', error);
      res.status(500).json({ error: 'Não foi possível concluir a inscrição.' });
    }
  });

  return router;
}
