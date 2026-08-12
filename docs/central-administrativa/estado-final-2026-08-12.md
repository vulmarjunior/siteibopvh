# Central Administrativa IBO — registro de conclusão da implementação

Data de consolidação: 12 de agosto de 2026.

## Resultado

A implementação principal da Central Administrativa foi concluída e publicada em `https://ibopvh.com.br/admin/login`. O trabalho foi integrado à `main` pelo PR #12, seguido pelos PRs #14 e #15 para restaurar o cálculo histórico das etiquetas da Parousia e exibir essa informação no formulário administrativo.

O responsável realizou testes manuais em produção e confirmou o funcionamento geral. Melhorias adicionais de UX foram identificadas e serão tratadas em outra sessão, sem reabrir o escopo estrutural desta implementação.

## Entregas principais

- login administrativo único com Supabase Auth;
- permissões por perfil, proteção das APIs e auditoria administrativa;
- dashboard e navegação padronizada entre os módulos;
- ciclo de vida de módulos e edições do portal;
- cadastro, edição, arquivamento e exclusão protegida de séries;
- cadastro e edição de mensagens em modal;
- vídeo, áudio, materiais externos, texto completo e plano de leitura;
- editor de texto compatível com conteúdo originado no TinyMCE;
- leitura pública do sermão e geração de PDF com rodapé editorial dinâmico;
- preview administrativo e acesso ao hotsite da série;
- controle de assinantes e painel de e-mails da série;
- incorporação administrativa de Veredas, Relógio de Oração e histórico da EBF;
- kit e contrato editorial reutilizáveis para futuras séries.

## Banco oficial

Projeto Supabase: `ibopvh-producao` (`tyqdxqfuppmwtkxbpvho`).

Migrações aplicadas pelo plugin oficial do Supabase:

1. `central_producao_aditiva`;
2. `importa_parousia_real`.

A migração foi aditiva e não recriou nem esvaziou as tabelas existentes. A fotografia anterior e a conferência posterior mantiveram:

- 232 reservas do Relógio de Oração;
- 7 temas de oração;
- 43 inscrições históricas da EBF;
- 8 assinantes de leitura;
- 5 itens do Veredas;
- 1 usuário administrativo do Veredas/Central.

Foram criados 6 módulos e a edição histórica `ebf-2026`. As 43 inscrições da EBF foram vinculadas a essa edição.

## Migração da Parousia

A série real `Da Ascensão à Parousia` passou a utilizar a API editorial e o banco oficial. A importação foi comparada com `src/data/sermoes.json` e terminou com:

- 23 mensagens;
- 7 publicadas e 16 agendadas na data da importação;
- 12 mídias;
- 23 planos de leitura;
- 138 dias de leitura;
- zero mensagens ausentes, extras ou divergentes.

## Etiquetas públicas das mensagens

O status administrativo controla visibilidade e publicação. A etiqueta apresentada ao visitante é calculada automaticamente:

- data futura: `Em breve`;
- data passada sem conteúdo ou material: `Pregado — materiais em breve`;
- data passada com vídeo, áudio, texto completo ou material externo: `Disponível`;
- rascunho ou mensagem arquivada: não exibida publicamente.

O formulário apresenta separadamente o status administrativo e a etiqueta prevista no site. Uma substituição manual só prevalece quando tiver sido explicitamente cadastrada.

## Produção e verificações

- PR #12: implementação e publicação da Central;
- PR #13: correção independente da leitura do JSON legado da Parousia antes da migração;
- PR #14: restauração do cálculo das etiquetas pela data;
- PR #15: apresentação da etiqueta pública no formulário;
- última suíte executada: 98 testes aprovados;
- lint e build de produção aprovados;
- página inicial, login administrativo, API editorial, Relógio, Veredas e Parousia responderam HTTP 200;
- API editorial retornou as 23 mensagens;
- rota administrativa sem sessão respondeu HTTP 401, conforme esperado.

## Resend

As variáveis `RESEND_API_KEY` e `CRON_SECRET` existem no ambiente Production da Vercel. O cron está configurado para segunda-feira às 11:00 UTC, correspondente às 07:00 em Porto Velho. O remetente configurado é `IBO Parousia <contato@ibopvh.com.br>`.

O envio semanal permanece desativado em `EditorialSeries.emailEnabled`, evitando disparos acidentais para os 8 assinantes ativos. Antes de ativá-lo, ainda é necessário enviar um e-mail de teste pela Central para confirmar a chave e a autorização do domínio no Resend.

## Pendências não bloqueantes

- teste real e controlado do Resend;
- criação de backup lógico externo periódico para o projeto Supabase gratuito;
- proteção contra senhas vazadas no Supabase Auth, atualmente indicada pelo advisor;
- avaliação posterior dos avisos informativos de índices e RLS sem políticas, considerando que o acesso atual ocorre pelo backend Prisma;
- levantamento e implementação das melhorias de UX observadas pelo responsável em produção.

## Regra para a próxima sessão

Tratar as melhorias de UX como uma etapa incremental sobre a versão publicada. Antes de alterar fluxos, registrar cada problema com página, ação realizada, resultado atual e resultado esperado. Não refazer a arquitetura da Central nem repetir as migrações já aplicadas.
