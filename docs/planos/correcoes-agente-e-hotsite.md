# Plano de Correções — agente.md + Hotsite Parousia

## Resumo

Corrigir 17 problemas documentados na análise de 2026-07-18: 9 no hotsite Parousia (code) e 8 no agente.md (docs).

---

## PARTE A: Correções no Hotsite Parousia (Code)

### A1. `VideoModal.tsx` — `frameBorder` deprecated

**Arquivo:** `src/components/parousia/VideoModal.tsx:51`

**Problema:** `frameBorder="0"` é atributo HTML deprecated.

**Solução:** Substituir por `style={{ border: 0 }}`.

```diff
-              frameBorder="0"
+              style={{ border: 0 }}
```

---

### A2. `FooterSerie.tsx` — botão enganoso

**Arquivo:** `src/components/parousia/FooterSerie.tsx:5-6,29`

**Problema:** Botão "Ver próximo sermão" sempre vai para `#programacao`.

**Solução:** Mudar o destino para `#mensagens` (seção mais relevante perto do final) e renomear o texto.

```diff
-  const handleScrollToNext = () => {
-    document.getElementById('programacao')?.scrollIntoView({ behavior: 'smooth' });
+  const handleScrollToMensagens = () => {
+    document.getElementById('mensagens')?.scrollIntoView({ behavior: 'smooth' });
```

```diff
-          Ver próximo sermão
+          Ver mensagens disponíveis
```

E atualizar a referência no JSX:
```diff
-          onClick={handleScrollToNext}
+          onClick={handleScrollToMensagens}
```

---

### A3. `MapaPeregrinacao.tsx` — timeline sem progresso

**Arquivo:** `src/components/parousia/MapaPeregrinacao.tsx`

**Problema:** Timeline estática, não reflete em qual etapa a série está.

**Solução:** Importar `sermoes.json` e `getSermonStatus`, calcular a etapa atual baseada no último sermão pregado/disponível, e destacar visualmente (preenchimento dourado vs vazio).

- Importar dados: `import sermoesData from '../../data/sermoes.json'`
- Importar utils: `import { getSermonStatus } from '../../lib/parousia-utils'`
- Mapear sermões para etapas (cada sermão tem `movimento` que corresponde a uma etapa)
- Calcular `etapaAtual` = último movimento com sermão disponível/pregado
- Aplicar estilo diferente nas etapas: `< (etapaAtual)` = preenchida, `== etapaAtual` = atual, `> etapaAtual` = futura

**Mapeamento movimento → etapa:**
- "Ascensão" → etapa 1
- "Pentecostes" → etapa 2
- "Peregrinação" / "Deserto" / "Missão" / "Perseverança" → etapas 3-6
- "Parousia" → etapa 7
- "Nova Jerusalém" → etapa 8

---

### A4. `MateriaisApoio.tsx` — conteúdo hardcoded

**Arquivo:** `src/components/parousia/MateriaisApoio.tsx`

**Problema:** Lista de materiais é hardcoded, ignora campo `materiais` do JSON.

**Solução:** Manter como está por enquanto — o campo `materiais` no JSON está vazio para todos os 23 sermões. Quando o pastor adicionar materiais individuais por sermão, aí sim vale migrar para dados. **Sem mudanca neste passo** (baixa prioridade, não quebra nada).

---

### A5. `FooterParousia.tsx` — footer duplicado

**Arquivo:** `src/components/parousia/FooterParousia.tsx` (141 linhas) vs `src/components/layout/Footer.tsx` (153 linhas)

**Problema:** Clone quase idêntico do footer global. Se o footer mudar, precisa atualizar em 2 lugares.

**Solução:** Refatorar `FooterParousia` para importar e reaproveitar o footer global, ou extrair dados comuns (endereço, telefone, redes) para um objeto compartilhado em `src/constants.tsx`.

**Abordagem escolhida:** Criar um objeto `churchInfo` em `src/constants.tsx` com dados compartilhados (endereço, telefone, email, redes sociais, horários) e usar em ambos os footers. Isso reduz duplicação sem quebrar os visuais diferentes (o Parousia usa cores `#0f1115`/`#d4af37`, o global usa `stone-900`/`olaria`).

**Arquivos:**
- `src/constants.tsx` — adicionar `export const churchInfo = {...}`
- `src/components/layout/Footer.tsx` — importar `churchInfo`
- `src/components/parousia/FooterParousia.tsx` — importar `churchInfo`

---

### A6. Thumbs em diretório inconsistente

**Arquivos:**
- `public/parousia/artes/sermão-01.jpg`
- `public/parousia/artes/sermão-02.jpg`
- `src/data/sermoes.json` (referencia `/parousia/artes/sermão-XX.jpg`)

**Problema:** Thumbs ficam em `/public/parousia/artes/` enquanto as artes da série ficam em `/public/images/serie-da-ascensao-a-parousia/`.

**Solução:** Mover os arquivos para o diretório padrão e atualizar o JSON.

1. Mover `public/parousia/artes/sermão-01.jpg` → `public/images/serie-da-ascensao-a-parousia/sermão-01.jpg`
2. Mover `public/parousia/artes/sermão-02.jpg` → `public/images/serie-da-ascensao-a-parousia/sermão-02.jpg`
3. Atualizar `sermoes.json`:
   - `"thumb": "/parousia/artes/sermão-01.jpg"` → `"thumb": "/images/serie-da-ascensao-a-parousia/sermão-01.jpg"`
   - `"thumb": "/parousia/artes/sermão-02.jpg"` → `"thumb": "/images/serie-da-ascensao-a-parousia/sermão-02.jpg"`
4. Remover diretório `public/parousia/` (se vazio após a movimentação)

---

### A7. Cast `as Sermon[]` sem validação

**Arquivos:**
- `src/components/parousia/ProgramacaoSermoes.tsx:7`
- `src/components/parousia/MensagensDisponiveis.tsx:10`

**Problema:** `sermoesData as Sermon[]` — cast direto sem validação.

**Solução:** Criar uma função `parseSermoes(data: unknown): Sermon[]` em `src/lib/parousia-utils.ts` que valida a estrutura mínima (numero, slug, data, titulo, textoBiblico, movimento). Usar em ambos os componentes.

```ts
export function parseSermoes(data: unknown): Sermon[] {
  if (!Array.isArray(data)) return [];
  return data.filter((s): s is Sermon =>
    typeof s === 'object' && s !== null &&
    'numero' in s && 'slug' in s && 'data' in s &&
    'titulo' in s && 'textoBiblico' in s && 'movimento' in s
  );
}
```

---

### A8. Meta tags OG estáticas

**Arquivo:** `index.html` (meta tags OG)

**Problema:** OG tags são estáticas, não mudam entre páginas.

**Solução:** Usar `react-helmet` ou `react-helmet-async` para setar meta tags dinâmicas no `ParousiaPage`. Adicionar dependência e criar componente `SEOHead`.

**Arquivos:**
- `package.json` — adicionar `react-helmet-async`
- `src/components/parousia/SEOHead.tsx` — criar componente com meta tags OG
- `src/pages/parousia/ParousiaPage.tsx` — usar `<SEOHead>`
- `src/main.tsx` — envolver com `<HelmetProvider>`

---

### A9. `HeaderSerie` inconsistente com portal

**Decisão:** NÃO CORRIGIR — é intencional. O hotsite Parousia é autocontido com design próprio (fundo escuro `#0f1115`). Misturar o Navbar do portal (fundo claro) quebraria a identidade visual. Manter como está.

---

## PARTE B: Correções no agente.md (Docs)

### B1. `\n` literais nas linhas 25, 234, 249, 250, 505

**Arquivo:** `agente.md`

**Problema:** `\n` aparece como texto literal em vez de quebra de linha.

**Solução:** Substituir cada `\n` por quebra de linha real (ou separar em linhas distintas da tabela).

**Linhas afetadas e correções:**

- **Linha 25:** Separar "5. Hotsite Molda-nos" e "6. Hotsite EBF" em linhas distintas
- **Linha 234:** Separar as rotas `/moldanos`, `/ebf` e `/ebf/admin` em linhas distintas da tabela
- **Linha 249-250:** Separar as linhas da tabela de status dos hotsites
- **Linha 505:** Separar as linhas do changelog

---

### B2. Caminho de diretório desatualizado

**Arquivo:** `agente.md:66`

**Problemo:** Mostra `e:\Site IBO\` como caminho raiz.

**Solução:** Atualizar para o workspace real ou usar caminho relativo:

```diff
- e:\Site IBO\
+ siteibopvh/
```

---

### B3. Sitemap — status incorreto

**Arquivo:** `agente.md:184`

**Problema:** O agente.md diz "⚠️ DESATUALIZADO — Falta /relogio, /moldanos, /da-ascensao-a-parousia", mas o `sitemap.xml` **já contém** todas essas rotas (incluindo `/ebf`).

**Solução:** Remover a nota de desatualização do agente.md. O sitemap está correto.

```diff
- ├── sitemap.xml               # ⚠️ DESATUALIZADO — Falta /relogio, /moldanos, /da-ascensao-a-parousia
+ ├── sitemap.xml               # Mapa do site (todas as rotas ativas)
```

**Nota:** O `sitemap.xml` na linha 33 tem `\n` literais (problema de encoding ao adicionar a rota `/ebf`). Isso também deve ser corrigido no `public/sitemap.xml`.

---

### B4. Changelog defasado

**Arquivo:** `agente.md:505`

**Problema:** Último registro é 2026-07-12, hoje é 18/07/2026.

**Solução:** Adicionar entrada para esta análise:

```diff
+| 2026-07-18 | Análise completa do hotsite Parousia + plano de notificação semanal por e-mail |
 | 2026-07-12 | Hotsite EBF 2026, inscrições no Supabase, painel administrativo, CSV/PDF e banner na home |
```

---

### B5. Falta seção de testes

**Arquivo:** `agente.md` (adicionar nova seção)

**Problema:** Não há instruções sobre como rodar testes.

**Solução:** Adicionar seção após "Scripts NPM":

```markdown
### Testes

| Comando | Descrição |
|---------|-----------|
| `npx vitest run` | Roda todos os testes (módulo litúrgico) |
| `npx vitest --watch` | Roda testes em modo watch |
```

---

### B6. Falta documentação de variáveis de ambiente

**Arquivo:** `agente.md` (expandir seção "Variáveis de Ambiente")

**Problemo:** `.env.example` existe mas não descreve quais são obrigatórias vs opcionais.

**Solução:** Expandir a seção existente:

```markdown
### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | Sim | URL de conexão Supabase (pooling) |
| `DIRECT_URL` | Sim | URL de conexão direta Supabase |
| `RESEND_API_KEY` | Sim | Chave API do Resend para e-mails |
| `ADMIN_PASSWORD` | Sim | Senha do painel admin |
| `APP_URL` | Não | URL base (ex: https://ibopvh.netlify.app) — usada em links de e-mail |
```

---

### B7. `constants.tsx` monolítico (91KB)

**Decisão:** NÃO CORRIGIR NESTE PLANO — é uma refatoração grande que requer migração cuidadosa do conteúdo doutrinário. Documentar como melhoria futura.

**Ação:** Adicionar nota no agente.md:

```markdown
> **Melhoria futura:** Considerar migrar o conteúdo de `constants.tsx` para JSON/MDX e renderizar dinamicamente. O arquivo tem 91KB e é difícil de manter. Requer Planejamento separado.
```

---

### B8. `api.ts` monolítico (787 linhas)

**Decisão:** NÃO CORRIGIR NESTE PLANO — refatoração grande. Documentar como melhoria futura.

**Ação:** Adicionar nota no agente.md:

```markdown
> **Melhoria futura:** Refatorar `src/api.ts` em módulos: `relogio.routes.ts`, `admin.routes.ts`, `youtube.routes.ts`, `parousia.routes.ts`, `ebf.routes.ts`. Requer Planejamento separado.
```

---

## PARTE C: Correções Extras (发现)

### C1. `public/sitemap.xml:33` — `\n` literais

**Arquivo:** `public/sitemap.xml:33`

**Problema:** A última linha tem `\n` literais ao adicionar a rota `/ebf`.

**Solução:** Reescrever a entrada do `/ebf` corretamente:

```xml
  <url>
    <loc>https://www.ibopvh.com.br/ebf</loc>
    <lastmod>2026-07-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

---

## Ordem de Execução

| # | Item | Arquivo | Complexidade |
|---|------|---------|:---:|
| 1 | A1 | `VideoModal.tsx` | Baixa |
| 2 | A2 | `FooterSerie.tsx` | Baixa |
| 3 | B1 | `agente.md` (\n literais) | Baixa |
| 4 | B2 | `agente.md` (caminho) | Baixa |
| 5 | B3 | `agente.md` (sitemap status) | Baixa |
| 6 | B4 | `agente.md` (changelog) | Baixa |
| 7 | B5 | `agente.md` (testes) | Baixa |
| 8 | B6 | `agente.md` (env vars) | Baixa |
| 9 | B7-B8 | `agente.md` (notas futuras) | Baixa |
| 10 | C1 | `sitemap.xml` | Baixa |
| 11 | A6 | Thumbs movidos + `sermoes.json` | Média |
| 12 | A7 | `parousia-utils.ts` + componentes | Média |
| 13 | A5 | `constants.tsx` + footers | Média |
| 14 | A3 | `MapaPeregrinacao.tsx` | Média |
| 15 | A8 | `react-helmet` + SEO | Média |
| 16 | A4 | `MateriaisApoio.tsx` | Sem mudança |
| 17 | A9 | `HeaderSerie.tsx` | Sem mudança |

---

## Verificação

1. `npm run lint` — verificar erros de lint
2. `npx vitest run` — testes do módulo litúrgico continuam passando
3. `npm run build` — build sem erros
4. Verificar manualmente que os links no hotsite funcionam
5. Verificar que o `sitemap.xml` é XML válido
6. Verificar que o `agente.md` renderiza corretamente no Markdown
