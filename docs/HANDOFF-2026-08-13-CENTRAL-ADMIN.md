# Handoff — Central Administrativa e Veredas

Atualizado em 13 de agosto de 2026.

## Veredas — cursos e playlists do YouTube

- O cadastro agora distingue `LIVRO`, `VIDEO` (um vídeo) e `CURSO` (uma playlist organizada em aulas).
- Cursos armazenam a URL/ID da playlist e uma lista ordenada de aulas com título, URL, ID e miniatura do YouTube.
- O catálogo ganhou `/veredas/cursos`; cada curso possui página própria em `/veredas/curso/:slug`.
- O usuário navega pela lista de aulas ou pelos botões “Aula anterior” e “Próxima aula”.
- As aulas são incluídas manualmente e ordenadas no formulário, sem dependência da API autenticada do YouTube.
- Migração de produção aplicada: `20260813230605_add_veredas_courses.sql`.
- Cursos aceitam materiais complementares como título e URL externa; nenhum arquivo é armazenado pelo portal.
- Migração de produção aplicada para esses links: `20260813233000_add_veredas_course_material_links.sql`.
- O card do curso usa a capa cadastrada ou, como fallback, a miniatura da primeira aula.
- A API pública do catálogo inclui `curso`, aulas e materiais; um teste protege essa seleção contra regressões.
- O salvamento de aulas e materiais foi convertido para operações em lote, mantendo transação atômica e consulta final fora da transação.
- O prazo da transação de edição foi ajustado para 15 segundos como proteção adicional.

## Veredas — administração e Biblioteca Gratuita

- A sessão administrativa agora mantém um refresh token em cookie HttpOnly separado e renova o acesso automaticamente.
- Usuários que já estavam autenticados antes da mudança precisam entrar novamente uma vez para receber o cookie de renovação.
- O menu público de Cursos recebeu ícone nos modos desktop e móvel.
- O painel administrativo recebeu o atalho **Adicionar à Biblioteca Gratuita**.
- Esse atalho abre um cadastro de livro com um acesso gratuito já preparado; ao publicar, o livro entra automaticamente na Biblioteca Gratuita.
- A Biblioteca Gratuita não possui cadastro duplicado: ela lista livros publicados que tenham ao menos um link ativo marcado como gratuito.
- O campo **Nível de profundidade** agora permanece visível no formulário; novos conteúdos usam `INTRODUTORIO` como padrão e podem ser alterados para `INTERMEDIARIO` ou `APROFUNDAMENTO`.
- As opções avançadas continuam reservadas a ressalvas pastorais e destaque na página inicial.

## Estado oficial

- Repositório: `https://github.com/vulmarjunior/siteibopvh`
- Branch oficial: `main`
- Produção: `https://ibopvh.com.br`
- Commit funcional mais recente antes deste registro: `e39f88809f34d4c725ec53fbe2ce87231eb932d6`
- PRs integradas:
  - #16 — reforço da Central Administrativa e correção da lógica dos vídeos do Veredas;
  - #17 — correção do erro HTML/JSON no login administrativo.
- A cópia local estava limpa e sincronizada com a `main`.

## Trabalho concluído

### Vídeos do Veredas

- O parser reconhece IDs puros e URLs `watch`, `youtu.be`, `embed`, `shorts`, `live` e `youtube-nocookie`.
- A página deixou de afirmar que o YouTube bloqueou a incorporação quando o cadastro apenas possui `incorporavel=false`.
- A mensagem agora diferencia:
  - incorporação desativada pela curadoria;
  - URL sem ID do YouTube reconhecível.
- O formulário administrativo passou a expor o controle **Reproduzir dentro do Veredas**.
- Foi criado `npm run audit:veredas-videos`; o modo padrão é somente leitura e `--apply` corrige apenas IDs e miniaturas reconhecíveis, nunca o campo `incorporavel`.

### Central Administrativa

- Autenticação consolidada em `/api/admin/auth`.
- Novas sessões usam cookie HttpOnly, SameSite Strict e Secure em produção.
- Compatibilidade temporária com Bearer legado mantida.
- Proteção de origem/CSRF adicionada às mutações autenticadas por cookie.
- Papéis e permissões administrativas foram ampliados.
- Gestão de usuários, ativação, suspensão e alteração de papel foram implementadas.
- O próprio administrador e o último administrador ativo têm proteção contra remoção de acesso.
- APIs administrativas foram separadas em funções serverless por domínio para evitar falha de bootstrap:
  - auth, modules, series, series-email, prayer, ebf, users e Veredas.
- O sanitizador editorial de séries passou a ser carregado sob demanda.
- Auditorias críticas do Veredas passaram a compartilhar a transação da alteração.
- Reservas do Relógio de Oração receberam trava transacional e proteção de capacidade.
- Exportações CSV passaram a neutralizar fórmulas.
- Rate limiting persistente foi adicionado às rotas sensíveis.

### Infraestrutura e banco

- `RATE_LIMIT_SALT` foi configurado como segredo em Preview e Production na Vercel.
- A tabela `ApiRateLimitEvent` foi aplicada ao Supabase de produção.
- Os papéis administrativos necessários foram confirmados no banco.
- Preview e produção foram validados.
- O deployment de produção do commit `527bd8c` ficou `READY`.

### Correção do login

O erro:

```text
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

foi causado por `pg_advisory_xact_lock`, que retorna o tipo PostgreSQL `void`. O Prisma tentava desserializar o retorno usando `$queryRaw` e o Express devolvia sua página HTML de erro.

Correção aplicada:

- troca de `$queryRaw` por `$executeRaw` no rate limit;
- mesma troca na trava concorrente do Relógio de Oração;
- frontend do login protegido contra respostas não JSON.

Validação final em produção com credenciais fictícias:

- status `401`;
- `Content-Type: application/json`;
- corpo `{"error":"E-mail ou senha incorretos"}`.

## Pendência atual — vídeo ainda sem player

O usuário confirmou que o problema visual permanece em um vídeo depois de entrar na Central.

### Novo sintoma relatado na retomada

Ao tentar editar e salvar qualquer um dos dois vídeos abaixo, o usuário era enviado de volta para a tela de login. A causa foi localizada no formulário administrativo do Veredas: ele ainda exigia o token Bearer legado no `localStorage`, embora o login atual use cookie HttpOnly. Como o token legado é removido após o login, o formulário interpretava a ausência como logout e redirecionava antes de enviar a alteração.

O formulário foi ajustado para usar o cookie de sessão nas consultas, importadores e salvamento, mantendo a validação de autenticação no servidor.

A causa mais provável não é mais o frontend: registros históricos continuam com `incorporavel=false`. Eles não foram reativados automaticamente por segurança.

Na resposta pública de produção observada durante a sessão, estes vídeos estavam desativados:

1. **A História dos Batistas - Pr Judiclay Santos - IBAM**
   - item: `6`
   - vídeo: `4`
   - YouTube ID: `WmWXoyTHEp0`
   - slug: `a-historia-dos-batistas-pr-judiclay-santos-ibam`
   - `incorporavel=false`

2. **Como ler e interpretar a Bíblia - Augustus Nicodemus**
   - item: `5`
   - vídeo: `3`
   - YouTube ID: `uLthm0cOgyY`
   - slug: `como-ler-e-interpretar-a-biblia-augustus-nicodemus`
   - `incorporavel=false`

O usuário ainda não informou qual dos dois é o vídeo afetado. Não alterar ambos sem verificar.

## Próximo passo recomendado

1. Perguntar qual é o título ou URL exata do vídeo.
2. Confirmar que o vídeo realmente reproduz em iframe do YouTube, e não apenas na página normal do YouTube.
3. Na Central Administrativa, editar somente o item confirmado.
4. Marcar **Reproduzir dentro do Veredas** e salvar.
5. Abrir a página pública do vídeo em janela anônima e confirmar que o iframe aparece e reproduz.
6. Se o iframe retornar erro 101/150, restaurar `incorporavel=false`; isso indica bloqueio real do proprietário.

Não foi possível concluir essa alteração na sessão porque:

- o conector Supabase deixou de estar disponível no turno final;
- baixar todas as variáveis de produção foi corretamente bloqueado por risco de exposição de segredos;
- a sessão autenticada do usuário não estava acessível na aba do Chrome controlada pelo Codex;
- a aba aberta pelo Codex redirecionou para `/admin/login`.

## Limitação operacional conhecida

`SUPABASE_SERVICE_ROLE_KEY` não está configurada na Vercel. Isso impede o convite de novos administradores, mas não afeta login, edição de conteúdo ou os demais módulos administrativos. Não copiar nem inventar essa credencial.

## Validações executadas

- 16 arquivos de teste, 107 testes aprovados;
- ESLint aprovado sem avisos;
- build TypeScript/Vite aprovado;
- `/api/health` em produção: 200;
- `/api/veredas/items` em produção: 200;
- módulos administrativos sem sessão: 401 JSON, conforme esperado;
- login inválido após a PR #17: 401 JSON.

## Retomada em outro computador

```bash
git clone https://github.com/vulmarjunior/siteibopvh.git
cd siteibopvh
npm install
npx prisma generate
git log -1 --oneline
```

O último comando deve mostrar o commit deste handoff ou um commit posterior da `main`.

