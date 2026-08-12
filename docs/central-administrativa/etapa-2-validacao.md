# Central Administrativa IBO — Etapa 2: validação

Data: 8 de agosto de 2026.

## Implementado

- login global em `/admin/login` usando Supabase Auth;
- dashboard protegido em `/admin`;
- validação de sessão/token no servidor em `/api/admin/auth/me`;
- logout global em `/api/admin/auth/logout`;
- auditoria de login e logout na tabela de auditoria já existente;
- papéis globais `ADMIN_GERAL`, `EDITOR`, `CURADOR_VEREDAS` e `OPERADOR`;
- permissões de servidor tipadas segundo a matriz aprovada;
- compatibilidade com usuários e tokens atuais do Veredas;
- acesso inicial ao Veredas a partir do dashboard global;
- retorno ao login quando a sessão é inválida ou expirada.

## Estratégia de compatibilidade

Nenhuma identidade foi duplicada e nenhuma migração foi aplicada. Nesta fase de convivência:

- `CuradoriaUsuario.ADMIN` é interpretado como `ADMIN_GERAL`;
- `CuradoriaUsuario.CURADOR` é interpretado como `CURADOR_VEREDAS`;
- tokens do login antigo do Veredas podem abrir a Central;
- login e painel antigos do Veredas continuam disponíveis;
- `ADMIN_PASSWORD` continua existindo para Relógio e EBF até suas etapas de migração;
- `EDITOR` e `OPERADOR` estão definidos no domínio, mas só poderão ser atribuídos depois da criação homologada do usuário administrativo global.

## Verificações

| Verificação | Resultado |
|---|---|
| ESLint | Aprovado |
| Testes | 10 arquivos e 78 testes aprovados |
| TypeScript | Aprovado |
| Build de produção | Aprovado |
| Migração de banco | Não necessária/aplicada nesta fase de compatibilidade |
| Segredos em query string nos novos endpoints | Nenhum |
| Papéis verificados somente na interface | Não; matriz disponível no domínio do servidor |

## Validação manual pendente

Com um usuário atual do Veredas:

1. entrar em `/admin/login`;
2. confirmar redirecionamento para `/admin`;
3. abrir o Veredas pelo cartão do dashboard;
4. testar uma credencial inválida;
5. remover/invalidar a sessão e confirmar retorno ao login;
6. sair e confirmar o registro de logout.

## Limite deliberado

A persistência global de usuários e a atribuição real dos papéis `EDITOR` e `OPERADOR` dependem do ambiente Supabase de homologação e de uma migração posterior. Criar essa tabela diretamente em produção violaria a regra de backup, homologação e reversibilidade do plano.

