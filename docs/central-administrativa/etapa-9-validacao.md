# Central Administrativa IBO — Etapa 9: Relógio de Oração

Data: 10 de agosto de 2026.

## Implementado

- painel do Relógio incorporado à Central em `/admin/relogio`;
- rota antiga `/relogio/admin` redirecionada para a Central;
- autenticação por sessão Supabase e token Bearer, sem nova tela de senha;
- autorização obrigatória `prayer:manage` em todas as operações;
- permissão separada `prayer:personal-requests` para consultar e editar pedidos pessoais;
- pedidos pessoais omitidos pela API para perfis sem essa permissão;
- gestão de reservas, temas e parâmetros;
- exportação CSV autenticada, sem pedidos pessoais;
- auditoria de alterações e exclusões sem copiar o conteúdo sensível para o registro de auditoria;
- funcionamento público do Relógio e estrutura das tabelas preservados.

## Decisões de segurança

- a autorização usa o cadastro administrativo mantido pelo servidor; metadados editáveis do usuário Supabase não participam da decisão;
- `service_role` não é enviado ao navegador;
- pedidos pessoais não aparecem no CSV;
- a auditoria registra somente quais campos mudaram, não seus valores privados;
- nenhuma nova tabela ou política RLS foi necessária nesta etapa.

## Compatibilidade temporária

Os endpoints administrativos antigos, baseados em `ADMIN_PASSWORD`, permanecem no servidor temporariamente, mas não são mais usados por nenhuma rota da interface. A remoção física fica para a limpeza da Etapa 12, depois da homologação do novo painel.

## Validação técnica concluída

- TypeScript compilado;
- build de produção concluído;
- 14 arquivos de testes aprovados;
- 93 testes aprovados.

## Validação manual pendente

1. entrar em `/admin/login` como administrador geral;
2. abrir **Relógio de Oração** no dashboard;
3. consultar uma data que possua reservas;
4. editar uma reserva de teste e confirmar a mensagem de sucesso;
5. criar, desativar e excluir um tema de teste;
6. alterar um parâmetro não crítico e restaurar seu valor;
7. exportar o CSV e confirmar que não existe coluna de pedido pessoal;
8. testar com um perfil sem `prayer:personal-requests` e confirmar que o pedido pessoal não é retornado.

