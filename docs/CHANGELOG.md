# Changelog - IBOPVH Portal

## [Em Desenvolvimento]

### 2026-07-18 — Notificação Semanal de Leitura (Parousia)

#### Adicionado
- Formulário de inscrição para receber leituras semanais por e-mail no hotsite Parousia (`ConvideAlguem.tsx`).
- Modelo Prisma `ReadingSubscriber` com migração manual aplicada via pooler Supabase (porta 6543).
- Rotas API: `POST /api/parousia/subscribe`, `GET /api/parousia/unsubscribe`, `GET /api/parousia/today`.
- Scheduled Function `netlify/functions/weekly-reading.ts` — envio toda segunda-feira às 7h (Porto Velho).
- Template HTML de e-mail (`src/lib/email-templates/weekly-reading.ts`) com identidade visual Parousia.
- Envio imediato da leitura atual no ato da inscrição (não precisa esperar segunda-feira).
- `migration_lock.toml` adicionado ao repositório.

#### Observação técnica
- `prisma migrate deploy` não funciona no Netlify com Supabase (porta 5432 bloqueada). Migrations devem ser aplicadas via script com `$executeRaw` ou pelo SQL Editor do Supabase.

### 2026-07-12 — Hotsite EBF 2026\n\n#### Adicionado\n- Hotsite público **Em Busca do Maior Tesouro** em `/ebf`, para a EBF de 18/07/2026 às 16h.\n- Formulário individual por criança, máscara de telefone e classificação automática por faixa etária/cor.\n- Persistência das inscrições no PostgreSQL/Supabase e aviso por e-mail via Resend.\n- Painel protegido em `/ebf/admin`, com indicadores, pesquisa, filtros, WhatsApp e cancelamento.\n- Exportações em CSV e PDF A4 estruturado por grupos de cor.\n- Banner da EBF no carrossel da página inicial, com link para o hotsite.\n- Modelo Prisma `EbfRegistration`, migração SQL e arte em `public/images/ebf-2026-banner.jpeg`.\n\n#### Corrigido\n- Confirmação visual após envio bem-sucedido do formulário.\n- Acesso ao painel administrativo quando ainda não existem inscrições.\n\n#### Decisão de navegação\n- O acesso público à EBF é feito pelo slide em destaque na página inicial; não foi criado item adicional na Navbar para evitar sobrecarregar o menu.

### Adicionado
- Sermão 01 da série Parousia ("O Rei que Partiu para Reinar") disponível com vídeo (YouTube) e thumbnail
- Sermão 02 da série Parousia ("A Coluna de Fogo Desce") disponível com vídeo (YouTube: `a867Y4Yer48`) e thumbnail
- `public/parousia/artes/sermão-01.jpg` — thumbnail do sermão 01
- `public/parousia/artes/sermão-02.jpg` — thumbnail do sermão 02
- `src/components/parousia/VideoModal.tsx` — modal com player YouTube carregado sob demanda
- `src/components/parousia/MessageCard.tsx` — card compacto com thumbnail + play overlay para a grid de mensagens

### Corrigido
- Tags de status dos sermões no hotsite Parousia agora com fundo escuro (`bg-[#0f1115]/80`) para visibilidade sobre thumbnails claras, tanto "Pregado — materiais em breve" quanto "Disponível"

### Modificado
- `src/data/sermoes.json` — youtubeId, youtubeUrl e artes.thumb do sermão 01 preenchidos
- `src/components/parousia/MensagensDisponiveis.tsx` — refatorado para grid de cards com thumbnail + modal de vídeo (evita carregar todos os iframes simultaneamente com 23 sermões)
- `src/components/parousia/StatusBadge.tsx` — fundo opaco nas tags de status
- `agente.md` — data de última atualização

### Favicon com bordas arredondadas e fundo dourado/oliva (`favicon.svg`) com imagem PNG embutida em Base64 para máxima compatibilidade e contorno redondo em todas as resoluções de navegadores.
- Arquivo `site.webmanifest` em `public/` para configuração PWA e cor do tema da barra de ferramentas do navegador.
- Tags de favicon específicas para dispositivos móveis (`apple-touch-icon`) e fallbacks de imagem PNG/ICO no `index.html`.
- **Marcador Litúrgico Bookmark** — Ícone de marcador de página na Navbar com cores litúrgicas dinâmicas e 4 macroestações (Advento, Natal, Páscoa, Tempo Comum). Tríduo Pascal com cores especiais: vermelho (Sexta-feira da Paixão), preto (Sábado de Aleluia), dourado (Domingo de Páscoa). Transições graduais de cor entre estações. Tooltip com fase específica ao hover.
- **Módulo litúrgico** (`src/lib/liturgical/`) — Sistema modular com cálculo automático de datas (Computus), interpolação de cores, e 52 testes unitários com Vitest.
- `docs/archived/` com README para documentos obsoletos mantidos como referência histórica.
- **Vitest** instalado como framework de testes unitários.

### Modificado
- `index.html` para substituir o ícone padrão anterior pelo novo sistema de favicon arredondado.
- `src/components/layout/Navbar.tsx` — Integra o componente `LiturgicalBookmark` no menu desktop e mobile.
- `public/sitemap.xml` — Domínio corrigido para `ibopvh.com.br`; adicionadas rotas `/relogio`, `/moldanos`, `/da-ascensao-a-parousia`.
- `agente.md` — Removidas notas sobre `consts.txt` e duplicata PascoaPage (resolvidos).

### Removido
- `consts.txt` — Arquivo lixo com 274 linhas de "const ".
- `src/pages/pascoa/PascoaPage.tsx` — Duplicata exata de `src/pages/pascoa-page/PascoaPage.tsx`.
- `src/components/layout/LiturgicalTimeline.tsx` — Substituído por `LiturgicalBookmark.tsx`.
- `src/lib/liturgical-calendar.ts` — Substituído pelo módulo `src/lib/liturgical/`.
- `docs/PLAN-seo-optimization.md` — Movido para `docs/archived/` (plano já executado).
- `docs/hotsite-pascoa.md` — Movido para `docs/archived/` (referenciava Next.js, implementado em Vite/React).

### Arquivos Criados
- `src/lib/liturgical/types.ts` — Tipos: MacroSeason, LiturgicalPhase, LiturgicalState, LiturgicalDates.
- `src/lib/liturgical/config.ts` — Cores litúrgicas, janelas de transição, labels de estações e fases.
- `src/lib/liturgical/calculateEaster.ts` — Algoritmo de Computus + datas derivadas (Quaresma, Semana Santa, Pentecostes).
- `src/lib/liturgical/calculateAdvent.ts` — Cálculo do Domingo de Advento.
- `src/lib/liturgical/getLiturgicalDates.ts` — Agregador de todas as datas litúrgicas de um ano.
- `src/lib/liturgical/interpolateColor.ts` — Interpolação RGB para transições graduais de cor.
- `src/lib/liturgical/getLiturgicalState.ts` — Lógica principal com prioridade do Tríduo Pascal e transições graduais.
- `src/lib/liturgical/index.ts` — Exportações públicas do módulo.
- `src/lib/liturgical/__tests__/` — 52 testes unitários (calculateEaster, interpolateColor, getLiturgicalState).
- `src/components/layout/LiturgicalBookmark.tsx` — Componente do marcador litúrgico com ícone Bookmark (lucide-react).
- `docs/archived/README.md` — Explica cada documento arquivado.

---

## 2026-06-08 - Hotsite Da Ascensão à Parousia (Série de Mensagens)

### Adicionado
- Hotsite da série de mensagens "Da Ascensão à Parousia" em `/da-ascensao-a-parousia`
- Roteiro de leitura semanal interativo com checklist persistido localmente (`localStorage`) dentro dos cards dos sermões
- Seção de "Materiais de Apoio" para download de guias de leitura em PDF e pacote de artes de divulgação (Feed e Story)
- Novo slide promocional da série no carrossel da homepage (direcionando para o hotsite)
- Integração de script NodeJS `merge-leituras.cjs` para processamento automático do guia de leitura em markdown e mesclagem em `sermoes.json`
- Tags Open Graph (OG) customizadas em `index.html` com imagem de feed otimizada para pré-visualização de link (link preview) no WhatsApp

### Modificado / Removido
- Removido o banner promocional do aniversário de 57 anos ("Molda-nos") da homepage principal (com preservação de todos os seus arquivos estruturais no repositório para reaproveitamento nos próximos anos)
- Removido o link direto "Molda-nos" da barra de navegação (Navbar) principal
- Removido o slide antigo da série de "Família" do carrossel da homepage principal

### Arquivos Criados
- `src/pages/parousia/ParousiaPage.tsx`
- `src/components/parousia/HeroSerie.tsx`
- `src/components/parousia/SobreSerie.tsx`
- `src/components/parousia/MapaPeregrinacao.tsx`
- `src/components/parousia/ProgramacaoSermoes.tsx`
- `src/components/parousia/SermonCard.tsx`
- `src/components/parousia/MensagensDisponiveis.tsx`
- `src/components/parousia/MateriaisApoio.tsx`
- `src/components/parousia/ConvideAlguem.tsx`
- `src/components/parousia/FooterParousia.tsx`
- `src/components/parousia/FooterSerie.tsx`
- `src/components/parousia/HeaderSerie.tsx`
- `src/components/parousia/StatusBadge.tsx`
- `src/types/parousia.ts`
- `src/lib/parousia-utils.ts`
- `src/data/sermoes.json`
- `merge-leituras.cjs`

### Arquivos Modificados
- `src/App.tsx` — Adicionada a rota `/da-ascensao-a-parousia`
- `src/components/layout/Navbar.tsx` — Removido o link de aniversário e adaptado estilo geral
- `src/pages/home/HomePage.tsx` — Removido banner de aniversário
- `src/components/home/Hero.tsx` — Atualizado carrossel (removido slide de família, adicionado slide Parousia)
- `index.html` — Adicionada descrição SEO e metatags para compartilhamento no WhatsApp
- `netlify.toml` — Conflito resolvido para o build de produção com Prisma
- `package.json` — Conflito resolvido para o script dev (`--env-file`)

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
