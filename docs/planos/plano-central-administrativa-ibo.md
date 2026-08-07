# Plano de implementação — Central Administrativa IBO

## 1. Objetivo

Evoluir o portal IBO para uma plataforma administrável sem transformar os hotsites em páginas genéricas.

A Central Administrativa deverá:

- controlar o ciclo de vida dos hotsites;
- preservar no repositório os hotsites encerrados para futura reutilização;
- permitir que séries de mensagens sejam abastecidas semanalmente sem alteração de código ou novo deploy;
- reunir, progressivamente, a administração dos serviços permanentes Veredas e Relógio de Oração;
- adotar autenticação única, permissões e auditoria;
- permanecer compatível com os planos gratuitos da infraestrutura enquanto o volume permitir.

## 2. Princípios arquiteturais

### 2.1 Código controla a experiência visual

Cada hotsite continuará sendo desenvolvido em React, com liberdade para definir estética, seções, animações e navegação.

### 2.2 A Central controla o estado operacional

A Central definirá publicação, datas, visibilidade, formulários, conteúdo recorrente e demais dados que não deveriam exigir deploy.

### 2.3 Séries compartilham um contrato editorial

Todo conteúdo sujeito a abastecimento semanal deverá utilizar a plataforma editorial de séries. Novos hotsites não deverão criar arquivos JSON ou outras fontes isoladas para mensagens.

### 2.4 Serviços permanentes mantêm seus domínios

Veredas e Relógio de Oração continuarão com modelos e regras próprias. A unificação ocorrerá em autenticação, navegação, permissões e auditoria, não em uma tabela genérica de conteúdo.

### 2.5 Cada etapa deve ser reversível

Migrações de dados usarão períodos de convivência e comparação. Fontes antigas só serão removidas depois que a nova implementação estiver validada.

## 3. Estado-alvo dos módulos

| Módulo | Natureza | Estado inicial desejado |
|---|---|---|
| Parousia | Série temporária ativa | Ativo |
| Veredas | Serviço permanente | Ativo |
| Relógio de Oração | Serviço permanente | Ativo |
| Páscoa/Tenebras | Campanha sazonal | Arquivado |
| Molda-nos | Campanha sazonal | Arquivado |
| EBF 2026 | Campanha sazonal com inscrições | Encerrado e depois arquivado |

## 4. Estratégia de validação

Cada etapa seguirá este ciclo:

1. implementar somente o escopo aprovado;
2. executar verificações técnicas proporcionais ao risco;
3. apresentar alterações, limitações e evidências;
4. aguardar validação do responsável;
5. corrigir a própria etapa, se necessário;
6. iniciar a etapa seguinte somente após aprovação explícita.

Uma etapa não será considerada concluída apenas porque o código foi escrito. Seus critérios de aceite deverão estar verificados.

---

## Etapa 0 — Baseline, segurança e inventário

### Objetivo

Criar uma referência confiável do estado atual antes de alterações funcionais.

### Escopo

- mapear rotas públicas, administrativas e endpoints;
- registrar as fontes atuais de dados de cada módulo;
- identificar banners e links que expõem hotsites;
- registrar variáveis de ambiente necessárias, sem copiar segredos;
- verificar o estado das migrações Prisma;
- executar build e testes atuais;
- definir procedimento de backup do banco antes de migrações futuras;
- documentar uma matriz inicial de acesso e visibilidade.

### Não inclui

- alteração visual;
- desativação de rotas;
- criação de tabelas;
- mudança de autenticação.

### Critérios de aceite

- inventário documentado;
- build atual executado e resultado registrado;
- testes existentes executados e resultado registrado;
- riscos preexistentes separados de problemas introduzidos posteriormente;
- procedimento de backup definido.

### Risco

Baixo. Etapa somente diagnóstica.

### Validação do responsável

Confirmar que o inventário representa corretamente o portal e autorizar a desativação dos hotsites sazonais.

---

## Etapa 1 — Encerramento e desativação dos hotsites sazonais

### Objetivo

Deixar publicamente ativos apenas Parousia, Veredas e Relógio de Oração, preservando integralmente o código dos demais hotsites.

### Escopo

- criar um registro central inicial de módulos em código tipado;
- marcar Páscoa/Tenebras e Molda-nos como arquivados;
- marcar EBF 2026 como encerrado;
- retirar banners e links públicos dos módulos inativos;
- impedir novas inscrições da EBF também no backend;
- definir o comportamento de acesso direto para cada rota inativa;
- preservar páginas, componentes, imagens e dados históricos;
- confirmar que Parousia, Veredas e Relógio continuam funcionando.

### Decisões que precisam constar da implementação

- Páscoa/Tenebras e Molda-nos: redirecionamento, página de encerramento ou resposta 404;
- EBF: página curta de encerramento ou arquivamento imediato;
- painel histórico da EBF: permanecer acessível apenas a administradores ou ser temporariamente ocultado.

### Não inclui

- painel para ativar módulos;
- persistência dos estados no banco;
- reformulação dos hotsites;
- exclusão de dados ou arquivos.

### Critérios de aceite

- home não divulga campanhas encerradas;
- navegação não divulga campanhas encerradas;
- acesso direto apresenta o comportamento aprovado;
- API da EBF recusa novas inscrições;
- inscrições existentes permanecem preservadas;
- código e assets dos hotsites continuam no repositório;
- build e rotas ativas continuam funcionando.

### Risco

Baixo a moderado, principalmente pelo fechamento do formulário da EBF.

### Validação do responsável

Validar visualmente a home, testar as rotas encerradas e confirmar que os três módulos ativos permanecem íntegros.

---

## Etapa 2 — Login único e estrutura básica da Central

### Objetivo

Criar a fundação administrativa comum usando Supabase Auth, aproveitando a implementação já existente no Veredas.

### Escopo

- criar a rota `/admin`;
- criar layout básico da Central com dashboard e navegação;
- generalizar o usuário administrativo atualmente específico do Veredas;
- adotar autenticação por sessão/token para novos endpoints administrativos;
- criar papéis iniciais: administrador geral, editor, curador do Veredas e operador;
- criar proteção de rotas administrativas;
- registrar login, logout e sessão expirada;
- manter os painéis antigos funcionando durante a transição.

### Estratégia de compatibilidade

- não remover `ADMIN_PASSWORD` nesta etapa;
- não migrar ainda todos os endpoints do Relógio e da EBF;
- manter login do Veredas funcional até a nova entrada estar validada;
- preparar migração dos usuários existentes sem duplicar identidades no Supabase Auth.

### Critérios de aceite

- administrador autorizado acessa `/admin`;
- usuário sem autorização recebe bloqueio adequado;
- sessão expirada retorna ao login;
- Veredas continua acessível;
- nenhuma senha administrativa aparece em query string nos novos endpoints;
- papéis são verificados no servidor, não apenas na interface.

### Risco

Moderado. Autenticação afeta todos os módulos futuros.

### Validação do responsável

Testar login, logout, sessão expirada e acessos permitidos/negados.

---

## Etapa 3 — Ciclo de vida administrável dos módulos

### Objetivo

Transferir o registro temporário em código para um controle persistido e operável pela Central.

### Escopo

- criar modelos `SiteModule` e `SiteEdition`;
- representar estados `DRAFT`, `SCHEDULED`, `ACTIVE`, `ENDED` e `ARCHIVED`;
- controlar visibilidade na home e na navegação;
- controlar acesso direto;
- controlar formulários e operações públicas;
- criar tela administrativa de módulos e edições;
- criar endpoint público de configuração com cache apropriado;
- registrar alterações em auditoria;
- popular os módulos existentes por seed ou migração controlada.

### Regras essenciais

- ocultar um banner não equivale a desativar a rota;
- desativar uma página não equivale a fechar sua API;
- mudanças de estado devem controlar interface e operação;
- edição anual não deve sobrescrever dados de outra edição;
- módulos permanentes também podem ter manutenção controlada.

### Critérios de aceite

- administrador altera estado sem novo deploy;
- home e navegação refletem o estado;
- acesso direto respeita a política configurada;
- operações públicas respeitam o estado;
- EBF 2026 existe como edição histórica independente;
- alterações ficam registradas em auditoria;
- falha na consulta de configuração possui comportamento seguro.

### Risco

Moderado. Estados incorretos podem expor ou ocultar módulos.

### Validação do responsável

Alterar um módulo de teste entre os estados e confirmar cada comportamento público.

---

## Etapa 4 — Contrato editorial da plataforma de séries

### Objetivo

Criar o núcleo reutilizável para séries de mensagens, ainda sem substituir a fonte atual da Parousia.

### Escopo

- definir e documentar o contrato editorial versão 1;
- criar modelos para série, mensagem, mídia, material, seção e plano de leitura;
- definir estados e regras de publicação;
- criar capacidades configuráveis por série;
- suportar campos personalizados mínimos e controlados;
- implementar camada de serviço independente do Prisma;
- criar API pública normalizada e tipada;
- criar funções para mensagem atual, próxima e disponíveis;
- criar fallbacks de thumbnail e normalização de YouTube;
- adicionar testes de domínio e API.

### Núcleo obrigatório da mensagem

- série;
- ordem ou número;
- título;
- data;
- texto bíblico;
- status.

### Núcleo opcional

- subtítulo;
- pregador;
- resumo e descrição;
- vídeo e áudio;
- thumbnail e artes;
- materiais;
- leituras;
- seção;
- extensões declaradas pela série.

### Não inclui

- troca da Parousia para o banco;
- editor visual de hotsites;
- criador administrativo de esquemas arbitrários;
- remoção do `sermoes.json`.

### Critérios de aceite

- contrato documentado e tipado;
- API funciona com uma série de teste;
- regras de data e status possuem testes;
- frontend não precisa conhecer tabelas Prisma;
- campos ausentes possuem fallbacks previsíveis;
- estrutura atende à Parousia sem ser uma cópia literal dela.

### Risco

Moderado a alto. Decisões ruins aqui afetam futuras séries.

### Validação do responsável

Revisar os campos editoriais e validar uma série fictícia simples antes de migrar dados reais.

---

## Etapa 5 — Painel editorial de séries

### Objetivo

Permitir cadastro, preparação e abastecimento semanal de séries pela Central.

### Escopo

- listar séries e seus estados;
- criar e editar uma série;
- configurar capacidades utilizadas;
- cadastrar a programação prevista;
- editar mensagens;
- cadastrar mídias e materiais por URL;
- editar plano de leitura;
- indicar dados obrigatórios ausentes;
- permitir preview dos dados normalizados;
- publicar ou agendar uma mensagem;
- registrar auditoria;
- oferecer fluxo otimizado de abastecimento semanal.

### Estratégia de mídia para custo zero

- começar com URLs e assets existentes;
- permitir thumbnail automática do YouTube;
- não implementar biblioteca completa de uploads nesta etapa;
- evitar uso prematuro do limite de Storage do Supabase.

### Critérios de aceite

- administrador cria uma série de teste sem editar código;
- programação completa pode ser cadastrada antecipadamente;
- atualização semanal pode ser feita em uma única tela;
- mensagem incompleta não é publicada inadvertidamente;
- preview corresponde ao objeto entregue pela API;
- alterações ficam auditadas.

### Risco

Moderado, concentrado em validação editorial e usabilidade.

### Validação do responsável

Simular o cadastro e o abastecimento de duas semanas de uma série fictícia.

---

## Etapa 6 — Migração controlada da Parousia

### Objetivo

Transformar a Parousia no primeiro consumidor real da plataforma editorial sem interromper o hotsite ativo.

### Escopo

- criar importador idempotente para `sermoes.json`;
- mapear mensagens, artes, materiais e leituras;
- gerar relatório de divergências;
- comparar API nova e JSON mensagem por mensagem;
- adaptar componentes da Parousia para o cliente tipado;
- manter fallback temporário para o JSON;
- testar mensagens passadas, atual, futura e incompleta;
- validar SEO e links existentes;
- realizar troca de fonte com possibilidade de retorno rápido.

### Regras de segurança

- o importador não pode duplicar mensagens ao ser executado novamente;
- o JSON continua versionado durante o período de validação;
- nenhuma URL pública existente deve mudar sem necessidade;
- a troca do frontend ocorre separadamente da troca dos e-mails.

### Critérios de aceite

- conteúdo exibido corresponde ao estado anterior;
- vídeos, thumbnails, materiais e leituras funcionam;
- atualização feita no painel aparece sem deploy;
- fallback funciona quando a API está indisponível durante o período acordado;
- nenhuma mensagem foi perdida ou duplicada.

### Risco

Alto. A Parousia estará ativa durante a migração.

### Validação do responsável

Comparar visualmente o hotsite antes/depois e realizar uma atualização semanal real pelo painel.

---

## Etapa 7 — E-mails e assinantes da série

### Objetivo

Remover a dependência de `sermoes.json` dos e-mails da Parousia e administrar a operação pela Central.

### Escopo

- alterar seleção da leitura vigente para a plataforma editorial;
- criar preview do e-mail;
- enviar e-mail de teste;
- registrar execuções e resultados;
- impedir envio duplicado da mesma edição;
- apresentar assinantes ativos e inativos;
- respeitar descadastro;
- controlar habilitação do e-mail por série;
- respeitar o limite gratuito diário do Resend;
- documentar estratégia de lote ou adiamento quando necessário.

### Critérios de aceite

- preview utiliza exatamente os dados publicados;
- teste chega ao destinatário configurado;
- execução não duplica envio;
- assinante inativo não recebe mensagem;
- falhas ficam registradas;
- limite de envio possui comportamento controlado;
- cron não depende mais do JSON.

### Risco

Alto. E-mails são efeitos externos e não podem ser reenviados inadvertidamente.

### Validação do responsável

Executar teste controlado com poucos destinatários antes de habilitar o envio recorrente.

---

## Etapa 8 — Incorporação do Veredas à Central

### Objetivo

Integrar o painel permanente do Veredas sem reescrever seu domínio.

### Escopo

- utilizar login e layout globais;
- preservar regras de curadoria;
- mapear papéis globais para administrador e curador;
- incorporar dashboard, conteúdos e relatos à navegação central;
- consolidar auditoria quando apropriado;
- descontinuar a entrada administrativa duplicada após validação.

### Critérios de aceite

- curador acessa somente funções autorizadas;
- administrador geral mantém acesso completo;
- publicação e arquivamento continuam funcionando;
- relatos continuam íntegros;
- login duplicado pode ser removido com segurança.

### Risco

Moderado.

### Validação do responsável

Executar o fluxo completo de criar rascunho, editar, publicar e arquivar um item de teste.

---

## Etapa 9 — Incorporação do Relógio de Oração

### Objetivo

Substituir o painel isolado e a senha em query string pelo módulo permanente da Central.

### Escopo

- incorporar reservas, temas, capacidade, exportações e teste de e-mail;
- migrar endpoints administrativos para autenticação por token;
- aplicar permissões específicas;
- registrar ações sensíveis;
- proteger pedidos pessoais;
- manter API pública do relógio compatível;
- descontinuar gradualmente `ADMIN_PASSWORD` nesse módulo.

### Critérios de aceite

- operação pública do relógio permanece funcional;
- administrador consulta e edita reservas;
- exportações funcionam;
- temas e configurações são administráveis;
- senha não aparece em URLs;
- usuário sem permissão não acessa pedidos pessoais;
- painel antigo pode ser removido ou redirecionado.

### Risco

Moderado a alto devido a dados pessoais e reservas ativas.

### Validação do responsável

Criar uma reserva de teste e realizar consulta, edição, exportação e cancelamento pela Central.

---

## Etapa 10 — Histórico da EBF e preparação para futuras edições

### Objetivo

Transformar a EBF 2026 em histórico isolado e preparar o modelo para uma futura edição sem misturar inscrições.

### Escopo

- relacionar inscrições à edição correta;
- migrar inscrições existentes para EBF 2026;
- permitir consulta histórica autorizada;
- garantir que nova edição comece sem inscrições;
- migrar endpoints administrativos para autenticação global;
- preservar exportações;
- documentar como iniciar uma edição futura.

### Não inclui

- criar o design da próxima EBF;
- presumir campos específicos de inscrições futuras;
- reativar o hotsite.

### Critérios de aceite

- todas as inscrições atuais pertencem à edição 2026;
- relatório histórico mantém totais e dados;
- edição de teste não exibe inscrições de 2026;
- nenhuma inscrição histórica é apagada;
- acesso exige permissão adequada.

### Risco

Moderado devido à migração de dados existentes.

### Validação do responsável

Comparar totais e exportações antes/depois e confirmar o isolamento entre edições.

---

## Etapa 11 — Kit oficial para novos hotsites de séries

### Objetivo

Transformar o contrato validado pela Parousia em padrão de desenvolvimento do projeto.

### Escopo

- consolidar tipos TypeScript públicos;
- disponibilizar cliente da API;
- criar `useSeries` e, se útil, `SeriesProvider`;
- fornecer exemplo mínimo de hotsite;
- documentar estados de loading, erro, pré-estreia e encerramento;
- criar checklist obrigatório;
- documentar extensões específicas;
- proibir nova fonte editorial isolada sem decisão arquitetural registrada.

### Critérios de aceite

- um hotsite mínimo consegue consumir uma série de teste;
- desenvolvedor não precisa conhecer o Prisma;
- documentação cobre o fluxo completo;
- campos e status possuem tipos estáveis;
- exemplo funciona sem copiar lógica da Parousia.

### Risco

Baixo a moderado. O maior risco é documentar abstrações ainda não validadas.

### Validação do responsável

Criar uma pequena página experimental usando apenas o kit oficial.

---

## Etapa 12 — Limpeza de legado e endurecimento

### Objetivo

Remover caminhos temporários somente depois que todos os substitutos estiverem validados.

### Escopo

- remover dependência operacional de `sermoes.json`;
- remover logins administrativos duplicados;
- remover senha administrativa de endpoints já migrados;
- dividir o backend monolítico em routers por domínio;
- revisar exposição de dados pessoais;
- revisar auditoria e tratamento de erros;
- revisar cache e comportamento seguro em falhas;
- criar rotina documentada de backup do banco;
- monitorar limites gratuitos de banco, Storage, Vercel e e-mail;
- organizar assets e backups sem excluir material histórico sem aprovação específica.

### Critérios de aceite

- não existem senhas administrativas em URLs;
- fontes antigas não são mais consumidas em produção;
- backups podem ser restaurados conforme procedimento testado;
- módulos possuem limites e responsabilidades documentados;
- build, testes e fluxos críticos passam;
- documentação de operação está atualizada.

### Risco

Moderado. Remoções só deverão ocorrer com evidência de que não há consumidores restantes.

### Validação do responsável

Revisar a lista de legado antes de qualquer remoção definitiva.

---

## 5. Itens deliberadamente adiados

Os seguintes recursos não fazem parte do plano inicial:

- construtor visual de páginas;
- editor de estética dos hotsites;
- CMS genérico baseado em blocos;
- editor arbitrário de schemas pelo administrador;
- armazenamento de vídeos;
- transformação avançada de imagens;
- workflows editoriais com múltiplas aprovações;
- aplicativo móvel;
- migração para serviços pagos sem evidência de necessidade.

## 6. Indicadores de necessidade de plano pago

A arquitetura deverá acompanhar, no mínimo:

- tamanho do banco Supabase;
- volume do Supabase Storage;
- tráfego mensal;
- pausas ou indisponibilidade do projeto;
- execução e transferência da Vercel;
- quantidade diária e mensal de e-mails;
- tamanho e crescimento de backups.

A contratação de plano pago deverá ser considerada por métrica concreta ou requisito de disponibilidade, não como pré-condição para iniciar a Central.

## 7. Ordem de execução resumida

1. Baseline e inventário.
2. Desativação dos hotsites sazonais.
3. Login único e shell administrativo.
4. Ciclo de vida administrável.
5. Contrato editorial de séries.
6. Painel editorial.
7. Migração da Parousia.
8. E-mails e assinantes.
9. Incorporação do Veredas.
10. Incorporação do Relógio.
11. Histórico e edições da EBF.
12. Kit para novas séries.
13. Limpeza e endurecimento.

## 8. Próximo passo

Revisar e aprovar este plano. Após aprovação, iniciar exclusivamente a **Etapa 0 — Baseline, segurança e inventário**.
