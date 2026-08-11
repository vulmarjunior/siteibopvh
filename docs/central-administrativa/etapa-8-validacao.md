# Central Administrativa IBO — Etapa 8: validação

Data: 10 de agosto de 2026.

## Implementado

- entrada administrativa única em `/admin/login`;
- `/admin/veredas/login` redireciona para o login global;
- sessão Supabase compartilhada entre Central e Veredas;
- acesso ao Veredas pelo dashboard da Central;
- retorno explícito do painel Veredas para a Central;
- rotas administrativas protegidas pelo shell global;
- APIs do Veredas continuam validando token Bearer e usuário ativo no servidor;
- papel legado `ADMIN` mapeado para administrador geral;
- papel legado `CURADOR` mapeado para curador do Veredas;
- curador limitado às operações autorizadas;
- criação, edição, publicação, arquivamento e exclusão mantêm auditoria;
- domínio, tabelas e regras editoriais do Veredas preservados.

## Compatibilidade preservada

- nenhuma tabela do Veredas foi convertida em conteúdo genérico;
- nenhuma URL pública do Veredas foi alterada;
- o middleware específico permanece como defesa adicional nas APIs do domínio;
- o componente antigo de login permanece no repositório, mas não possui rota acessível;
- sua remoção física fica reservada à limpeza da Etapa 12.

## Validação técnica

- login duplicado indisponível por redirecionamento;
- rotas administrativas envolvidas pelo `AdminProtectedRoute`;
- autorização e papéis verificados no servidor;
- auditoria confirmada nas operações mutáveis do router Veredas;
- build e testes devem ser executados após esta integração de navegação.

## Validação manual pendente

1. entrar pela Central como administrador geral;
2. abrir Veredas e retornar pelo botão **Central**;
3. criar um conteúdo de teste em rascunho;
4. editar, publicar e arquivar o item;
5. entrar como curador e confirmar que funções exclusivas de administrador permanecem bloqueadas;
6. verificar se o conteúdo público e os relatos permanecem íntegros.
