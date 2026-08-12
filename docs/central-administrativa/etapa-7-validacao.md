# Central Administrativa IBO — Etapa 7: validação

Data: 10 de agosto de 2026.

## Implementado

- seleção da leitura semanal diretamente da plataforma editorial;
- remoção de `sermoes.json` do cron, boas-vindas, leitura do dia e teste;
- habilitação do envio automático por série, desabilitada por padrão;
- preview administrativo do e-mail com os dados publicados;
- envio de teste autenticado para destinatário informado;
- listagem e ativação/desativação de assinantes;
- histórico das últimas execuções;
- registro de resultado individual por assinante;
- chave única persistente por série, mensagem e semana;
- chave de idempotência por destinatário no Resend;
- auditoria de configuração, teste e alteração de assinante;
- RLS habilitada nas tabelas internas de execução e entrega.

## Verificações técnicas

- consulta real selecionou a mensagem 07, com seis leituras;
- `GET /api/parousia/today` retornou 200 usando a fonte editorial;
- rota `/admin/emails` retornou 200;
- API administrativa sem sessão retornou 401;
- 14 arquivos e 93 testes aprovados;
- build de produção aprovado;
- migrações aplicadas no Supabase oficial;
- nenhuma mensagem coletiva foi enviada durante a validação técnica.

## Validação manual pendente

1. entrar na Central como administrador geral e abrir **E-mails das séries**;
2. selecionar a Parousia e gerar o preview;
3. informar um endereço controlado e enviar um único teste;
4. confirmar recebimento, conteúdo e link de descadastro;
5. habilitar o envio automático somente após aprovar o teste;
6. após a primeira execução real, conferir totais e ausência de duplicidade no histórico.

## Limites preservados

- o cron não pode ser disparado pela interface administrativa;
- o envio automático nasce desabilitado;
- assinantes e resultados não são expostos pela Data API;
- a rota legada de teste permanece temporariamente para compatibilidade e será removida na Etapa 12.
