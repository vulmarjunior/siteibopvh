# Plano de migração do Netlify para a Vercel

## Objetivo

Migrar o portal, as APIs e a tarefa semanal para a Vercel, preservando PostgreSQL/Supabase, Google Workspace, domínio e a possibilidade de retorno imediato à Netlify.

Nenhuma alteração deve ser feita no DNS antes da validação completa do endereço temporário da Vercel.

## 1. Levantamento e preparação

1. Registrar a configuração atual:
   - projeto e configurações da Netlify;
   - variáveis de ambiente;
   - domínio principal e `www`;
   - registros DNS completos;
   - registros Google Workspace: MX, SPF, DKIM, DMARC e verificações;
   - agendamento da função `weekly-reading`;
   - versão do Node usada em produção;
   - branch de produção e repositório conectado.
2. Confirmar se o DNS utiliza nameservers da Netlify ou um provedor externo com registros apontados para ela.
3. Exportar ou registrar uma cópia integral da zona DNS.
4. Registrar os TTL atuais e, antes da troca, reduzir somente os registros do site para 300 segundos.
5. Confirmar os recursos externos: Supabase Database, Supabase Auth, Resend, Google Workspace, documentos e imagens públicas.

**Critério de conclusão:** inventário completo, DNS documentado e credenciais necessárias disponíveis.

## 2. Branch de migração

Criar uma branch específica, por exemplo `codex/migracao-vercel`. Todas as adaptações devem ser feitas nela. A branch `main` e o deploy da Netlify devem permanecer intactos até a homologação.

**Critério de conclusão:** trabalho isolado e retorno simples à versão atual.

## 3. Adaptar a aplicação

### 3.1 Frontend

- Manter React, Vite e a saída `dist`.
- Usar `npm run build` como comando de build.
- Configurar fallback da SPA para `index.html`.
- Preservar rotas públicas e administrativas.
- Configurar cache para arquivos estáticos com hash.
- Fixar uma versão LTS compatível do Node.

### 3.2 Backend

- Criar uma Vercel Function Node.js que reutilize o `apiRouter` Express.
- Atender todas as rotas `/api/*`.
- Remover a dependência de `server.ts` em produção.
- Não iniciar `app.listen()` dentro da função.
- Não depender de estado em memória entre requisições.
- Reutilizar o `PrismaClient` entre invocações quando possível.
- Confirmar pool de conexões do Supabase para ambiente serverless.
- Gerar o Prisma Client e os binários necessários durante o build.

Rotas críticas: Relógio de Oração, administração de reservas, inscrições EBF, Parousia, Veredas público e administrativo, proxy do YouTube, exportações CSV e calendário.

### 3.3 Configuração Vercel

Planejar um `vercel.json` com:

- rewrites para a API;
- fallback da SPA;
- configuração da função Node;
- agendamento da leitura semanal;
- cabeçalhos de cache e segurança aplicáveis.

**Critério de conclusão:** frontend e API executam localmente no formato esperado pela Vercel.

## 4. Revisão de segurança

1. Restringir ou remover `/api/debug` em produção.
2. Revisar endpoints administrativos protegidos somente por `ADMIN_PASSWORD`.
3. Evitar senhas em query strings.
4. Confirmar autenticação Supabase do Veredas.
5. Garantir que segredos nunca sejam enviados ao frontend.
6. Revisar CORS, cookies e cabeçalhos.
7. Proteger o cron com `CRON_SECRET`.
8. Garantir autenticação nas exportações administrativas.
9. Avaliar rate limiting para login, reservas e inscrições.

**Critério de conclusão:** nenhum segredo público e nenhuma rota administrativa sensível desprotegida.

## 5. Variáveis de ambiente

Cadastrar na Vercel e separar entre Production, Preview e Development:

```text
DATABASE_URL
DIRECT_URL
RESEND_API_KEY
ADMIN_PASSWORD
APP_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
CRON_SECRET
```

Cuidados:

- `APP_URL` de produção deve usar o domínio oficial.
- Preview não deve ter acesso destrutivo ao banco de produção.
- `SUPABASE_SERVICE_ROLE_KEY` deve existir somente no backend.
- Variáveis `VITE_*` são públicas e não podem conter segredos.
- `.env.local` não deve ser versionado.
- Atualizar `.env.example` durante a implementação, mantendo valores vazios.

**Critério de conclusão:** build e funções executam sem credenciais hardcoded.

## 6. Tarefa semanal

- Transformar `netlify/functions/weekly-reading.ts` em `/api/cron/weekly-reading`.
- Configurar o agendamento em `vercel.json`.
- Autorizar requisições com `CRON_SECRET`.
- Converter explicitamente o horário local para UTC.
- Impedir envio duplicado.
- Registrar sucesso, falha e quantidade de destinatários.
- Permitir disparo manual autenticado para teste.

O plano Hobby admite até dois cron jobs, com frequência mínima diária; uma execução semanal se encaixa nesse limite.

**Critério de conclusão:** teste envia apenas para destinatários controlados e não duplica mensagens.

## 7. Banco de dados e Prisma

O banco continuará no Supabase.

1. Confirmar se `DATABASE_URL` usa pooling compatível com serverless.
2. Usar `DIRECT_URL` exclusivamente para migrações.
3. Executar `prisma generate` durante o build.
4. Não executar seed automaticamente em toda inicialização da função.
5. Separar `prisma migrate deploy`, seed manual idempotente e execução normal da aplicação.
6. Confirmar que todas as migrações atuais estão aplicadas em produção.

**Critério de conclusão:** nenhuma alteração acidental de esquema e conexões estáveis.

## 8. Projeto na Vercel

1. Importar o repositório Git.
2. Selecionar Vite.
3. Configurar a branch de produção.
4. Cadastrar as variáveis de ambiente.
5. Fixar a versão do Node.
6. Fazer Preview Deploy da branch de migração.
7. Não adicionar o domínio oficial nesta etapa.

**Critério de conclusão:** endereço `*.vercel.app` disponível com build limpo.

## 9. Homologação

### Navegação

- Página inicial, Páscoa, Relógio de Oração, Parousia, Molda-nos, EBF e Veredas.
- Rotas administrativas.
- Acesso direto e recarregamento de cada rota.
- Comportamento de página inexistente.

### API e banco

- Health check.
- Consulta, reserva e cancelamento controlado de horários.
- Administração de reservas.
- Inscrição EBF controlada.
- Login e operações administrativas Veredas.
- Relato de link quebrado.
- Exportações.

### Integrações

- Supabase Auth e PostgreSQL.
- Resend.
- YouTube e Amazon.
- Calendário, PDF e CSV.
- Função semanal.

### Qualidade

- Build, TypeScript, lint e testes Vitest.
- Console do navegador e logs da Vercel.
- Testes em celular.
- Imagens, documentos e arquivos com nomes acentuados.

**Critério de conclusão:** checklist aprovado e nenhuma falha crítica nos logs.

## 10. Preparação do domínio

1. Adicionar o domínio principal e o `www` na Vercel.
2. Definir o endereço canônico e o redirecionamento correspondente.
3. Anotar os registros exatos fornecidos pela Vercel.
4. Manter o gerenciamento DNS atual; não trocar nameservers.
5. Preservar integralmente:
   - MX do Google Workspace;
   - SPF, DKIM e DMARC;
   - verificações do Google;
   - subdomínios não relacionados ao portal.
6. Alterar somente os registros usados pelo site: normalmente o `A` do domínio principal e o `CNAME` do `www`.

**Critério de conclusão:** alterações comparadas com o backup da zona DNS.

## 11. Troca do DNS

Realizar em período de menor acesso e fora de eventos importantes:

1. Confirmar o último deploy de produção na Vercel.
2. Manter a Netlify funcionando como contingência.
3. Alterar o registro `A` do domínio principal.
4. Alterar o `CNAME` do `www`.
5. Aguardar a verificação da Vercel e emissão do HTTPS.
6. Testar site, API e domínio em redes diferentes.
7. Testar envio e recebimento no Google Workspace.
8. Acompanhar logs por algumas horas.

**Critério de conclusão:** domínio, HTTPS, API e e-mail funcionando normalmente.

## 12. Rollback

Acionar retorno em caso de indisponibilidade, falhas recorrentes de API, autenticação, banco, e-mails duplicados ou vulnerabilidade crítica.

1. Restaurar os registros `A` e `CNAME` anteriores da Netlify.
2. Suspender o cron da Vercel, se necessário.
3. Confirmar propagação.
4. Validar site e Google Workspace.
5. Investigar mantendo o domínio na Netlify.

Com TTL de 300 segundos, o retorno tende a ser rápido, embora caches externos possam demorar mais.

## 13. Estabilização

Durante 7 a 14 dias:

- manter a Netlify disponível;
- acompanhar consumo do Hobby, erros e duração das funções;
- acompanhar conexões Prisma;
- confirmar execução do cron e entrega de e-mails;
- validar formulários diariamente nos primeiros dias;
- documentar deploy e rollback.

Depois do período:

- remover o domínio da Netlify;
- desativar funções agendadas antigas para evitar duplicidade;
- manter o projeto antigo arquivado temporariamente;
- restaurar TTL maior, como 3600 segundos;
- atualizar README e documentação operacional.

## Estimativa

| Etapa | Estimativa |
|---|---:|
| Inventário e preparação | 2–3 horas |
| Adaptação frontend/API | 4–8 horas |
| Variáveis, Prisma e cron | 3–5 horas |
| Segurança mínima | 2–5 horas |
| Homologação | 4–6 horas |
| DNS e troca | 1–2 horas |
| Acompanhamento | 7–14 dias corridos |

Estimativa técnica total: **16 a 29 horas**, sem contar o período passivo de estabilização.

## Resultado esperado

- Deploy automático pela Vercel após atualizações aprovadas.
- Site e API no mesmo domínio.
- Banco e autenticação mantidos no Supabase.
- E-mails corporativos mantidos no Google Workspace.
- Envio de mensagens mantido no Resend.
- Função semanal executada pela Vercel Cron.
- Netlify retirada somente após estabilização.
- Rollback documentado e testável.
