# Central Administrativa — correções de segurança e integridade

Data: 13 de agosto de 2026.

## Escopo implementado

- Veredas usa uma única autenticação administrativa; o endpoint legado `/api/veredas/auth/login` foi removido.
- Todas as APIs administrativas do Veredas exigem usuário ativo com papel `CURADOR` ou `ADMIN`.
- Exclusão permanente de conteúdo do Veredas exige `ADMIN`.
- Publicação, arquivamento e exclusão do Veredas gravam a auditoria na mesma transação da alteração.
- URLs do YouTube nos formatos `watch`, `youtu.be`, `embed`, `shorts`, `live`, `youtube-nocookie` e ID puro são reconhecidas.
- A página pública diferencia incorporação desativada de URL sem ID reconhecível.
- O formulário administrativo expõe o controle de incorporação para revisão de registros históricos.
- Reservas repetidas do Relógio são atômicas e a capacidade do horário é protegida contra concorrência por advisory lock transacional.
- E-mails de reserva são normalizados para minúsculas antes da verificação de duplicidade.
- Exportações CSV da EBF e do Relógio neutralizam células interpretáveis como fórmulas.
- Configurações do Relógio foram limitadas às chaves conhecidas e validadas.
- Módulos permanentes não podem ser encerrados/arquivados; operações públicas só ficam abertas em módulos ativos.
- Editores não podem publicar nem retirar séries ou mensagens do estado publicado.
- Atualização de mensagem confirma que ela pertence à série informada na URL.
- Os papéis `ADMIN_GERAL`, `EDITOR`, `CURADOR_VEREDAS` e `OPERADOR` agora são persistíveis.
- A Central possui tela autenticada para convite, ativação, suspensão e alteração de papel.
- O próprio administrador não pode remover seu acesso; o último administrador ativo também é protegido.
- Dashboard e navegação exibem somente módulos permitidos para o papel confirmado pelo servidor.
- Login, reservas, inscrições da EBF e assinaturas de séries possuem rate limit persistido, compatível com execução serverless.
- Identificadores de rate limit são hashes HMAC e os eventos expiram operacionalmente após sete dias.
- Novos logins administrativos mantêm o JWT em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção; o token não é mais devolvido ao JavaScript.
- Requisições mutáveis autenticadas por cookie rejeitam origem divergente ou contexto `cross-site`.
- Sessões legadas em `localStorage` são migradas automaticamente na primeira validação e então removidas do navegador.
- O logout revoga a sessão no Supabase, expira o cookie e mantém o registro de auditoria.

## Auditoria dos vídeos em produção

O script `npm run audit:veredas-videos` é somente leitura por padrão. Ele lista IDs ausentes ou divergentes, URLs inválidas e registros com incorporação desativada.

Para reparar apenas IDs e thumbnails reconhecíveis, execute após revisar o relatório:

```bash
npm run audit:veredas-videos -- --apply
```

O modo `--apply` não altera `incorporavel`, pois esse campo exige verificação no YouTube ou revisão humana. Antes de usar em produção:

1. configurar `.env.local` para um único ambiente coerente;
2. gerar backup;
3. executar sem `--apply`;
4. arquivar o relatório;
5. aplicar primeiro em homologação;
6. repetir a auditoria e comparar os totais.

Antes de implantar a aplicação, aplicar as migrations `expand_admin_roles` e `add_api_rate_limit_events` e configurar `RATE_LIMIT_SALT` com um segredo aleatório. A aplicação nova depende da tabela de rate limit.

## Validação local

- ESLint sem avisos.
- 16 arquivos de teste e 107 testes aprovados.
- build de produção aprovado.
- `jsPDF` e `sanitize-html` foram atualizados para versões corrigidas; a auditoria de produção não aponta vulnerabilidade alta ou crítica.
- Permanecem dois alertas moderados no React Router cuja correção disponível exige migração de versão principal; essa atualização foi isolada para não misturar uma quebra ampla de roteamento com este pacote de segurança.

## Pendências deliberadas

- Consolidar as trilhas de migração Prisma e Supabase.
- Implantar retenção e anonimização de dados pessoais.
- Verificar `status.embeddable` pela YouTube Data API ou erros 101/150 da IFrame API antes de automatizar o campo de incorporação.

## Observações de implantação da autenticação

- A migração de sessão é compatível com o `Bearer` legado durante a janela de atualização, mas novos logins usam somente cookie.
- Recomenda-se manter a expiração do JWT do Supabase curta (por exemplo, uma hora). Revogar a sessão impede renovação, mas um access token já emitido continua válido até expirar.
- Após a implantação e uma janela suficiente para expirar sessões antigas, a compatibilidade com `Bearer` pode ser removida em uma segunda versão.
- O runtime Vercel está fixado em Node.js 22 LTS para evitar variações automáticas de versão principal nas funções serverless.
