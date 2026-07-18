# Análise Completa — agente.md e Hotsite Parousia

**Data:** 2026-07-18

---

## PARTE 1: Análise do agente.md

### Pontos Fortes

1. **Documentação extrema**: ~576 linhas cobrindo visão geral, stack, estrutura de diretórios, rotas, API, banco de dados, variáveis de ambiente, scripts, deploy, armadilhas, convenções, features detalhadas e diagrama de dependências.
2. **Ciclo de vida de hotsites sazonais**: Seção "🔄 Hotsites Sazonais" muito bem pensada — regras claras de ativação/desativação sem perder código, com a regra de ouro "NUNCA excluir arquivos de hotsites dormentes".
3. **Armadilhas documentadas**: Lista problemas reais (monolitos de 787 e 91KB, auth por query param, schema Prisma com provider inconsistente).
4. **Diagrama de dependências**: Diagrama no final para entender rapidamente o fluxo de dados.

### Problemas Encontrados

#### 1. Strings de quebra de linha com `\n` literais (BUG)
Nas linhas 25, 234, 249, 250, 505 — há `\n` literais dentro de strings Markdown que não renderizam como quebras de linha. Aparecem como texto literal.

**Afetado:** Linhas 25, 234, 249, 250, 505.

#### 2. Informações desatualizadas
- Linha 192 menciona `og-image.jpg / .png` — verificar se existem em `public/images/serie-da-ascensao-a-parousia/`.
- Linha 184 diz o `sitemap.xml` está desatualizado — vale corrigir ou listar as rotas faltantes explicitamente.
- Changelog mais recente é 2026-07-12, e hoje é 18/07/2026 — pode estar defasado por uma semana.

#### 3. Segurança da autenticação admin
A auth é por senha simples via query param. Um link com `?password=X` pode vazar em logs do servidor, analytics, ou barra de endereço do navegador.

#### 4. `constants.tsx` de 91KB é um risco
Um único arquivo de 91KB com conteúdo doutrinário em JSX é difícil de manter e testar. Mais seguro migrar para formato estruturado (JSON/MDX) e renderizar dinamicamente.

#### 5. `api.ts` monolítico (787 linhas)
Refatoração em módulos (`relogio.routes.ts`, `admin.routes.ts`, `youtube.routes.ts`) facilitaria manutenção e testes.

#### 6. Caminho do diretório inconsistente
Linha 66 mostra `e:\Site IBO\` como caminho raiz, mas o workspace real é `C:\Users\vulma\OneDrive\Documents\GitHub\siteibopvh`.

#### 7. Falta de testes documentados
52 testes unitários no módulo litúrgico, mas não há seção sobre como rodar testes nem script `test` documentado.

#### 8. Nenhuma menção a `.env` / `.env.local`
O `.env.example` existe mas o documento não lista todas as variáveis necessárias nem quais são obrigatórias vs opcionais.

### Avaliação Geral do agente.md

| Aspecto | Avaliação |
|---------|-----------|
| Cobertura | Excelente — quase tudo documentado |
| Precisão | Boa, com alguns dados potencialmente defasados |
| Utilidade para agentes | Muito alta — elimina necessidade de re-análise |
| Manutenção | Requer atualização periódica (changelog, sitemap, status) |
| Riscos não mitigados | Auth frágil, monolitos, `\n` literais no Markdown |

---

## PARTE 2: Análise do Hotsite Parousia

### Visão Geral

O hotsite é um site dedicado a uma série de **23 sermões** que percorrem Atos, as Epístolas e o Apocalipse. A série vai de **14/06/2026 a 29/11/2026** (~26 semanas). A página é autocontida — tem seu próprio header, footer e navegação interna via scroll, sem depender do layout do portal principal.

### Arquitetura de Componentes (14 arquivos)

```
ParousiaPage
  ├── HeaderSerie         — Navbar fixa própria com links âncora
  ├── HeroSerie           — Hero fullscreen com imagem de fundo e 3 CTAs
  ├── SobreSerie          — Seção textual (citação doutrinária)
  ├── MapaPeregrinacao    — Timeline visual de 8 etapas (desktop + mobile)
  ├── ProgramacaoSermoes  — Grid de SermonCard (dados do sermoes.json)
  │   └── SermonCard      — Card completo: thumbnail, status, leituras (localStorage)
  │       └── StatusBadge — Badge de status colorido
  ├── MensagensDisponiveis — Grid de mensagens com vídeo (filtra por status)
  │   └── MessageCard     — Card clicável com overlay de play
  │   └── VideoModal      — Modal com iframe YouTube + ESC para fechar
  ├── MateriaisApoio      — Grid de materiais para download (hardcoded)
  ├── ConvideAlguem       — WhatsApp share + copiar link
  ├── FooterSerie         — CTA "Ver próximo sermão"
  └── FooterParousia      — Footer completo da igreja (duplicado do portal)
```

**Dados:** `src/data/sermoes.json` (1313 linhas, 23 sermões) + `src/types/parousia.ts` (4 interfaces) + `src/lib/parousia-utils.ts` (5 funções utilitárias).

### Fluxo de Dados

1. `sermoes.json` é importado por `ProgramacaoSermoes` e `MensagensDisponiveis`
2. `getSermonStatus()` calcula status dinamicamente baseado na data + existência de material
3. `SermonCard` salva/carga progresso de leitura em `localStorage` por sermão
4. `VideoModal` recebe URL de embed calculada por `getYoutubeEmbedUrl()`
5. O script `merge-leituras.cjs` sincroniza o roteiro de leitura do markdown para o JSON

### Status dos 23 Sermões

| Status | Qtd | Sermões |
|--------|-----|---------|
| **Disponível** (com vídeo YouTube) | **2** | #01 (14/06), #02 (21/06) |
| **Pregado — materiais em breve** | 0 | — |
| **Em breve** (data futura) | **21** | #03 a #23 |

Apenas 2 dos 23 sermões têm `youtubeId` preenchido. Os outros 21 são todos futuros.

### Problemas Encontrados

#### 1. Thumbs individuais apontam para caminhos inconsistentes
Sermões #01 e #02 referenciam `/parousia/artes/sermão-01.jpg` e `/parousia/artes/sermão-02.jpg`. Esses arquivos existem em `public/parousia/artes/`, mas estão numa pasta separada das artes da série (`public/images/serie-da-ascensao-a-parousia/`). Funciona mas é confuso para manutenção.

#### 2. `MateriaisApoio` está completamente hardcoded
O componente lista 4 materiais com URLs fixas (cronograma.pdf, guia-leituras.pdf, arte-feed.png, arte-story.png). Todos existem em `public/`. Porém, **nenhum dos 23 sermões tem `materiais` preenchidos** no JSON. O componente ignora o campo `materiais` do JSON e usa lista estática.

#### 3. `FooterSerie.tsx` — botão enganoso
Botão "Ver próximo sermão" sempre vai para `#programacao`. Deveria scrollar para o próximo card ou para `#mensagens`.

#### 4. `VideoModal.tsx:51` — `frameBorder` deprecated
Usa `frameBorder="0"`, que é deprecated. O correto é `style={{ border: 0 }}`.

#### 5. `MapaPeregrinacao` — timeline não reflete progresso real
Timeline mostra 8 etapas fixas (Ascensão → Nova Jerusalém) sem indicar visualmente em qual etapa a série está. Sem conexão com os sermões.

#### 6. Meta tags OG estáticas
Título é setado via `document.title`, mas as meta tags OG no `index.html` são estáticas. O `og-image.jpg` existe mas não é referenciado dinamicamente para compartilhamento.

#### 7. Cast `as Sermon[]` sem validação
Tanto `ProgramacaoSermoes` quanto `MensagensDisponiveis` fazem `sermoesData as Sermon[]` — cast direto sem validação. Erros só aparecem em runtime.

#### 8. `FooterParousia` é clone do footer global
Praticamente um clone de `Footer.tsx`. Se o footer do portal mudar, este precisa ser atualizado manualmente.

#### 9. `HeaderSerie` cria experiência diferente do portal
Navbar fixa própria do hotsite — boa para autocontenção, mas visualmente diferente do `Navbar.tsx` global.

### Pontos Positivos

- **Boa separação de responsabilidades**: cada seção é um componente isolado
- **Status dinâmico**: `getSermonStatus()` calcula automaticamente se um sermão está disponível
- **Checklist de leitura em localStorage**: experiência offline-friendly sem backend
- **VideoModal bem implementado**: ESC para fechar, backdrop click, overflow hidden no body
- **Design responsivo**: timeline com variantes desktop/mobile, cards adaptativos
- **WhatsApp share**: integração nativa para evangelismo
- **Script `merge-leituras.cjs`**: pipeline simples para sincronizar dados do markdown

### Resumo de Ações Recomendadas

| Prioridade | Issue | Sugestão |
|------------|-------|----------|
| Baixa | Thumbs em `/parousia/artes/` vs `/images/serie-da-ascensao-a-parousia/` | Unificar em um diretório |
| Baixa | `FooterSerie` botão enganoso | Redirecionar para `#mensagens` ou próximo disponível |
| Baixa | `frameBorder` deprecated | Mudar para `style={{ border: 0 }}` |
| Média | Footer duplicado | Extrair para componente compartilhado |
| Média | `MapaPeregrinacao` sem progresso real | Conectar etapas ao status dos sermões |
| Média | Meta tags OG estáticas | Usar react-helmet ou meta dinâmico |
| Baixa | Cast `as Sermon[]` sem validação | Adicionar runtime check mínimo |

---

## PARTE 3: Análise de Notificação Diária de Leitura (Opções Custo Zero)

### Contexto

A série tem 23 sermões com roteiro de leitura semanal (Seg-Sáb). Objetivo: alertar leitores sem exigir que acessem o site.

### Opções Avaliadas

| Opção | Custo | Funciona sem ir ao site | Complexidade | Recomendação |
|-------|-------|------------------------|--------------|--------------|
| **E-mail via Resend** | Zero | Sim | Média | **Recomendada** |
| **Web Push (Service Worker)** | Zero | Sim | Alta | Não recomendada (limitações iOS, complexidade) |
| **Telegram Bot** | Zero | Sim | Baixa | Complemento futuro |
| **RSS Feed** | Zero | Não | Baixa | Contra-indicada |

### Escolha Final

- **Canal:** E-mail via Resend (já integrado, free tier 3.000/mês)
- **Posição do formulário:** Dentro do hotsite Parousia
- **Frequência:** Semanal (toda segunda-feira às 7h Porto Velho)
- **Agendamento:** Netlify Scheduled Function (disponível em todos os planos)

**Plano detalhado:** `docs/planos/leitura-semanal-parousia-email.md`
