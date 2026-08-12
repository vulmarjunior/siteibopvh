# Central Administrativa — migração do banco oficial

Data de preparação: 12 de agosto de 2026.

## Estado

- migração aditiva preparada em `supabase/migrations/20260812211723_central_producao_aditiva.sql`;
- validações locais concluídas;
- migração aplicada ao projeto `ibopvh-producao` (`tyqdxqfuppmwtkxbpvho`) em 12 de agosto de 2026 pelo plugin oficial do Supabase;
- nenhuma série editorial fictícia será inserida;
- os serviços Relógio de Oração, Veredas e assinantes de leituras não têm suas tabelas recriadas ou esvaziadas.

## Validação posterior

- 6 módulos e 1 edição histórica criados;
- 43 de 43 inscrições da EBF vinculadas à edição `ebf-2026`;
- contagens anteriores preservadas: 232 reservas, 7 temas, 8 assinantes, 5 itens do Veredas e 1 administrador;
- endpoints públicos do Relógio, temas, Veredas e Parousia responderam HTTP 200;
- nenhuma série editorial foi importada nesta operação;
- advisors não indicaram erro crítico; os avisos informativos de RLS sem política refletem o acesso deliberado pelo backend Prisma.

## O que a migração acrescenta

1. ciclo de vida dos módulos e edições do site;
2. séries, mensagens, mídia, materiais e planos de leitura editoriais;
3. controle de execuções e entregas dos e-mails editoriais;
4. vínculo obrigatório entre cada inscrição existente da EBF e a edição histórica `ebf-2026`;
5. índices, chaves estrangeiras e RLS nas novas tabelas.

## Procedimento autorizado para produção

1. criar e verificar um backup lógico conforme `operacao-backup-e-restauracao.md`;
2. registrar as contagens das tabelas existentes mais importantes;
3. aplicar somente a migração aditiva preparada;
4. confirmar que todas as inscrições antigas da EBF receberam `editionId = 'ebf-2026'`;
5. executar os advisors de segurança e desempenho do Supabase;
6. validar Relógio de Oração, Veredas, leitura semanal, login administrativo e Central;
7. importar o conteúdo real da Parousia somente em uma operação posterior e separada;
8. fazer o deploy da Central apenas após a validação do banco.

## Interrupção e retorno

Se a migração falhar, não insistir nem executar correções improvisadas no banco. Registrar o erro, manter a aplicação atual em produção e restaurar apenas quando houver perda ou alteração parcial confirmada. A aplicação da migração e o deploy são operações separadas, portanto preparar o banco não publica a Central automaticamente.
