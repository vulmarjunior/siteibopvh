import { describe, expect, it } from 'vitest';
import { validateChildrensRegistration } from '../childrens';

const validPayload = {
  guardianName: 'Maria Souza',
  phone: '(69) 99999-9999',
  children: [{ name: 'João Souza', age: 7 }],
  familyMembers: [{ name: 'José Souza', age: 34 }],
};

describe('validateChildrensRegistration', () => {
  it('aceita uma inscrição válida e normaliza telefone', () => {
    const result = validateChildrensRegistration(validPayload);
    expect(result).not.toBeNull();
    expect(result?.phone).toBe('69999999999');
    expect(result?.children).toEqual([{ name: 'João Souza', age: 7 }]);
    expect(result?.familyMembers).toEqual([{ name: 'José Souza', age: 34 }]);
    expect(result?.bringsBreakfast).toBe(false);
  });

  it('exige ao menos uma criança', () => {
    expect(validateChildrensRegistration({ ...validPayload, children: [] })).toBeNull();
    expect(validateChildrensRegistration({ ...validPayload, children: undefined })).toBeNull();
  });

  it('rejeita idades fora do limite', () => {
    expect(validateChildrensRegistration({ ...validPayload, children: [{ name: 'Ana', age: 18 }] })).toBeNull();
    expect(validateChildrensRegistration({ ...validPayload, familyMembers: [{ name: 'Bisavó', age: 121 }] })).toBeNull();
    expect(validateChildrensRegistration({ ...validPayload, children: [{ name: 'Ana', age: 5.5 }] })).toBeNull();
  });

  it('rejeita nomes e telefones inválidos', () => {
    expect(validateChildrensRegistration({ ...validPayload, guardianName: 'Ab' })).toBeNull();
    expect(validateChildrensRegistration({ ...validPayload, phone: '6999' })).toBeNull();
    expect(validateChildrensRegistration({ ...validPayload, children: [{ name: 'A', age: 6 }] })).toBeNull();
  });

  it('rejeita e-mail inválido quando informado', () => {
    expect(validateChildrensRegistration({ ...validPayload, email: 'nao-e-email' })).toBeNull();
    expect(validateChildrensRegistration({ ...validPayload, email: 'familia@exemplo.com' })?.email).toBe('familia@exemplo.com');
  });

  it('limita observações e aceita logística marcada', () => {
    const result = validateChildrensRegistration({ ...validPayload, notes: 'x'.repeat(600), bringsBreakfast: true, bringsSideDish: true, bringsDrink: true });
    expect(result?.notes?.length).toBe(500);
    expect(result?.bringsBreakfast).toBe(true);
    expect(result?.bringsSideDish).toBe(true);
    expect(result?.bringsDrink).toBe(true);
  });

  it('normaliza os itens informados para café e acompanhamento', () => {
    const result = validateChildrensRegistration({ ...validPayload, bringsBreakfast: true, breakfastItems: '  pão, bolo e frutas  ', bringsSideDish: true, sideDishItems: 'farofa' });
    expect(result?.breakfastItems).toBe('pão, bolo e frutas');
    expect(result?.sideDishItems).toBe('farofa');
    expect(validateChildrensRegistration({ ...validPayload, breakfastItems: 'x'.repeat(260) })?.breakfastItems?.length).toBe(200);
    expect(validateChildrensRegistration(validPayload)?.breakfastItems).toBeNull();
  });

  it('rejeita familiar com dados incompletos', () => {
    expect(validateChildrensRegistration({ ...validPayload, familyMembers: [{ name: 'José Souza', age: Number.NaN }] })).toBeNull();
  });
});
