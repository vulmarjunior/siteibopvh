# Changelog - IBOPVH Portal

## [Em Desenvolvimento]

---

## 2026-04-20 - Deploy Inicial Production

### Adicionado
- Portal da Igreja Batista Olaria (Vila Hormizil)
- Sistema de Relógio de Oração com reservas online
- Página Home com seções: Identidade, Pregação, Horários, Contribuição, Contato
- Hotsite de Páscoa
- Integração com Supabase (banco de dados PostgreSQL)
- Integração com Resend (e-mails transacionais)
- Deploy automático via Netlify

### Configuração
- **URL Production:** https://ibopvh.netlify.app
- **Banco:** Supabase (PostgreSQL)
- **E-mail:** Resend API

### Variáveis de Ambiente (Production)
- `DATABASE_URL` - Supabase Connection String
- `DIRECT_URL` - Supabase Direct URL
- `RESEND_API_KEY` - Resend API Key
- `ADMIN_PASSWORD` - Senha administrativa
- `APP_URL` - URL do aplicação

---

## Releases Anteriores

### v0.0.0 (??)
- Versão inicial do projeto
