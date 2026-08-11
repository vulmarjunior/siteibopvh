# Central Administrativa IBO — Etapa 0: baseline e inventário

Data do levantamento: 8 de agosto de 2026.

## 1. Escopo deste documento

Este documento registra o estado técnico anterior à implementação funcional da Central Administrativa. Nesta etapa não são alteradas rotas, autenticação, banco de dados ou experiência visual.

## 2. Baseline verificável

| Verificação | Resultado |
|---|---|
| Branch base | `main` no commit `009ca19` |
| Build de produção | Aprovado: `npm run build` |
| Testes automatizados | Aprovados: 8 arquivos e 72 testes |
| TypeScript | Aprovado como parte do build (`tsc`) |
| Árvore de trabalho antes da etapa | Limpa |
| Prisma schema | Válido localmente com Prisma 5.22.0 |
| Migrações em produção | Não consultadas: variáveis sensíveis não são exportáveis pela Vercel |

O build apresenta avisos de opções depreciadas relacionadas ao `esbuild` na integração Vite/React. Os avisos não impedem a compilação e são classificados como dívida técnica preexistente.

## 3. Arquitetura atual

- Frontend: React 18, Vite 5, TypeScript e React Router.
- Backend: Express 5, exposto em `/api`.
- Persistência: Prisma 5 e PostgreSQL hospedado no Supabase.
- Autenticação existente: Supabase Auth, atualmente aplicada ao Veredas.
- E-mail: Resend.
- Agendamento: Vercel Cron para a leitura semanal da Parousia.
- Produção: Vercel, com build Vite e funções serverless.
- Compatibilidade legada: wrappers e configuração da antiga hospedagem Netlify permanecem no repositório.

O projeto não utiliza Next.js. A Central deverá ser implementada na arquitetura React/Vite/Express existente, salvo decisão arquitetural futura explícita.

## 4. Módulos, fontes de dados e estado desejado

| Módulo | Fonte atual | Dados persistidos | Estado desejado inicial |
|---|---|---|---|
| Home institucional | Componentes e constantes no código | Nenhum domínio próprio | Ativo |
| Parousia | `src/data/sermoes.json` | `ReadingSubscriber` | Ativo |
| Veredas | API Express e Prisma | Modelos `Curadoria*` | Ativo |
| Relógio de Oração | API Express e Prisma | `Reservation`, `Config`, `PrayerTheme` | Ativo |
| EBF 2026 | API Express, Prisma e JSON da galeria | `EbfRegistration` | Encerrado; depois arquivado |
| Páscoa/Tenebras | Componentes e assets no código | Nenhum | Arquivado |
| Molda-nos | Componentes e assets no código | Nenhum | Arquivado |

### Banco compartilhado

Relógio, EBF, assinantes da Parousia e Veredas usam o mesmo datasource PostgreSQL definido em `prisma/schema.prisma`. Isso é compatível com a Central Administrativa, desde que os domínios permaneçam isolados por serviços, permissões de servidor, auditoria e migrações controladas.

O Veredas usa o mesmo projeto Supabase de duas formas:

1. Supabase Auth mantém a identidade e a sessão;
2. Prisma consulta `CuradoriaUsuario` para autorização, papel e situação ativa.

## 5. Inventário de rotas de interface

| Rota | Tipo | Proteção atual | Estado observado |
|---|---|---|---|
| `/` | Pública | Nenhuma | Ativa |
| `/pascoa` | Pública sazonal | Nenhuma | Acessível diretamente |
| `/moldanos` | Pública sazonal | Nenhuma | Acessível diretamente |
| `/ebf` | Pública sazonal | Nenhuma | Acessível diretamente |
| `/ebf/admin` | Administrativa | Senha legada | Ativa |
| `/da-ascensao-a-parousia` | Pública | Nenhuma | Ativa |
| `/relogio` | Pública | Nenhuma | Ativa |
| `/relogio/admin` | Administrativa | Senha legada | Ativa |
| `/veredas` e catálogo | Pública | Nenhuma | Ativa |
| `/admin/veredas/login` | Administrativa | Supabase Auth | Ativa |
| `/admin/veredas` | Administrativa | Bearer token na API | Ativa |
| `/admin/veredas/conteudos/*` | Administrativa | Bearer token na API | Ativa |
| `/admin/veredas/relatos` | Administrativa | Bearer token na API | Ativa |

Observação: a proteção efetiva de dados deve ocorrer no servidor. A presença de uma rota React administrativa não constitui proteção por si só.

## 6. Inventário de APIs por domínio

### Infraestrutura e utilidades

- Proxy de YouTube;
- health check;
- endpoint de debug;
- seed administrativo legado.

### Relógio de Oração

- Consulta de horários, estatísticas e temas;
- Criação e cancelamento público de reservas;
- Consulta, edição, cancelamento e exportação administrativos;
- Administração de configurações e temas;
- Teste de e-mail.

As operações administrativas usam `ADMIN_PASSWORD`; várias delas recebem a senha pela query string.

### EBF

- Criação pública de inscrição;
- Consulta e cancelamento administrativos;
- Exportação CSV.

As operações administrativas recebem `ADMIN_PASSWORD` pela query string.

### Parousia

- Inscrição e descadastro de leitores;
- Consulta da leitura vigente;
- Teste administrativo de e-mail;
- Cron semanal de leitura.

O cron e a seleção editorial ainda dependem diretamente de `src/data/sermoes.json`.

### Veredas

- Login por Supabase Auth;
- Catálogo público, destaques, recentes, categorias e detalhes;
- Relatos públicos de links;
- Importadores administrativos;
- CRUD, publicação e arquivamento de conteúdos;
- Dashboard e tratamento de relatos.

As APIs administrativas do Veredas validam token Bearer e depois consultam o usuário autorizado no Prisma.

## 7. Variáveis de ambiente

| Variável | Finalidade | Situação local observada |
|---|---|---|
| `DATABASE_URL` | Conexão PostgreSQL com pooling | Produção: configurada como sensível; local: vazia |
| `DIRECT_URL` | Conexão direta para migrações | Produção: configurada como sensível; local: vazia |
| `RESEND_API_KEY` | Envio de e-mails | Produção: configurada como sensível; local: vazia |
| `ADMIN_PASSWORD` | Administração legada | Produção: configurada como sensível; local: vazia |
| `APP_URL` | URL pública da aplicação | Configurada na produção e localmente |
| `SUPABASE_URL` | Supabase no servidor | Produção: configurada como sensível |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente privilegiado no servidor | Não localizada na produção |
| `SUPABASE_ANON_KEY` | Cliente Supabase | Produção: configurada como sensível |
| `VITE_SUPABASE_URL` | Supabase no frontend | Produção: configurada como sensível |
| `VITE_SUPABASE_ANON_KEY` | Chave pública no frontend | Produção: configurada como sensível |
| `CRON_SECRET` | Proteção do cron | Produção: configurada como sensível |
| `VERCEL_OIDC_TOKEN` | Integração local com Vercel | Configurada |

Valores secretos não devem ser copiados para documentação ou commits. Para trabalho local, deve-se obter um arquivo de ambiente seguro e não versionado, preferencialmente apontando para homologação.

## 8. Matriz inicial de acesso

| Capacidade | Público | Operador | Editor | Curador Veredas | Administrador geral |
|---|---:|---:|---:|---:|---:|
| Consultar conteúdo publicado | Sim | Sim | Sim | Sim | Sim |
| Reservar horário de oração | Sim | Sim | Sim | Sim | Sim |
| Inscrever participante quando edição aberta | Sim | Sim | Sim | Sim | Sim |
| Administrar reservas | Não | Sim | Não | Não | Sim |
| Consultar pedidos pessoais | Não | A definir | Não | Não | Sim |
| Editar séries e mensagens | Não | Não | Sim | Não | Sim |
| Publicar séries e mensagens | Não | A definir | A definir | Não | Sim |
| Curar conteúdo Veredas | Não | Não | Não | Sim | Sim |
| Administrar inscrições da EBF | Não | Sim | Não | Não | Sim |
| Alterar ciclo de vida de módulos | Não | Não | Não | Não | Sim |
| Administrar usuários e papéis | Não | Não | Não | Não | Sim |

Itens “A definir” exigem decisão do responsável antes da implementação do controle de acesso global.

## 9. Riscos preexistentes

1. Senhas administrativas aparecem em URLs do Relógio e da EBF.
2. O backend principal está concentrado em `src/api.ts`, com aproximadamente 1.035 linhas.
3. O README ainda descreve Netlify como produção, embora a operação atual esteja na Vercel.
4. A documentação histórica contém estados conflitantes sobre campanhas ativas ou dormentes.
5. A EBF não possui entidade de edição; inscrições estão associadas implicitamente a 2026.
6. A auditoria e os papéis são específicos do Veredas, não globais.
7. Não há testes automatizados dos fluxos administrativos do Relógio e da EBF.
8. O Prisma CLI não carrega `.env.local` automaticamente e não há comando padronizado para validar migrações.
9. Não foi possível confirmar o estado real das migrações sem acesso ao banco.
10. O banco compartilhado amplia o impacto potencial de migrações e endpoints privilegiados incorretos.

## 10. Backup antes de futuras migrações

Antes de qualquer mudança de schema ou migração de dados:

1. confirmar que o destino é o projeto Supabase correto;
2. registrar a versão/commit que será implantada;
3. gerar backup lógico com ferramenta PostgreSQL compatível usando a conexão direta;
4. armazenar o arquivo fora do repositório e em local com acesso restrito;
5. registrar data, ambiente e responsável, sem registrar credenciais;
6. verificar que o backup possui schema e dados esperados;
7. testar restauração em banco descartável ou de homologação antes de uma migração de alto risco;
8. somente então executar a migração versionada;
9. comparar contagens e invariantes do domínio antes e depois.

O comando exato e o destino seguro do backup precisam ser definidos após a disponibilização de acesso controlado ao Supabase. Nenhum dump contendo dados pessoais deve entrar no Git.

## 11. Critérios para encerrar a Etapa 0

- [x] Plano incorporado à branch de trabalho;
- [x] Arquitetura e fontes de dados inventariadas;
- [x] Rotas públicas e administrativas mapeadas por domínio;
- [x] Variáveis necessárias registradas sem segredos;
- [x] Build executado e aprovado;
- [x] Testes existentes executados e aprovados;
- [x] Riscos preexistentes separados;
- [ ] Acesso controlado a um ambiente Supabase disponibilizado;
- [ ] Estado das migrações confirmado;
- [ ] Procedimento de backup executável e restauração de teste confirmados;
- [x] Matriz de permissões validada pelo responsável;
- [x] Comportamento das rotas sazonais aprovado para a Etapa 1.

## 12. Decisões necessárias do responsável

Decisões aprovadas em 8 de agosto de 2026:

1. Páscoa e Molda-nos apresentarão página simples de evento encerrado, preservando as rotas e o código histórico;
2. a EBF manterá página pública de encerramento;
3. o histórico da EBF permanecerá acessível somente a administradores durante a transição;
4. operadores não visualizarão pedidos pessoais inicialmente;
5. editores prepararão conteúdo e a publicação inicial ficará restrita ao administrador;
6. será criado um projeto Supabase separado para homologação antes das primeiras migrações da Central.

## 13. Verificação direta do Supabase

Verificação realizada pelo conector Supabase em 8 de agosto de 2026:

- projeto `ibopvh-relogio` ativo e saudável na região `sa-east-1`;
- Relógio, EBF, Parousia e Veredas confirmados no mesmo banco;
- um usuário no Supabase Auth e um `CuradoriaUsuario`, com IDs alinhados;
- ausência da tabela `_prisma_migrations` antes do início deste trabalho;
- proteção RLS de `ReadingSubscriber` aplicada e verificada;
- migração Supabase registrada como `20260808204131_enable_rls_reading_subscriber`;
- nenhuma política pública criada para `ReadingSubscriber`; acesso permanece exclusivamente pelo backend Prisma;
- proteção contra senhas vazadas permanece desabilitada no Supabase Auth e deve ser habilitada pelo painel;
- branches de banco não estão disponíveis no plano Free;
- um segundo projeto de homologação possui custo informado de US$ 0/mês, sujeito aos limites do plano Free.
