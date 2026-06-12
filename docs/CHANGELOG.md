# Changelog - IBOPVH Portal

## [Em Desenvolvimento]

### Adicionado
- Favicon com bordas arredondadas e fundo dourado/oliva (`favicon.svg`) com imagem PNG embutida em Base64 para máxima compatibilidade e contorno redondo em todas as resoluções de navegadores.
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
