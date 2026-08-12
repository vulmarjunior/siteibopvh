# Central Administrativa IBO — Etapa 10: histórico da EBF

Data: 10 de agosto de 2026.

## Implementado

- cada inscrição da EBF agora pertence obrigatoriamente a uma `SiteEdition`;
- migração preserva e vincula inscrições legadas à edição `ebf-2026`;
- exclusão da edição é bloqueada enquanto possuir inscrições;
- novas inscrições são vinculadas exclusivamente à edição EBF com status `ACTIVE`;
- painel histórico incorporado à Central em `/admin/ebf`;
- rota antiga `/ebf/admin` redirecionada para a Central;
- autenticação global e permissão `ebf:manage` obrigatórias;
- seletor de edição isola listas, totais, filtros e exportações;
- cancelamento preserva a inscrição no banco e registra auditoria;
- exportações PDF e CSV preservadas.

## Migração

Arquivo: `supabase/migrations/20260811010351_link_ebf_registrations_to_editions.sql`.

A migração foi aplicada somente em `ibopvh-homologacao`. O banco de produção não foi alterado nesta etapa de desenvolvimento.

Resultado verificado em homologação:

- edição `ebf-2026` preservada com status `ENDED`;
- nenhuma inscrição apagada;
- ambiente de homologação possuía zero inscrições antes e depois da migração;
- RLS permanece habilitado na tabela de inscrições;
- API administrativa acessa os dados somente pelo servidor autenticado.

## Como iniciar uma edição futura

1. criar uma `SiteEdition` do módulo `ebf` com identificador, slug, nome, ano e período próprios;
2. manter a nova edição em `DRAFT` durante a preparação;
3. adaptar e homologar somente os campos e o design específicos daquela edição;
4. alterar a edição para `ACTIVE` e o módulo EBF para `ACTIVE`;
5. abrir `publicOperationsOpen` somente quando as inscrições puderem começar;
6. confirmar no painel que a nova edição inicia com total zero;
7. ao encerrar, fechar as operações e mudar a edição para `ENDED`.

Nunca reutilizar `ebf-2026` para uma nova campanha.

## Validação técnica

- schema Prisma validado e cliente atualizado;
- build de produção concluído;
- 14 arquivos e 93 testes automatizados aprovados;
- advisors do Supabase executados; os avisos encontrados são informativos e coerentes com tabelas protegidas por RLS sem acesso direto pelo cliente.

## Validação manual pendente

1. acessar `/admin/ebf` pelo dashboard;
2. confirmar que a edição EBF 2026 aparece no seletor;
3. conferir totais e exportações PDF/CSV;
4. quando houver uma cópia segura com dados, comparar os totais antes e depois da migração;
5. criar uma edição de teste em homologação e confirmar que ela não exibe inscrições de 2026;
6. somente após aprovação aplicar a migração em produção.

