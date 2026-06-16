# 🤖 Contexto do Projeto — Guia para Agentes de IA

> **Última atualização:** 2026-06-16
> **Propósito:** Fornecer contexto completo para qualquer agente de codificação que trabalhe neste projeto, eliminando a necessidade de re-análise.

---

## 📋 Visão Geral

**Nome do Projeto:** Portal da Igreja Batista Olaria (IBO) — Porto Velho, Rondônia
**Nome do Pacote:** `ibopvh-portal`
**Repositório:** https://github.com/vulmarjunior/siteibopvh
**URL de Produção:** https://www.ibopvh.com.br (domínio principal, DNS apontando para Netlify)
**URL Reserva Netlify:** https://ibopvh.netlify.app
**Responsável:** Pr. Vulmar Junior
**Idioma do Conteúdo:** Português (pt-BR)
**Idioma do Código:** Inglês (nomes de variáveis/funções) com comentários em português

### O que é
Portal institucional de uma igreja batista, composto por:
1. **Home page** — Identidade, pregações (via YouTube RSS), horários de culto, contribuição (PIX), contato
2. **Relógio de Oração** (`/relogio`) — Sistema de reserva de horários de oração 24h com calendário, e-mail transacional e painel admin
3. **Hotsite Parousia** (`/da-ascensao-a-parousia`) — 🟢 **ATIVO** — Série de mensagens "Da Ascensão à Parousia" com roteiro de leitura interativo
4. **Hotsite Páscoa** (`/pascoa`) — 🟡 **DORMENTE** — Evento sazonal de Páscoa (programação Trevas + Ressurreição). Arquivos preservados para reuso anual.
5. **Hotsite Molda-nos** (`/moldanos`) — 🟡 **DORMENTE** — Conferência de aniversário 57 anos (2026). Arquivos preservados como template para conferências futuras.

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Framework Frontend** | React | ^18.2.0 |
| **Linguagem** | TypeScript | ^5.2.2 |
| **Build Tool** | Vite | ^5.1.6 |
| **CSS Framework** | Tailwind CSS | ^4.0.0 (via `@tailwindcss/vite`) |
| **Roteamento** | React Router DOM | ^6.22.3 |
| **Ícones** | Lucide React | ^0.344.0 |
| **Gráficos** | Recharts | ^2.12.2 |
| **Server** | Express | ^5.2.1 |
| **ORM** | Prisma | ^5.22.0 |
| **Banco de Dados** | PostgreSQL (Supabase) | — |
| **E-mail** | Resend | ^6.10.0 |
| **Calendário (ICS)** | ical-generator | ^10.1.0 |
| **Datas** | dayjs ^1.11.20 + date-fns ^3.3.1 | — |
| **Deploy** | Netlify (Serverless Functions) | — |
| **Serverless** | serverless-http | ^4.0.0 |
| **Dev Runner** | tsx | ^4.21.0 |

### Fontes do Projeto
- **Serif:** `Cinzel` (Google Fonts) — Para títulos
- **Sans:** `Lato` (Google Fonts) — Para corpo de texto
- Carregadas via `<link>` no `index.html`

### Paleta de Cores (Tailwind customizado)
- **`olaria-*`** (50–900): Tons dourados/âmbar — Cor primária da identidade visual
- **`clay-*`** (50–900): Tons terrosos/avermelhados — Cor secundária
- **`stone-850`**: Custom dark — `#1c1917`
- As cores estão definidas no `src/index.css` dentro de `@theme {}`

---

## 📂 Estrutura de Diretórios

```
e:\Site IBO\
├── index.html                    # Entry point HTML (meta tags OG, fontes)
├── server.ts                     # Servidor Express (dev + prod)
├── vite.config.ts                # Config Vite + React + Tailwind
├── tsconfig.json                 # Config TypeScript (strict: false)
├── netlify.toml                  # Build, functions, redirects
├── package.json                  # Dependências e scripts
├── merge-leituras.cjs            # Script para mesclar roteiro de leituras → sermoes.json
├── .env.example                  # Template de variáveis de ambiente
├── .gitignore
│
├── prisma/
│   ├── schema.prisma             # Schema do banco (Reservation, Config, PrayerTheme)
│   └── dev.db                    # SQLite local para dev (não usado em prod)
│
├── src/
│   ├── main.tsx                  # Entry point React
│   ├── App.tsx                   # Router principal (BrowserRouter + Routes)
│   ├── index.css                 # Tailwind v4 config (@theme, animações)
│   ├── api.ts                    # ⚠️ ARQUIVO CRÍTICO — Toda a API Express (787 linhas)
│   ├── constants.tsx             # ⚠️ ARQUIVO GRANDE (91KB) — Conteúdo doutrinário da igreja
│   ├── types.ts                  # Interface DocumentSection
│   │
│   ├── types/
│   │   └── parousia.ts           # Interfaces: Sermon, RoteiroSemanal, LeituraDiaria, etc.
│   │
│   ├── lib/
│   │   ├── liturgical/           # Módulo litúrgico (cálculos, cores, testes)
│   │   │   ├── types.ts
│   │   │   ├── config.ts
│   │   │   ├── calculateEaster.ts
│   │   │   ├── calculateAdvent.ts
│   │   │   ├── getLiturgicalDates.ts
│   │   │   ├── interpolateColor.ts
│   │   │   ├── getLiturgicalState.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   └── parousia-utils.ts     # Helpers: getSermonStatus, YouTube URL parsers
│   │
│   ├── data/
│   │   └── sermoes.json          # Dados dos sermões da série Parousia (37KB)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Barra de navegação global
│   │   │   ├── Footer.tsx        # Rodapé global
│   │   │   └── LiturgicalBookmark.tsx  # Marcador litúrgico na Navbar
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.tsx          # Carrossel hero da home
│   │   │   ├── IdentitySection.tsx
│   │   │   ├── SermonSection.tsx  # Integra YouTube RSS via proxy API
│   │   │   ├── ScheduleSection.tsx
│   │   │   ├── ContributeSection.tsx  # QR Code PIX
│   │   │   └── ContactSection.tsx
│   │   │
│   │   ├── parousia/             # 12 componentes da série Parousia
│   │   │   ├── HeroSerie.tsx
│   │   │   ├── SobreSerie.tsx
│   │   │   ├── MapaPeregrinacao.tsx
│   │   │   ├── ProgramacaoSermoes.tsx
│   │   │   ├── SermonCard.tsx     # Card com checklist de leitura (localStorage)
│   │   │   ├── MensagensDisponiveis.tsx
│   │   │   ├── MateriaisApoio.tsx
│   │   │   ├── ConvideAlguem.tsx
│   │   │   ├── HeaderSerie.tsx
│   │   │   ├── FooterSerie.tsx
│   │   │   ├── FooterParousia.tsx
│   │   │   └── StatusBadge.tsx
│   │   │
│   │   ├── relogio/              # Sistema de Relógio de Oração
│   │   │   ├── PrayerCalendar.tsx
│   │   │   ├── PrayerStats.tsx
│   │   │   └── ReservationModal.tsx
│   │   │
│   │   ├── moldanos/             # 🟡 DORMENTE — Conferência de Aniversário (template reusável)
│   │   │   ├── MoldaNosHero.tsx
│   │   │   ├── MoldaNosSobre.tsx
│   │   │   ├── MoldaNosProgramacao.tsx
│   │   │   ├── MoldaNosPreletor.tsx
│   │   │   └── MoldaNosLocalizacao.tsx
│   │   │
│   │   ├── pascoa/               # 🟡 DORMENTE — Hotsite de Páscoa (reusável anualmente)
│   │   │   ├── PascoaHero.tsx
│   │   │   ├── PascoaSobre.tsx
│   │   │   ├── PascoaProgramacao.tsx
│   │   │   ├── PascoaTenebras.tsx
│   │   │   ├── PascoaRessurreicao.tsx
│   │   │   ├── PascoaLocalizacao.tsx
│   │   │   ├── PascoaFAQ.tsx
│   │   │   ├── PascoaHeader.tsx
│   │   │   ├── PascoaFooter.tsx
│   │   │   └── pascoa-hero.css
│   │   │
│   │   └── documents/
│   │       ├── DocumentCard.tsx
│   │       └── DocumentModal.tsx
│   │
│   ├── pages/
│   │   ├── home/
│   │   │   └── HomePage.tsx      # Compõe seções da home
│   │   ├── parousia/
│   │   │   └── ParousiaPage.tsx  # Compõe seções da série Parousia
│   │   ├── relogio/
│   │   │   ├── RelogioPage.tsx   # Página pública do relógio
│   │   │   └── AdminPage.tsx     # ⚠️ ARQUIVO GRANDE (33KB) — Painel admin completo
│   │   ├── moldanos/
│   │   │   └── MoldaNosPage.tsx
│   │   ├── pascoa-page/
│   │   │   └── PascoaPage.tsx
│   │   └── pascoa/
│   │       └── PascoaPage.tsx    # Duplicata — mesmo arquivo em 2 pastas
│   │
│   └── assets/
│       └── images/               # (vazio, imagens ficam em /public)
│
├── public/
│   ├── robots.txt
│   ├── sitemap.xml               # ⚠️ DESATUALIZADO — Falta /relogio, /moldanos, /da-ascensao-a-parousia
│   ├── favicon.svg               # Favicon principal (SVG com bordas arredondadas e base64 embutido)
│   ├── site.webmanifest          # Manifest PWA (referenciando favicon_ibo)
│   ├── images/
│   │   ├── logo.png              # Logo da igreja (usado no header/footer)
│   │   ├── favicon_ibo/          # Pasta com assets do favicon e fallbacks (ico, png, apple-touch)
│   │   ├── qrcode-pix.svg        # QR Code para doações PIX
│   │   ├── preletor.jpg          # Foto do preletor convidado
│   │   ├── serie-da-ascensao-a-parousia/
│   │   │   ├── arte-feed.png
│   │   │   ├── arte-principal.png
│   │   │   ├── arte-story.png
│   │   │   ├── og-image.jpg / .png
│   │   │   └── thumb-padrao.jpg
│   │   └── ... (outras imagens de eventos)
│   └── docs/                     # PDFs públicos acessíveis via URL
│
├── netlify/
│   └── functions/
│       └── api.ts                # Wrapper serverless do Express para Netlify
│
├── docs/
│   ├── CHANGELOG.md              # Histórico detalhado de mudanças
│   ├── PRD Relogio Oração V4.md  # Documento de requisitos do Relógio
│   ├── e-mail-oração.md
│   ├── hotsite-guide.md
│   ├── archived/                 # Documentos obsoletos (ref. histórica)
│   │   ├── README.md
│   │   ├── hotsite-pascoa.md
│   │   └── PLAN-seo-optimization.md
│   └── planos/
│       └── deploy-netlify.md     # Guia de deploy + variáveis de ambiente
│
└── PAROUSIA/
    ├── # Prompt inicial criação.txt  # Prompt original usado para criar o hotsite
    ├── reoteiro de leitura.md        # Roteiro de leitura semanal (fonte para merge-leituras.cjs)
    └── Artes/                        # Assets visuais da série
```

---

## 🔀 Rotas da Aplicação

| Rota | Componente | Status | Descrição |
|------|-----------|--------|-----------|
| `/` | `HomePage` | 🟢 Ativo | Página principal da igreja |
| `/relogio` | `RelogioPage` | 🟢 Ativo | Relógio de Oração (público) |
| `/relogio/admin` | `AdminPage` | 🟢 Ativo | Painel administrativo (requer senha via query param) |
| `/da-ascensao-a-parousia` | `ParousiaPage` | 🟢 Ativo | Hotsite da série de mensagens |
| `/pascoa` | `PascoaPage` | 🟡 Dormente | Hotsite da Páscoa (sazonal) |
| `/moldanos` | `MoldaNosPage` | 🟡 Dormente | Hotsite conferência de aniversário (sazonal) |

> **Nota:** As rotas dormentes ainda existem no `App.tsx` e são acessíveis por URL direta, mas não possuem links de navegação visíveis (Navbar/Hero) na versão atual.

---

## 🔄 Hotsites Sazonais (Ciclo de Vida)

O portal segue um padrão de **hotsites sazonais** ligados ao calendário litúrgico e eventos da igreja. Esses hotsites são criados para um evento específico e, após o encerramento, são **desativados da navegação principal mas preservados integralmente no repositório** para reaproveitamento.

### Status dos Hotsites

| Hotsite | Slug | Status Atual | Criação | Propósito de Reuso |
|---------|------|-------------|---------|-------------------|
| **Parousia** | `/da-ascensao-a-parousia` | 🟢 Ativo | Jun/2026 | Série em andamento |
| **Páscoa** | `/pascoa` | 🟡 Dormente | Abr/2026 | Reativado anualmente na Semana Santa, com atualização de datas e programação |
| **Molda-nos** | `/moldanos` | 🟡 Dormente | Mai/2026 | Template para conferências de aniversário futuras (atualizar ano, tema, preletor, programação) |

### O que significa "Dormente"?
- ✅ A rota ainda existe no `App.tsx` (acessível por URL direta)
- ✅ Todos os componentes, páginas e assets permanecem no repositório
- ❌ Não há link na Navbar nem slide no carrossel da Home
- ❌ Conteúdo pode estar com datas desatualizadas

### Ciclo de ativação/desativação

**Para DESATIVAR um hotsite (após o evento):**
1. Remover o slide do carrossel em `src/components/home/Hero.tsx`
2. Remover o link da `src/components/layout/Navbar.tsx`
3. Remover banner promocional de `src/pages/home/HomePage.tsx` (se houver)
4. **NÃO remover** a rota do `App.tsx`
5. **NÃO excluir** componentes, páginas ou assets
6. Registrar a desativação no `docs/CHANGELOG.md`

**Para REATIVAR um hotsite (no próximo ciclo):**
1. Atualizar datas, tema, preletor e programação nos componentes
2. Atualizar imagens/artes em `public/images/` se necessário
3. Readicionar slide no carrossel `Hero.tsx`
4. Readicionar link na `Navbar.tsx`
5. Adicionar banner promocional na `HomePage.tsx` se desejado
6. Atualizar meta tags OG no `index.html` se for o destaque principal
7. Registrar a reativação no `docs/CHANGELOG.md`

### ⚠️ Regra para Agentes
> **NUNCA excluir arquivos de hotsites dormentes.** Eles são patrimônio do projeto e serão reutilizados. Se o pastor solicitar "remover" um hotsite, isso significa apenas desativar a navegação (links, banners), **não** deletar código ou assets.

---

## 🔌 API REST (Express)

Todas as rotas são definidas em `src/api.ts` e montadas em `/api`. O Netlify redireciona `/api/*` para as Serverless Functions.

### Rotas Públicas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/debug` | Debug do banco (mascarado) |
| `GET` | `/api/youtube-proxy` | Proxy RSS do YouTube (`?channelId=...`) |
| `GET` | `/api/relogio/slots` | Slots de oração por data (`?date=YYYY-MM-DD`) |
| `POST` | `/api/relogio/reserve` | Criar reserva de oração (envia e-mail + ICS) |
| `GET` | `/api/relogio/cancel` | Cancelar reserva (`?token=...`) |
| `GET` | `/api/relogio/stats` | Estatísticas do relógio (intercessores, cobertura, timeline) |
| `GET` | `/api/relogio/themes` | Temas de oração ativos |

### Rotas Admin (requer `password` no body ou query)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/admin/seed` | Recriar dados iniciais |
| `GET` | `/api/admin/reservations` | Listar reservas por data |
| `POST` | `/api/admin/update/:id` | Atualizar reserva |
| `POST` | `/api/admin/cancel/:id` | Excluir reserva (hard delete) |
| `GET` | `/api/admin/export/csv` | Exportar reservas em CSV |
| `GET/POST` | `/api/admin/config` | Ler/atualizar configurações |
| `GET/POST` | `/api/admin/themes` | CRUD de temas de oração |
| `DELETE` | `/api/admin/themes/:id` | Excluir tema |
| `POST` | `/api/admin/test-email` | Enviar e-mail de teste |

### Autenticação Admin
- **Método:** Senha simples via `ADMIN_PASSWORD` (env var)
- **Transmissão:** `password` no body (POST) ou query string (GET)
- ⚠️ Não há sistema de sessão/JWT — cada requisição envia a senha

---

## 🗄 Banco de Dados (Prisma + PostgreSQL)

### Provider
- **Produção:** PostgreSQL via Supabase
- **Desenvolvimento:** SQLite local (`prisma/dev.db`) — mas o schema está configurado para PostgreSQL

### Modelos

```prisma
model Reservation {
  id              Int       @id @default(autoincrement())
  date            String    // "YYYY-MM-DD"
  timeStart       String    // "HH:00"
  timeEnd         String    // "HH:00"
  name            String
  email           String
  prayerThemes    String?   // JSON string array
  personalRequest String?
  cancelToken     String    @unique  // Token para cancelamento via e-mail
  reservedAt      DateTime  @default(now())
  cancelledAt     DateTime?          // Soft-delete
  @@index([date, timeStart])
}

model Config {
  key   String @id
  value String
}

model PrayerTheme {
  id     Int     @id @default(autoincrement())
  label  String
  active Boolean @default(true)
  order  Int     @default(0)
}
```

### Configs Conhecidas (tabela Config)
- `slot_capacity` — Capacidade máxima de intercessores por slot (padrão: `"4"`)
- `email_encouragement` — Texto de encorajamento no e-mail de confirmação

---

## ⚙️ Variáveis de Ambiente

```env
DATABASE_URL=         # URL de conexão Supabase (pooling)
DIRECT_URL=           # URL de conexão direta Supabase
RESEND_API_KEY=       # Chave API do Resend para e-mails
ADMIN_PASSWORD=       # Senha do painel admin
APP_URL=              # URL base (ex: https://ibopvh.netlify.app)
```

- **Dev:** Arquivo `.env.local` (carregado via `tsx --env-file=.env.local`)
- **Prod:** Configurado no dashboard do Netlify

---

## 🚀 Scripts NPM

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor dev com Express + Vite middleware (`tsx --env-file=.env.local server.ts`) |
| `npm run build` | Compila TypeScript + Vite build (`tsc && vite build`) |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | ESLint |
| `npm run start` | Inicia servidor em modo produção |

---

## 🌐 Deploy (Netlify)

### Configuração (`netlify.toml`)
- **Build:** `npx prisma generate && npm run build`
- **Publish:** `dist`
- **Functions bundler:** esbuild
- **Redirects:**
  - `/api/*` → `/.netlify/functions/api/:splat` (status 200)
  - `/*` → `/index.html` (status 200, SPA fallback)

### Serverless Function
- `netlify/functions/api.ts` — Wrapper que envolve o router Express com `serverless-http`
- Faz seeding do banco no primeiro request (flag `seeded`)

### Endpoints de Verificação
- Health: `https://ibopvh.netlify.app/api/health`
- Debug: `https://ibopvh.netlify.app/api/debug`
- Admin: `https://ibopvh.netlify.app/relogio/admin?password=[ADMIN_PASSWORD]`

---

## ⚠️ Armadilhas e Pontos de Atenção

### Críticos
1. **`src/api.ts` é monolítico (787 linhas)** — Toda a lógica backend está num único arquivo. Inclui rotas, lógica de negócio, templates HTML de e-mail e seed de dados.
2. **`src/constants.tsx` é enorme (91KB, 642 linhas)** — Contém todo o conteúdo doutrinário da igreja em JSX. Qualquer alteração deve manter integridade teológica. **Nunca editar o conteúdo teológico sem instrução explícita do pastor.**
3. **`AdminPage.tsx` é denso (33KB)** — Todo o painel admin está num único componente.
4. **Autenticação admin é por senha simples** — Sem JWT, sem sessões. A senha vai em query params nos GETs.
5. **Timezone:** O Relógio de Oração usa `America/Porto_Velho` (UTC-4, sem horário de verão). Dayjs com plugins `utc` e `timezone`.
6. **ICS com floating time:** Os eventos de calendário usam `floating: true` para evitar problemas de fuso em clientes de e-mail.

### Arquitetônicos
7. **Tailwind v4** — Usa a nova sintaxe `@theme {}` no CSS (não `tailwind.config.js`). O plugin é `@tailwindcss/vite`.
8. **Prisma schema diz `postgresql`** mas há um `dev.db` (SQLite) local — O SQLite só funciona se mudar o provider.

### Dados
12. **Sermões da série Parousia** estão em `src/data/sermoes.json` — Para atualizar roteiros de leitura, editar `PAROUSIA/reoteiro de leitura.md` e rodar `node merge-leituras.cjs`.
13. **YouTube RSS** é fetched via proxy server-side (`/api/youtube-proxy`) para evitar CORS.

### Litúrgico
14. **Marcador Litúrgico Bookmark** em `src/lib/liturgical/` — Sistema modular com 4 macroestações (Advento, Natal, Páscoa, Tempo Comum) e 11 fases internas. O Tríduo Pascal tem prioridade máxima: Sexta-feira da Paixão (vermelho), Sábado de Aleluia (preto), Domingo de Páscoa (dourado). Transições graduais de cor entre estações via interpolação RGB. Fuso horário `America/Porto_Velho` normalizado para meia-noite local. 52 testes unitários com Vitest. Para testar outras datas, passe um `Date` arbitrário para `getLiturgicalState(date)`.

---

## 🧩 Padrões e Convenções

### Organização de Componentes
- **Agrupamento por feature/página:** `components/home/`, `components/parousia/`, etc.
- **Pages compõem components:** Cada `*Page.tsx` importa e organiza os componentes da feature.
- **Sem state management global** — Estado local com `useState`, persistência com `localStorage` (checklist de leitura).

### Estilização
- **Tailwind CSS v4** com classes inline nos componentes
- **Cores customizadas:** `olaria-*`, `clay-*` (definidas em `@theme` no `index.css`)
- **Animações customizadas:** `fade-in-up`, `fade-in-left`, `fade-in` (definidas em `@theme`)
- **Design pattern:** Fundo claro (`white`/`stone-50`), textos escuros, acentos dourados (`olaria`)

### Naming
- **Componentes:** PascalCase (`SermonCard.tsx`)
- **Páginas:** PascalCase com sufixo `Page` (`ParousiaPage.tsx`)
- **CSS:** Apenas `index.css` global + `pascoa-hero.css` isolado
- **Tipos:** Arquivo `types/parousia.ts` para a feature Parousia, `types.ts` raiz para tipos gerais

### API
- **Router Express** exportado como `apiRouter` de `src/api.ts`
- **Prisma client** inicializado com lazy Proxy pattern (conexão sob demanda)
- **Resend client** inicializado com lazy pattern (`getResend()`)
- **Respostas de erro** em português para o usuário, inglês para logs

---

## 📊 Features Detalhadas

### Relógio de Oração
- Calendário 24h com slots horários (00:00–23:00)
- Capacidade configurável por slot (padrão: 4 pessoas)
- Reserva por 1–7 dias consecutivos
- Verificação de duplicata (mesmo e-mail + mesmo slot + mesmo dia)
- E-mail de confirmação com:
  - Detalhes da reserva
  - Arquivo `.ics` para adicionar ao calendário
  - Links de cancelamento individuais por dia
  - Palavra de encorajamento configurável
- Estatísticas em tempo real: intercessores atuais, cobertura diária, slots cheios
- Admin: CRUD completo, exportação CSV, configuração de temas e capacidade

### Série Parousia
- Cards de sermões com status automático: `em_breve` / `pregado_materiais_em_breve` / `disponivel`
- Roteiro de leitura semanal interativo (checklist salvo em `localStorage`)
- Materiais de apoio: PDFs, artes (feed/story) para download
- Integração YouTube (embed + link)

### Home Page
- Hero com carrossel de slides
- Seção de pregações via RSS do YouTube
- Horários de culto
- QR Code PIX para contribuição
- Documentos doutrinários em modais com accordion

### Indicador Litúrgico (Navbar)
- Marcador de página (bookmark) na Navbar com cor dinâmica baseada na estação litúrgica
- 4 macroestações: Advento (roxo→azul), Natal (azul), Páscoa (cinza→vermelho→preto→dourado), Tempo Comum (verde)
- Tríduo Pascal com cores especiais: Sexta-feira da Paixão (vermelho), Sábado de Aleluia (preto), Domingo de Páscoa (dourado)
- Transições graduais de cor entre estações (interpolação RGB)
- Tooltip com fase específica ao hover (ex: "Quaresma", "Semana Santa", "Sexta-feira da Paixão")
- Componente em `src/components/layout/LiturgicalBookmark.tsx`
- Módulo litúrgico em `src/lib/liturgical/` com 52 testes unitários (Vitest)
- Fuso horário: `America/Porto_Velho` (normalizado para meia-noite local)

---

## 📝 Changelog Resumido

| Data | Mudança |
|------|---------|
| 2026-06-16 | Sermão 01 da Parousia disponível com vídeo e thumbnail; correção visibilidade das tags de status |
| 2026-06-12 | Jornada do Ano Litúrgico: timeline 4 estações macro na Navbar |
| 2026-06-11 | Organização: limpeza de lixo, duplicatas e docs obsoletos |
| 2026-06-11 | Indicador de calendário litúrgico na Navbar |
| 2026-06-08 | Hotsite "Da Ascensão à Parousia" + roteiro de leitura |
| 2026-05-18 | Hotsite "Molda-nos" (conferência 57 anos) |
| 2026-04-20 | Deploy inicial (Home + Relógio de Oração + Páscoa) |

> **Changelog completo:** `docs/CHANGELOG.md`

---

## 🔧 Instruções para Novos Agentes

### Antes de codificar
1. Leia este arquivo (`agente.md`)
2. Consulte `docs/CHANGELOG.md` para contexto histórico
3. Verifique os tipos em `src/types/parousia.ts` e `src/types.ts`
4. Para features do Relógio, leia `docs/PRD Relogio Oração V4.md`

### Ao adicionar hotsites/eventos
1. Verificar se já existe um hotsite dormente similar (ex: Páscoa, conferência) — **reutilizar** em vez de criar do zero
2. Se reutilizando: atualizar datas, tema, preletor e programação nos componentes existentes
3. Se criando novo: criar componentes em `src/components/[feature]/` e página em `src/pages/[feature]/[Feature]Page.tsx`
4. Adicionar rota em `src/App.tsx` (se nova)
5. Adicionar slide no carrossel do `Hero.tsx`
6. Adicionar link na `Navbar.tsx`
7. Atualizar `sitemap.xml` e meta tags OG se necessário
8. Registrar no `docs/CHANGELOG.md`

### Ao desativar hotsites após eventos
1. Seguir o ciclo documentado na seção "🔄 Hotsites Sazonais"
2. **NUNCA excluir arquivos** — apenas remover links de navegação
3. Registrar a desativação no `docs/CHANGELOG.md`

### Ao modificar a API
1. Toda a lógica está em `src/api.ts`
2. Rotas admin precisam verificar `ADMIN_PASSWORD`
3. Usar `dayjs` com timezone `America/Porto_Velho` para datas
4. O mesmo router é usado pelo Express (dev) e Netlify Functions (prod)
5. Testar localmente com `npm run dev`

### Ao modificar conteúdo doutrinário
- O arquivo `src/constants.tsx` contém textos sagrados para a congregação
- **NUNCA alterar conteúdo teológico** sem instrução explícita
- Manter a estrutura `AccordionItem` + `RefBlock`

---

## 🗺 Diagrama de Dependência Simplificado

```
index.html
  └── src/main.tsx
       └── src/App.tsx (Router)
            ├── HomePage ← components/home/* ← constants.tsx (docs da igreja)
            ├── ParousiaPage ← components/parousia/* ← data/sermoes.json ← types/parousia.ts
            ├── RelogioPage ← components/relogio/* ← API (fetch /api/relogio/*)
            ├── AdminPage ← API (fetch /api/admin/*)
            ├── PascoaPage ← components/pascoa/*
            └── MoldaNosPage ← components/moldanos/*

server.ts
  └── src/api.ts (Express Router)
       ├── Prisma Client ← prisma/schema.prisma ← PostgreSQL (Supabase)
       ├── Resend Client ← RESEND_API_KEY
       └── ical-generator

netlify/functions/api.ts
  └── src/api.ts (reutiliza o mesmo router)
       └── serverless-http wrapper
```
