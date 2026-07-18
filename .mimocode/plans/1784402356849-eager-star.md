# Plano: Notificação Semanal de Leitura Bíblica — Parousia

## Resumo

Criar um sistema de e-mail semanal via Resend que envia a leitura bíblica da semana todo segunda-feira às 7h (horário de Porto Velho) para os assinantes do hotsite Parousia.

---

## Escolhas do Usuário

- **Canal:** E-mail via Resend (já integrado)
- **Posição do formulário:** Dentro do hotsite Parousia (seção dedicada)
- **Frequência:** Semanal (toda segunda-feira)
- **Agendamento:** Netlify Scheduled Function (disponível em todos os planos, incluindo free)

---

## Passo a Passo

### Passo 1: Modelo Prisma — ReadingSubscriber

**Arquivo:** `prisma/schema.prisma`

Adicionar modelo:

```prisma
model ReadingSubscriber {
  id             Int        @id @default(autoincrement())
  email          String     @unique
  name           String?
  token          String     @unique
  active         Boolean    @default(true)
  subscribedAt   DateTime   @default(now())
  unsubscribedAt DateTime?
}
```

Executar `npx prisma migrate dev --name add-reading-subscribers` e `npx prisma generate`.

---

### Passo 2: Rotas da API

**Arquivo:** `src/api.ts` (adicionar no final do `apiRouter`)

#### 2a. `POST /api/parousia/subscribe`
- Recebe: `{ email, name? }`
- Valida: email obrigatório, formato válido
- Gera token único para unsubscribe
- Insere no banco (upsert — se email já existe e está inativo, reativa)
- Retorna: `{ success: true }`

#### 2b. `GET /api/parousia/unsubscribe?token=...`
- Busca subscriber pelo token
- Marca `active = false`, `unsubscribedAt = now()`
- Retorna página HTML simples de confirmação

#### 2c. `GET /api/parousia/today` (auxiliar, opcional)
- Retorna a leitura do dia atual (útil para debug/teste)

---

### Passo 3: Componente de Inscrição

**Arquivo:** `src/components/parousia/ConvideAlguem.tsx` (modificar)

Adicionar uma seção **antes** dos botões de compartilhar:

```
┌──────────────────────────────────────────────┐
│  Receba a leitura da semana por e-mail       │
│                                              │
│  Toda segunda-feira, você recebe a leitura   │
│  bíblica devocional da semana no seu e-mail. │
│                                              │
│  [Seu e-mail] [Receber]                      │
│                                              │
│  ✓ Sem spam. Cancele quando quiser.          │
└──────────────────────────────────────────────┘
```

- Input de e-mail + botão "Receber"
- Estado de sucesso/erro com feedback visual
- Fetch para `POST /api/parousia/subscribe`
- Após sucesso, mostra mensagem de confirmação

---

### Passo 4: Scheduled Function — Envio Semanal

**Arquivo:** `netlify/functions/daily-reading.ts` (criar)

```ts
// Config: schedule = "0 11 * * 1" (segunda-feira 11h UTC = 7h Porto Velho)
export const config = { schedule: "0 11 * * 1" }
```

**Lógica da function:**

1. Ler `sermoes.json` (via `readFile` ou import estático)
2. Calcular a data da semana atual (segunda-feira)
3. Encontrar o sermão vigente (data mais próxima >= segunda-feira da semana)
4. Extrair o `tema` e os `dias` do roteiro de leitura
5. Buscar todos os subscribers com `active = true`
6. Para cada subscriber, enviar e-mail via Resend com template HTML contendo:
   - Cabeçalho com logo da igreja
   - Referência do sermão (#XX — Título)
   - Tema da semana
   - Leituras de Seg a Sáb em tabela/formatação clara
   - Link para o hotsite
   - Link de unsubscribe
7. Log de quantos e-mails foram enviados

**Limitação Netlify:** 30 segundos de execução. Com Resend (envio assíncrono), dá para enviar ~100 e-mails tranquilamente. Se a lista crescer muito, pode ser necessário migrar para Background Function.

---

### Passo 5: Template HTML do E-mail

**Arquivo:** `src/lib/email-templates/weekly-reading.ts` (criar)

Template com:
- Logo da igreja (via URL pública)
- Cor dourada `#d4af37` da identidade visual
- Título: "Leitura da Semana — Parousia"
- Sermon reference
- Tabela Seg-Sáb com referência bíblica + descrição
- Footer com link de unsubscribe

---

### Passo 6: Configuração do Netlify

**Arquivo:** `netlify.toml` (modificar)

Adicionar:

```toml
[functions."daily-reading"]
  schedule = "0 11 * * 1"
```

Ou usar o config inline na function (preferível — tudo junto com o código).

---

### Passo 7: Variável de Ambiente

Já existe: `RESEND_API_KEY` no `.env` e no Netlify.
Não precisa de nova variável.

---

## Arquivos Envolvidos

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `prisma/schema.prisma` | Modificar | Adicionar `ReadingSubscriber` |
| `src/api.ts` | Modificar | Adicionar 3 rotas (`subscribe`, `unsubscribe`, `today`) |
| `src/components/parousia/ConvideAlguem.tsx` | Modificar | Adicionar formulário de inscrição |
| `netlify/functions/daily-reading.ts` | Criar | Scheduled function para envio semanal |
| `src/lib/email-templates/weekly-reading.ts` | Criar | Template HTML do e-mail |
| `netlify.toml` | Modificar (opcional) | Config schedule (se não usar inline) |

---

## Verificação

1. `npx prisma migrate dev` — migrar banco
2. `npm run dev` — subir servidor local
3. Testar `POST /api/parousia/subscribe` com um e-mail fictício
4. Testar `GET /api/parousia/unsubscribe?token=...`
5. Verificar que o formulário aparece no hotsite e funciona
6. Na Netlify UI, ir em Functions → daily-reading → "Run now" para testar o envio
7. Verificar que o e-mail chega com o template correto
8. Verificar que o link de unsubscribe funciona

---

## Limitações

- **Resend free tier:** 100 e-mails/dia — suficiente para congregação (se crescer, paga $20/mês para 50k)
- **Netlify Scheduled Function:** 30 segundos — suficiente para ~100 e-mails
- **Cron em UTC:** segunda-feira 11h UTC = 7h Porto Velho (ajustar se necessário)
- **Sem personalização por dia:** todos recebem o mesmo e-mail semanal (completo Seg-Sáb)
