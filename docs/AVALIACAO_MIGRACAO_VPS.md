# Avaliação — migração do portal para a VPS vs Vercel/Supabase

**Data:** 2026-10-25
**Autor:** OIKOS (análise somente leitura)
**Estado:** decisão pendente — registrada em `docs/PENDENCIAS.md`
**Escopo:** portal `siteibopvh` (produção) e impacto no módulo EBD Digital
**Fontes:** `docs/AUDITORIA_VPS_2026-10-22.md` (OIKOS), `.oikos/project.yaml`,
`agente.md`, `package.json`. Nenhuma alteração de infraestrutura foi feita.

## 1. Situação atual

- **Portal:** SPA React/Vite + Express, em produção na Vercel
  (`https://www.ibopvh.com.br`), PostgreSQL e Auth no Supabase, Storage no bucket
  `site-assets`, 12 funções serverless (limite do plano Hobby) e limite de 4,5 MB
  por request.
- **VPS:** Coolify 4.4.7, 2 vCPU, 7,8 GiB de RAM, 96 GB de disco (83 GB livres),
  sem swap. Dez containers, incluindo Mordomo, Louvor, AI Memory e PostgreSQL 16.
  A auditoria de 22/10 concluiu: capacidade **adequada com ressalvas** (picos de
  CPU e `steal` de até 47%) e segurança **não aprovada** (origem exposta no IP,
  `ufw` inativo, UI do Coolify na porta 8000, atualizações pendentes, backups
  atrasados e cópia offsite ainda pendente).
- **EBD Digital:** módulo planejado dentro do portal; PDF enviado direto ao
  Storage, extração local, importação de JSON pequeno. Não depende de função
  serverless nova.

## 2. O que "limitação" significa neste caso

| Limite atual | Afeta o portal? | Afeta o EBD? |
|---|---|---|
| 12 funções serverless (Hobby) | Sim, é o teto de crescimento da API | Não: o módulo reaproveita entries existentes |
| 4,5 MB por request | Sim, para uploads via função | Não: o PDF vai direto ao Storage |
| Tempo/memória de execução | Sim, para processamento pesado | Não: a extração é local |
| Cold start | Experiência, não bloqueio | Não |
| 50 MB por arquivo no Storage (plano Free) | Não | Suficiente para as edições analisadas (32 MB); se crescer, comprimir ou dividir |

## 3. Opções

### A. Manter Vercel + Supabase (status quo)

**Prós:** zero migração; deploy, TLS, CDN, Auth, Storage e backups gerenciados;
segurança de provedor; custo baixo no plano atual.
**Contras:** teto de 12 funções; 4,5 MB por request; dependência de dois
fornecedores; pouco controle sobre runtime.

### B. Migrar tudo para a VPS (aplicação + PostgreSQL + Auth + Storage)

**Prós:** fim dos limites de função/corpo/duração do Vercel; consolidação na
infraestrutura já paga; controle total do runtime e do banco.
**Contras:** operação própria (deploy, rollback, monitoração, patches); ponto
único de falha; Auth e Storage do Supabase não migram sozinhos; RLS precisa ser
reescrita; backups e restauração passam a ser responsabilidade interna; dados de
inscrições (inclusive de crianças) sob LGPD auto-hospedados; VPS com segurança
ainda não aprovada e capacidade com ressalvas.

### C. Híbrido (frontend na Vercel, API/banco na VPS, ou banco na VPS mantendo Auth/Storage no Supabase)

**Prós:** migração gradual; mantém CDN do frontend.
**Contras:** dois ambientes, latência entre eles, JWT/RLS atravessando
plataformas, diagnóstico mais difícil; complexidade maior do que qualquer um dos
extremos.

### D. Subir para o Vercel Pro

**Prós:** eleva limites de funções e duração com mudança mínima; mantém o
gerenciado.
**Contras:** custo recorrente; o limite de 4,5 MB por request não é resolvido só
pelo upgrade; dependência de fornecedor continua.

## 4. Comparativo

| Critério | A. Vercel + Supabase | B. VPS completa | C. Híbrido | D. Vercel Pro |
|---|---|---|---|---|
| Limite de funções | 12 | Sem limite do Vercel (limitado pela VPS) | Parcial | Maior teto |
| Corpo por request | 4,5 MB | Limitado pela VPS | Parcial | 4,5 MB |
| Operação | Baixa | Alta | Média-alta | Baixa |
| Segurança gerenciada | Sim | Responsabilidade própria | Mista | Sim |
| Backups/restore | Gerenciados | Próprios, com teste obrigatório | Mistos | Gerenciados |
| Disponibilidade | Alta | Ponto único de falha | Média | Alta |
| Custo | Baixo | Já pago, mas com horas de operação | Intermediário | Assinatura |
| LGPD/dados sensíveis | Provedor | Responsabilidade própria | Mista | Provedor |
| Esforço de migração | Zero | Semanas | Semanas | Baixo |
| Reversibilidade | — | Baixa | Média | Baixa |

## 5. Impacto no EBD Digital

- Nenhuma opção bloqueia o EBD; a opção A é suficiente para o MVP.
- A migração não melhora a extração (que é local) nem o PDF (que já fica no
  Storage); apenas muda onde banco, Auth e arquivos vivem.
- Migrar durante a entrega do EBD misturaria risco de infraestrutura com entrega
  de produto — exatamente o que o protocolo evita.

## 6. Recomendação

1. **A para o EBD agora:** manter Vercel + Supabase e reaproveitar entries, como
   o módulo Crianças já faz.
2. **D** se o teto de funções virar bloqueio real e o custo se justificar.
3. **B somente como projeto separado**, depois de: corrigir a segurança da VPS;
   testar backup e restauração; definir teto de recursos e monitoração; planejar
   Auth e Storage; definir rollback; revisar LGPD.
4. **C não recomendado** sem necessidade concreta — adiciona complexidade sem
   resolver o problema principal.

## 7. Pré-requisitos se a opção B for escolhida

- [ ] Fechar a exposição da origem e ativar firewall no VPS.
- [ ] Atualizar pacotes pendentes e separar o banco do portal de outros serviços.
- [ ] Definir recursos (CPU/RAM/disco) e monitoração do portal e do Postgres.
- [ ] Backup diário do banco e do storage, com restauração testada e cópia offsite.
- [ ] Plano de migração de Auth (usuários/sessões) e Storage (bucket `site-assets`).
- [ ] Reescrever políticas RLS dependentes do Supabase.
- [ ] Janela de manutenção e rollback documentados.
- [ ] Revisão de LGPD para dados de inscrições.

## 8. Decisão

**Pendente.** Registro em `docs/PENDENCIAS.md`. Este documento é análise; não
autoriza migração, alteração de DNS, firewall, deploy ou banco.
