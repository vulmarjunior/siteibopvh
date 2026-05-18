# Changelog - IBOPVH Portal

## [Em Desenvolvimento]

---

## 2026-05-18 - Hotsite Molda-nos (Conferência de Aniversário)

### Adicionado
- Hotsite da Conferência "Molda-nos" em `/moldanos`
- Banner promocional na HomePage com link para o hotsite
- Link "Molda-nos" no menu principal do portal
- Seções do hotsite: Hero, Sobre, Programação (3 dias), Preletor, Localização
- Meta tags OG para compartilhamento nas redes sociais

### Conteúdo
- **Tema:** "Molda-nos para servir no Reino" — Marcos 10:45
- **Data:** 05, 06 e 07 de junho de 2026, às 19:00
- **Preletor:** Rev. Dr. David Bowman Riker, Ph.D. (Pastor-Presidente da PIB Pará)
- **Programação:**
  - Dia 1: "Moldados para serviço submisso" (Mt 6:16-18)
  - Dia 2: "Moldados para serviço agradável" (Mt 1:21)
  - Dia 3: "Moldados para serviço perfeito" (Hb 6:1)
- **Celebração:** 57 anos da Igreja Batista Olaria

### Arquivos Criados
- `src/pages/moldanos/MoldaNosPage.tsx`
- `src/components/moldanos/MoldaNosHero.tsx`
- `src/components/moldanos/MoldaNosSobre.tsx`
- `src/components/moldanos/MoldaNosProgramacao.tsx`
- `src/components/moldanos/MoldaNosPreletor.tsx`
- `src/components/moldanos/MoldaNosLocalizacao.tsx`

### Arquivos Modificados
- `src/App.tsx` — nova rota `/moldanos`
- `src/components/layout/Navbar.tsx` — link "Molda-nos" no menu
- `src/pages/home/HomePage.tsx` — banner promocional

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
