# E2 — Checklist WCAG 2.1 AA do leitor da EBD

> **Plano:** [PLANO_EBD_DIGITAL.md](PLANO_EBD_DIGITAL.md)
> **Entrega:** E2 — modelo de dados e leitura pública
> **Data:** 2026-10-26
> **Escopo:** `/ebd` e `/ebd/licao/:slug`, com a amostra real 1T2022 (lições 1 e 2)
> **Método:** Lighthouse no Chrome, inspeção de DOM e árvore de acessibilidade,
> navegação por teclado, iframes de 320 px e 360 px, fonte em 150% e revisão
> manual das duas páginas.

## Resultado

| Critério | Como foi verificado | Situação |
|---|---|---|
| 1.1.1 Conteúdo não textual | Não há imagem de conteúdo na amostra; ícones são decorativos (`aria-hidden`) e o cabeçalho usa texto. | atende |
| 1.3.1 Informação e relações | `header`, `nav`, `main`, `article`, `aside`, `footer`, títulos, listas e região do leitor. | atende |
| 1.4.1 Uso da cor | Links sublinhados; tema e fonte usam `aria-pressed` e texto, não apenas cor. | atende |
| 1.4.3 Contraste | Lighthouse de acessibilidade em 1,00; paleta do leitor e chrome próprio. | atende |
| 1.4.4 Redimensionar texto | Controle de fonte de 100% a 150%, com persistência local; sem quebra em 320/360 px. Zoom de 200% do navegador não foi medido nesta fase. | atende parcialmente |
| 1.4.10 Reflow | 320 px e 360 px, inclusive com fonte em 150% (24 px), sem rolagem horizontal. | atende |
| 2.1.1 Teclado | Navegação sequencial por Tab; botões nativos; PDF e índice alcançáveis. | atende |
| 2.2.1 Tempo | O leitor não impõe limite de tempo. | atende |
| 2.3.1 Flashes | Não há animação piscante. | atende |
| 2.4.1 Bypass | Primeiro Tab foca “Ir para o texto da lição”; Enter move o foco para o artigo (`tabindex="-1"`). | atende |
| 2.4.3 Ordem de foco | Skip link → cabeçalho → breadcrumb → ações → controles de leitura. | atende |
| 2.4.4 Finalidade do link | Links com texto descritivo; o PDF informa tamanho e conteúdo. | atende |
| 2.4.6 Títulos e rótulos | Um `h1` por página; seções em `h2`; índice com `aria-current="page"`. | atende |
| 2.4.7 Foco visível | Contorno de 3 px com contraste, confirmado por teclado. | atende |
| 2.5.3 Rótulo no nome | Botões de tema e fonte com `aria-label`/`title`; links mantêm o texto visível no nome acessível. | atende |
| 3.2.2 Ao mudar entrada | Tema e fonte não navegam, não submetem e não abrem janelas. | atende |
| 3.3.1/3.3.3 Erros | Mensagens textuais em `role="alert"` e instrução para tentar novamente. | atende |
| 4.1.2 Nome, função, valor | `aria-pressed`, `aria-current`, `aria-live` e `aria-busy` nos estados dinâmicos. | atende |
| 4.1.3 Mensagens de status | Percentual da fonte em `output` com `aria-live`; carregamento com `aria-busy`. | atende |
| `noindex` | `meta robots` nas duas páginas e `X-Robots-Tag` no HTML e na API; `/ebd` ausente do sitemap. | atende |
| Preferência do sistema | Tema “Sistema” segue `prefers-color-scheme`; escolha explícita é persistida. | atende |
| Leitor de tela | Estrutura semântica conferida na árvore de acessibilidade; teste com NVDA/TalkBack é gate da E5, conforme o plano. | pendente na E5 |

## Evidências registradas

- **Lighthouse:** `/ebd` e `/ebd/licao/2022-1t-adultos-licao-01` com
  acessibilidade 1,00, boas práticas 1,00 e SEO 1,00; nenhuma falha.
- **Reflow:** em 320 px e 360 px, `scrollWidth == clientWidth`; nenhum elemento
  ultrapassa a viewport. Com fonte em 150% (24 px) o resultado se mantém.
- **Teclado:** primeiro Tab no skip link, Enter move o foco para o artigo e o
  contorno de foco é visível em todos os controles.
- **Tema:** claro, escuro e sistema; o padrão sem escolha salva segue
  `prefers-color-scheme`; a escolha e o tamanho da fonte persistem no
  `localStorage`.
- **`noindex`:** presente nas duas páginas e nas respostas da API, tanto no
  servidor de desenvolvimento quanto na configuração da Vercel.
- **Automação:** 147 testes aprovados, lint e build verdes.

## Observações de escopo

- A área usa cabeçalho e rodapé próprios, sem a Navbar/Footer globais, para
  preservar o foco do leitor e não alterar a identidade visual do portal fora
  do módulo.
- A amostra é local e não versionada; a publicação em produção e a revisão
  editorial pertencem à E4/E5.
- O teste com leitor de tela real (NVDA/TalkBack) permanece previsto para a
  homologação da E5.
