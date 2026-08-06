# PRD — veredas ibo

**Produto:** Plataforma de curadoria teológica da Igreja Batista Olaria  
**Nome provisório:** Veredas IBO
**Repositório:** `vulmarjunior/siteibopvh`  
**Branch base:** `main`  
**Stack:** React, TypeScript, Vite, Tailwind CSS, React Router, Node.js, Express, Netlify Functions, Prisma e PostgreSQL/Supabase  
**Hospedagem:** Netlify  
**Restrição financeira:** custo operacional obrigatório de R$ 0,00  
**Status:** aprovado para início do desenvolvimento do MVP

---

# 1. Visão geral

O Veredas IBO será um ambiente de curadoria teológica e pastoral integrado ao portal da Igreja Batista Olaria.

O produto reunirá:

1. vídeos externos, especialmente do YouTube;
2. livros indicados e avaliados pastoralmente;
3. formas legítimas de aquisição ou acesso aos livros;
4. links para livros, amostras, capítulos ou materiais gratuitos disponibilizados por editoras, autores ou instituições;
5. links para materiais produzidos pela própria IBO e armazenados em serviços públicos como Google Drive ou OneDrive;
6. trilhas temáticas de estudo, em fase posterior.

O diferencial do produto não será apenas agregar links, mas explicar:

- por que o conteúdo é indicado;
- para quem é indicado;
- qual o nível de profundidade;
- quais ressalvas pastorais existem;
- como acessar o material legitimamente.

---

# 2. Objetivo do produto

Oferecer aos membros, visitantes, alunos e líderes da IBO um catálogo confiável de conteúdos para formação cristã, organizado por temas, autores, expositores, níveis e formatos.

O sistema deverá permitir que um pastor ou curador autorizado cadastre, revise, publique, atualize e arquive conteúdos sem necessidade de editar código, executar commits ou acessar diretamente o banco de dados.

---

# 3. Proposta de valor

## Para o visitante

- encontrar conteúdos teológicos previamente selecionados;
- pesquisar por assunto, autor, expositor ou nível;
- compreender por que determinado conteúdo foi recomendado;
- acessar livros e materiais gratuitos legitimamente;
- localizar opções de aquisição;
- reportar links quebrados ou desatualizados;
- evitar materiais descontextualizados ou doutrinariamente inadequados.

## Para o pastor ou curador

- administrar o catálogo por painel próprio;
- cadastrar vídeos e livros rapidamente;
- registrar avaliações e ressalvas pastorais;
- indicar diferentes formas de acesso;
- manter o catálogo atualizado com auxílio dos usuários;
- publicar sem alterar arquivos do repositório;
- arquivar conteúdos removidos, esgotados ou desatualizados.

---

# 4. Princípios do produto

1. **Curadoria acima de quantidade:** catálogo pequeno e bem avaliado.
2. **Identidade pastoral:** toda indicação deve possuir contextualização própria da IBO.
3. **Legalidade:** o sistema apenas direcionará para fontes legítimas e autorizadas.
4. **Baixa complexidade:** não criar um CMS geral.
5. **Custo zero:** utilizar apenas planos e recursos gratuitos.
6. **Expansão progressiva:** lançar primeiro o catálogo essencial.
7. **Independência comercial:** um livro não dependerá da Amazon para existir no catálogo.
8. **Fonte externa como opção:** Amazon, editoras, livrarias, Google Drive e OneDrive serão formas de acesso.
9. **Sem hospedagem própria:** o veredas ibo não armazenará PDF, EPUB ou outros arquivos de livros.
10. **Manutenção colaborativa:** usuários poderão reportar links quebrados.
11. **Segurança por padrão:** apenas o painel administrativo poderá alterar o catálogo.
12. **Integração com a stack atual:** evitar novo serviço, novo banco ou nova aplicação sem necessidade comprovada.

---

# 5. Escopo do MVP

## Incluído no MVP

### Área pública

- página inicial do veredas ibo;
- catálogo de vídeos;
- catálogo de livros;
- pesquisa textual;
- filtros;
- página individual de vídeo;
- página individual de livro;
- seção de conteúdos em destaque;
- seção de adicionados recentemente;
- incorporação de vídeos do YouTube;
- apresentação de múltiplas formas de acesso ao livro;
- links para PDF, EPUB, amostras ou leitura on-line em fontes externas;
- links para materiais da IBO no Google Drive ou OneDrive;
- botão “Reportar link quebrado”;
- formulário público de reporte;
- página informativa sobre a curadoria;
- política editorial;
- aviso de links de associado;
- estados de indisponibilidade.

### Área administrativa

- autenticação;
- painel inicial;
- cadastro de vídeos;
- cadastro de livros;
- cadastro de categorias;
- cadastro de pessoas;
- cadastro de formas de acesso;
- edição;
- pré-visualização;
- publicação;
- arquivamento;
- seleção de destaque;
- ordenação básica;
- busca no catálogo administrativo;
- painel de relatos de links quebrados;
- edição ou desativação de links reportados.

## Fora do MVP

- contas para membros ou visitantes;
- favoritos;
- comentários;
- avaliações públicas;
- notas por estrelas;
- histórico de visualização;
- progresso de leitura;
- recomendações por inteligência artificial;
- upload ou hospedagem de vídeos;
- upload ou hospedagem de PDF;
- upload ou hospedagem de EPUB;
- Supabase Storage;
- armazenamento de documentos de autorização;
- sincronização automática de preços;
- comparação automática entre livrarias;
- loja própria;
- carrinho ou pagamento;
- sistema de afiliados próprio;
- newsletter automática;
- aplicativo móvel;
- trilhas com progresso individual;
- múltiplas igrejas ou tenants;
- CMS para outras páginas do site.

---

# 6. Público-alvo

## Primário

- membros da Igreja Batista Olaria;
- alunos dos cursos da igreja;
- líderes e professores;
- visitantes interessados em formação cristã.

## Administrativo

- pastor;
- curadores designados;
- administrador técnico do portal.

---

# 7. Arquitetura recomendada

## 7.1 Aplicação

O veredas ibo será desenvolvido dentro do repositório e da aplicação existentes.

Não criar:

- novo repositório;
- nova aplicação Vite;
- novo deploy Netlify;
- novo backend Express;
- novo projeto Supabase, salvo impedimento técnico documentado.

## 7.2 Banco de dados

Utilizar o PostgreSQL já conectado ao Prisma.

Criar modelos específicos com prefixo conceitual `Curadoria` para manter separação lógica e facilitar identificação.

Exemplos:

- `CuradoriaItem`;
- `CuradoriaLivro`;
- `CuradoriaVideo`;
- `CuradoriaCategoria`;
- `CuradoriaPessoa`;
- `CuradoriaAcesso`;
- `CuradoriaItemCategoria`;
- `CuradoriaLinkRelato`;
- `CuradoriaUsuario`;
- `CuradoriaAuditoria`.

Não reutilizar tabelas dos hotsites para conteúdos da curadoria.

Não misturar campos da curadoria nos modelos:

- `Reservation`;
- `EbfRegistration`;
- `ReadingSubscriber`;
- `PrayerTheme`;
- `Config`.

## 7.3 Justificativa para o banco compartilhado

O banco existente já suporta diversos módulos independentes por meio de tabelas separadas.

O catálogo do MVP terá volume reduzido:

- dezenas ou poucas centenas de itens;
- textos pastorais;
- metadados bibliográficos;
- URLs;
- relatos de links;
- registros administrativos.

Não haverá armazenamento de arquivos binários no banco.

A criação de outro projeto Supabase somente deverá ser considerada se ocorrer uma destas situações:

- o banco atual estiver próximo de seu limite;
- houver necessidade de isolamento institucional absoluto;
- o projeto precisar de ciclo de vida independente;
- as credenciais atuais não puderem ser utilizadas com segurança;
- existir conflito comprovado entre Prisma e autenticação.

Caso o agente identifique uma dessas condições, deverá documentá-la antes de alterar a arquitetura.

## 7.4 Organização física das tabelas

Para o MVP, manter as tabelas no schema PostgreSQL já utilizado pela aplicação e aplicar nomes explícitos.

Não introduzir custom schema PostgreSQL no primeiro ciclo.

A separação deverá ocorrer por:

- nomes de modelos;
- nomes de tabelas;
- módulos de código;
- rotas;
- services;
- permissões administrativas.

---

# 8. Modelo conceitual de dados

## 8.1 `CuradoriaItem`

Entidade principal compartilhada entre vídeo e livro.

```prisma
model CuradoriaItem {
  id                  Int                       @id @default(autoincrement())
  tipo                CuradoriaTipoItem
  titulo              String
  slug                String                    @unique
  resumo              String
  descricao           String?
  porqueIndicamos     String
  ressalvas           String?
  publicoIndicado     String?
  nivel               CuradoriaNivel
  status              CuradoriaStatus
  destaque            Boolean                   @default(false)
  ordemDestaque       Int?
  imagemUrl           String?
  seoTitle            String?
  seoDescription      String?
  publicadoEm         DateTime?
  arquivadoEm         DateTime?
  criadoEm            DateTime                  @default(now())
  atualizadoEm        DateTime                  @updatedAt

  livro               CuradoriaLivro?
  video               CuradoriaVideo?
  categorias          CuradoriaItemCategoria[]
}
```

## 8.2 Enums gerais

```prisma
enum CuradoriaTipoItem {
  VIDEO
  LIVRO
}

enum CuradoriaNivel {
  INTRODUTORIO
  INTERMEDIARIO
  APROFUNDAMENTO
}

enum CuradoriaStatus {
  RASCUNHO
  PUBLICADO
  ARQUIVADO
}
```

## 8.3 `CuradoriaLivro`

```prisma
model CuradoriaLivro {
  id                  Int                     @id @default(autoincrement())
  itemId              Int                     @unique
  item                CuradoriaItem           @relation(fields: [itemId], references: [id], onDelete: Cascade)

  subtitulo           String?
  isbn10              String?
  isbn13              String?
  asin                String?
  editora             String?
  anoPublicacao       Int?
  edicao               String?
  idioma              String?
  numeroPaginas       Int?
  formatoPrincipal    String?
  capaUrl             String?
  disponibilidade     CuradoriaDisponibilidade @default(DISPONIVEL)

  autores             CuradoriaLivroPessoa[]
  acessos              CuradoriaAcesso[]
}
```

## 8.4 Disponibilidade do livro

```prisma
enum CuradoriaDisponibilidade {
  DISPONIVEL
  GRATUITO
  SOMENTE_DIGITAL
  ESGOTADO
  FORA_DE_CATALOGO
  AQUISICAO_NAO_LOCALIZADA
  INDISPONIVEL_TEMPORARIAMENTE
}
```

## 8.5 `CuradoriaVideo`

```prisma
model CuradoriaVideo {
  id                  Int                 @id @default(autoincrement())
  itemId              Int                 @unique
  item                CuradoriaItem       @relation(fields: [itemId], references: [id], onDelete: Cascade)

  youtubeId           String?
  urlOriginal         String
  canal               String?
  duracaoSegundos     Int?
  publicadoOriginalEm DateTime?
  thumbnailUrl        String?
  incorporavel        Boolean             @default(true)

  participantes       CuradoriaVideoPessoa[]
}
```

## 8.6 `CuradoriaCategoria`

```prisma
model CuradoriaCategoria {
  id                  Int                       @id @default(autoincrement())
  nome                String                    @unique
  slug                String                    @unique
  descricao           String?
  ativa               Boolean                   @default(true)
  ordem               Int                       @default(0)

  itens               CuradoriaItemCategoria[]
}
```

## 8.7 Relação item-categoria

```prisma
model CuradoriaItemCategoria {
  itemId              Int
  categoriaId         Int

  item                CuradoriaItem       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  categoria           CuradoriaCategoria  @relation(fields: [categoriaId], references: [id], onDelete: Cascade)

  @@id([itemId, categoriaId])
  @@index([categoriaId])
}
```

## 8.8 `CuradoriaPessoa`

Autores, expositores, pregadores, professores, organizadores e outros participantes deverão usar uma entidade comum.

```prisma
model CuradoriaPessoa {
  id                  Int                 @id @default(autoincrement())
  nome                String
  slug                String              @unique
  descricao           String?
  imagemUrl           String?
  ativa               Boolean             @default(true)

  livros              CuradoriaLivroPessoa[]
  videos              CuradoriaVideoPessoa[]
}
```

## 8.9 Papéis das pessoas

```prisma
enum CuradoriaPapelPessoa {
  AUTOR
  ORGANIZADOR
  TRADUTOR
  PREFACIADOR
  EXPOSITOR
  PREGADOR
  ENTREVISTADOR
  ENTREVISTADO
  DEBATEDOR
}
```

## 8.10 `CuradoriaAcesso`

Cada livro poderá possuir uma ou várias formas externas de acesso.

```prisma
model CuradoriaAcesso {
  id                  Int                       @id @default(autoincrement())
  livroId             Int
  livro               CuradoriaLivro            @relation(fields: [livroId], references: [id], onDelete: Cascade)

  tipo                CuradoriaTipoAcesso
  formato             CuradoriaFormatoAcesso?
  provedor            CuradoriaProvedorAcesso?
  fornecedor          String?
  url                 String
  textoBotao          String
  gratuito            Boolean                   @default(false)
  linkAssociado       Boolean                   @default(false)
  producaoIbo         Boolean                   @default(false)
  ativo               Boolean                   @default(true)
  ordem               Int                       @default(0)
  observacaoPublica   String?
  fonte               String?
  ultimaVerificacaoEm DateTime?
  criadoEm            DateTime                  @default(now())
  atualizadoEm        DateTime                  @updatedAt

  relatos             CuradoriaLinkRelato[]
}
```

## 8.11 Tipos de acesso

```prisma
enum CuradoriaTipoAcesso {
  COMPRA
  LEITURA_ONLINE
  DOWNLOAD_INTEGRAL
  AMOSTRA
  PAGINA_OFICIAL
  EMPRESTIMO
  MATERIAL_COMPLEMENTAR
}
```

## 8.12 Formatos

```prisma
enum CuradoriaFormatoAcesso {
  IMPRESSO
  PDF
  EPUB
  KINDLE
  WEB
  VIDEO
  OUTRO
}
```

## 8.13 Provedores

```prisma
enum CuradoriaProvedorAcesso {
  AMAZON
  EDITORA
  LIVRARIA
  ESTANTE_VIRTUAL
  GOOGLE_DRIVE
  ONEDRIVE
  SITE_AUTOR
  SITE_INSTITUCIONAL
  BIBLIOTECA_DIGITAL
  OUTRO
}
```

## 8.14 `CuradoriaLinkRelato`

```prisma
model CuradoriaLinkRelato {
  id                  Int                       @id @default(autoincrement())
  acessoId            Int
  acesso              CuradoriaAcesso           @relation(fields: [acessoId], references: [id], onDelete: Cascade)

  motivo              CuradoriaMotivoRelato
  observacao          String?
  status              CuradoriaStatusRelato     @default(PENDENTE)

  ipHash              String?
  userAgentResumido   String?

  criadoEm            DateTime                  @default(now())
  analisadoEm         DateTime?
  resolvidoEm         DateTime?
  resolvidoPor        String?
  notaAdministrativa  String?

  @@index([acessoId])
  @@index([status, criadoEm])
}
```

## 8.15 Motivos do relato

```prisma
enum CuradoriaMotivoRelato {
  LINK_NAO_ABRE
  PAGINA_NAO_ENCONTRADA
  CONTEUDO_REMOVIDO
  EXIGE_LOGIN
  NAO_E_MAIS_GRATUITO
  CONTEUDO_INCORRETO
  REDIRECIONAMENTO_INDESEJADO
  OUTRO
}
```

## 8.16 Status do relato

```prisma
enum CuradoriaStatusRelato {
  PENDENTE
  EM_ANALISE
  RESOLVIDO
  DESCARTADO
}
```

---

# 9. Regras de negócio

## 9.1 Regras gerais

1. Um item em rascunho não pode aparecer na área pública.
2. Um item arquivado não pode aparecer na busca ou nas listagens públicas.
3. Somente itens publicados podem ser destacados.
4. O slug deve ser único.
5. O sistema deverá gerar slug automaticamente, com possibilidade de edição.
6. A exclusão física de conteúdo publicado não será a operação padrão.
7. A ação padrão será arquivar.
8. Exclusão definitiva ficará restrita ao administrador técnico ou será omitida do MVP.
9. Todo item deverá ter ao menos uma categoria.
10. Todo item deverá possuir “Por que indicamos?”.
11. Ressalvas serão opcionais, mas visíveis quando preenchidas.
12. Um livro poderá existir sem qualquer link de compra.
13. Um livro poderá existir mesmo se estiver esgotado.
14. Um vídeo será apenas incorporado ou vinculado.
15. O sistema não hospedará livros, capítulos, amostras, PDF ou EPUB.

## 9.2 Regras para livros

Um livro poderá possuir:

- nenhum acesso ativo;
- um acesso;
- múltiplos acessos.

Exemplos:

- Amazon;
- editora;
- outra livraria;
- sebo;
- leitura on-line;
- amostra em PDF;
- download integral em site externo;
- EPUB em site externo;
- material complementar da IBO;
- Google Drive;
- OneDrive;
- página oficial.

Quando não houver acesso disponível, apresentar estado editorial como:

- fora de catálogo;
- esgotado;
- aquisição não localizada;
- indisponível temporariamente.

## 9.3 Links para materiais gratuitos

Quando um livro, capítulo, amostra, PDF ou EPUB estiver disponível gratuitamente:

- preferir o site oficial da editora;
- preferir o site oficial do autor;
- preferir o site oficial da instituição;
- identificar claramente a fonte;
- não copiar o arquivo;
- não fazer upload para o sistema;
- não criar URL intermediária de armazenamento;
- abrir em nova guia;
- utilizar `rel="noopener noreferrer"`.

## 9.4 Materiais produzidos pela IBO

Materiais próprios poderão ser armazenados em:

- Google Drive institucional;
- OneDrive institucional;
- outra plataforma gratuita aprovada.

O sistema armazenará apenas o link público.

Regras:

- o link deve abrir sem autenticação;
- a permissão deve ser somente leitura;
- não usar link de edição;
- preferir conta institucional;
- evitar armazenamento em conta pessoal de colaborador;
- identificar o conteúdo como “Produção da IBO”;
- testar o link antes da publicação;
- informar o formato do material.

## 9.5 Fonte e legitimidade

Cada acesso gratuito deverá permitir o registro de:

- fonte;
- fornecedor;
- provedor;
- observação pública;
- indicação de produção própria da IBO.

Não será necessário armazenar documento de autorização no sistema.

A responsabilidade editorial será do curador, que deverá cadastrar apenas links de fontes legítimas.

## 9.6 Link de associado

Quando `linkAssociado = true`:

- exibir identificação clara na ficha;
- preservar o link integral fornecido;
- não remover parâmetros do associado;
- não substituir automaticamente por link comum;
- não apresentar preço no MVP;
- exibir aviso geral sobre links comissionados.

Texto público sugerido:

> Alguns links de aquisição podem ser links de associado. A igreja poderá receber uma pequena comissão, sem custo adicional para o comprador.

## 9.7 Amazon

O cadastro de livro deverá aceitar:

- URL completa da Amazon;
- URL contendo `/dp/{ASIN}`;
- URL contendo `/gp/product/{ASIN}`;
- link encurtado, quando puder ser resolvido com segurança;
- ASIN informado manualmente.

No MVP:

- extrair automaticamente o ASIN quando estiver visível na URL;
- preservar o link de associado;
- permitir preenchimento manual dos metadados;
- não depender da API da Amazon;
- preparar interface de serviço para integração futura;
- não realizar scraping.

## 9.8 Vídeos do YouTube

Ao colar uma URL, aceitar:

- `youtube.com/watch?v=`;
- `youtu.be/`;
- `youtube.com/embed/`;
- Shorts com ID válido.

Extrair:

- ID do vídeo;
- thumbnail pública;
- URL canônica.

O cadastro deverá permitir informar manualmente:

- título editorial;
- canal;
- duração;
- expositor;
- resumo;
- categoria;
- nível;
- por que indicamos;
- ressalvas.

Não tornar a YouTube Data API obrigatória no MVP.

Quando a incorporação falhar ou for proibida:

- manter botão “Assistir no YouTube”;
- sinalizar `incorporavel = false`;
- não quebrar a página.

---

# 10. Reporte de links quebrados

## 10.1 Objetivo

Permitir que visitantes ajudem a manter o catálogo atualizado sem exigir verificação constante pela administração.

Cada link de acesso de livro deverá possuir a ação:

> Reportar link quebrado

## 10.2 Posicionamento

O botão deverá:

- aparecer próximo à opção de acesso;
- ter baixo destaque visual;
- não competir com o botão principal;
- ser acessível por teclado;
- identificar exatamente qual link está sendo reportado.

## 10.3 Formulário público

O formulário deverá preencher automaticamente:

- livro;
- acesso;
- URL;
- fornecedor.

O usuário deverá informar:

### Campo obrigatório

- motivo do reporte.

### Campo opcional

- observação.

Não solicitar no MVP:

- nome;
- telefone;
- e-mail;
- criação de conta.

## 10.4 Motivos disponíveis

- link não abre;
- página não encontrada;
- conteúdo removido;
- exige login ou permissão;
- conteúdo não é mais gratuito;
- conteúdo incorreto;
- redireciona para página inadequada;
- outro.

## 10.5 Comportamento após envio

Após o envio:

- salvar o relato;
- informar sucesso;
- não remover o link automaticamente;
- não desativar o acesso automaticamente;
- não enviar e-mail obrigatório;
- impedir envio duplicado em sequência.

Mensagem sugerida:

> Obrigado por nos avisar. Nossa equipe verificará este link.

## 10.6 Priorização

O painel deverá indicar:

- número de relatos pendentes por link;
- data do primeiro relato;
- data do último relato;
- motivo mais frequente.

Regra sugerida:

- três ou mais relatos pendentes para o mesmo acesso geram alerta de prioridade.

O sistema não deverá desativar links automaticamente.

## 10.7 Proteção contra spam

Implementar:

- rate limit por IP;
- hash do IP, sem armazenar IP puro;
- honeypot invisível;
- bloqueio de repetição para o mesmo acesso em curto intervalo;
- validação de tamanho da observação;
- sanitização do texto;
- registro resumido de user agent apenas se necessário.

Limites sugeridos:

- máximo de cinco relatos por hora por IP;
- máximo de um relato para o mesmo acesso a cada 30 minutos por IP;
- observação de até 500 caracteres.

---

# 11. Autenticação e autorização

## 11.1 Solução recomendada

Utilizar Supabase Auth no mesmo projeto já usado pelo banco.

Fluxo:

1. usuário acessa `/admin/curadoria/login`;
2. autentica com e-mail e senha;
3. recebe sessão Supabase;
4. frontend envia access token às APIs administrativas;
5. backend valida o token;
6. backend consulta o perfil;
7. operação é autorizada conforme o papel.

## 11.2 Papéis

```prisma
enum CuradoriaPapelUsuario {
  ADMIN
  CURADOR
}
```

### ADMIN

- gerenciar conteúdos;
- gerenciar categorias;
- gerenciar pessoas;
- publicar;
- arquivar;
- gerenciar perfis administrativos;
- alterar destaques;
- analisar relatos;
- desativar links;
- editar links reportados.

### CURADOR

- criar;
- editar;
- salvar rascunhos;
- publicar;
- arquivar;
- cadastrar acessos;
- analisar relatos;
- corrigir links.

## 11.3 Segurança

- não guardar senha no Prisma;
- não criar autenticação própria baseada em senha fixa;
- não expor `SUPABASE_SERVICE_ROLE_KEY` no frontend;
- validar JWT no backend;
- validar novamente os papéis no servidor;
- nunca confiar apenas em bloqueio de rota React;
- registrar operações sensíveis;
- sanitizar textos;
- usar consultas Prisma parametrizadas.

---

# 12. API

Prefixo:

```text
/api/curadoria
```

## 12.1 Endpoints públicos

```text
GET  /api/curadoria/items
GET  /api/curadoria/items/:slug
GET  /api/curadoria/videos
GET  /api/curadoria/livros
GET  /api/curadoria/categorias
GET  /api/curadoria/pessoas/:slug
GET  /api/curadoria/destaques
GET  /api/curadoria/recentes
POST /api/curadoria/acessos/:id/reportar
```

Parâmetros possíveis:

```text
?q=
?tipo=
?categoria=
?nivel=
?pessoa=
?gratuito=
?formato=
?page=
?limit=
?sort=
```

Regras:

- retornar apenas itens publicados;
- aplicar paginação;
- limitar `limit`;
- não expor dados administrativos;
- não expor IP hash;
- não expor notas administrativas dos relatos.

## 12.2 Endpoints administrativos

```text
GET    /api/curadoria/admin/items
POST   /api/curadoria/admin/items
GET    /api/curadoria/admin/items/:id
PUT    /api/curadoria/admin/items/:id
POST   /api/curadoria/admin/items/:id/publicar
POST   /api/curadoria/admin/items/:id/arquivar

GET    /api/curadoria/admin/categorias
POST   /api/curadoria/admin/categorias
PUT    /api/curadoria/admin/categorias/:id

GET    /api/curadoria/admin/pessoas
POST   /api/curadoria/admin/pessoas
PUT    /api/curadoria/admin/pessoas/:id

POST   /api/curadoria/admin/livros/:id/acessos
PUT    /api/curadoria/admin/acessos/:id
DELETE /api/curadoria/admin/acessos/:id

GET    /api/curadoria/admin/relatos
GET    /api/curadoria/admin/relatos/:id
POST   /api/curadoria/admin/relatos/:id/em-analise
POST   /api/curadoria/admin/relatos/:id/resolver
POST   /api/curadoria/admin/relatos/:id/descartar
```

## 12.3 Endpoints utilitários

```text
POST /api/curadoria/admin/importar/youtube
POST /api/curadoria/admin/importar/amazon
POST /api/curadoria/admin/importar/isbn
```

No MVP:

- `youtube`: extrair ID e thumbnail;
- `amazon`: extrair ASIN e preservar URL;
- `isbn`: pode permanecer preparado, sem integração externa obrigatória.

Todos devem possuir fallback manual.

---

# 13. Área pública

## 13.1 Rotas

```text
/indica
/indica/videos
/indica/livros
/indica/video/:slug
/indica/livro/:slug
/indica/categoria/:slug
/indica/pessoa/:slug
/indica/sobre
/indica/biblioteca-gratuita
```

Usar `/indica` como rota canônica.

## 13.2 Página inicial

Blocos:

1. cabeçalho editorial;
2. conteúdo principal em destaque;
3. vídeos em destaque;
4. livros em destaque;
5. adicionados recentemente;
6. fundamentos da fé;
7. Bíblia e interpretação;
8. história da Igreja;
9. biblioteca gratuita;
10. chamada para conhecer a política de curadoria.

Não copiar visualmente a Netflix.

Pode usar:

- cards horizontais;
- carrossel acessível;
- grades responsivas;
- imagem, título e metadados;
- identidade visual da IBO.

## 13.3 Catálogo

Filtros:

- tipo;
- categoria;
- nível;
- autor ou expositor;
- gratuito;
- formato;
- disponibilidade.

Busca em:

- título;
- subtítulo;
- resumo;
- autor;
- expositor;
- canal;
- editora;
- categoria.

A busca inicial poderá utilizar consultas `contains`.

## 13.4 Ficha de vídeo

Apresentar:

- título;
- player incorporado;
- fallback para YouTube;
- canal;
- expositor ou participantes;
- duração;
- categoria;
- nível;
- resumo;
- por que indicamos;
- ressalvas;
- conteúdos relacionados;
- botão de compartilhamento.

## 13.5 Ficha de livro

Apresentar:

- capa;
- título e subtítulo;
- autores;
- editora;
- ano;
- edição;
- formato;
- nível;
- categoria;
- resumo;
- por que indicamos;
- ressalvas;
- público indicado;
- formas de acesso;
- status de disponibilidade;
- conteúdos relacionados.

Organizar formas de acesso em grupos:

### Acesso gratuito

- download integral externo;
- amostra;
- leitura on-line;
- PDF;
- EPUB;
- material da IBO.

### Aquisição

- Amazon;
- editora;
- livrarias;
- sebos.

### Outras opções

- página oficial;
- empréstimo;
- bibliotecas;
- material complementar.

Cada opção deverá apresentar:

- texto do botão;
- fornecedor;
- formato;
- indicação de gratuito;
- indicação de link de associado;
- indicação de produção da IBO;
- ação “Reportar link quebrado”.

---

# 14. Área administrativa

## 14.1 Rotas

```text
/admin/curadoria/login
/admin/curadoria
/admin/curadoria/conteudos
/admin/curadoria/conteudos/novo
/admin/curadoria/conteudos/:id
/admin/curadoria/categorias
/admin/curadoria/pessoas
/admin/curadoria/relatos
```

## 14.2 Dashboard

Exibir:

- total de vídeos publicados;
- total de livros publicados;
- rascunhos;
- itens arquivados;
- livros com acesso gratuito;
- itens sem forma de acesso;
- relatos pendentes;
- links com três ou mais relatos;
- links sem verificação recente.

## 14.3 Cadastro de vídeo

Etapas:

1. origem;
2. dados editoriais;
3. pessoas;
4. classificação;
5. revisão e publicação.

Campos mínimos para publicação:

- URL válida;
- título;
- resumo;
- por que indicamos;
- nível;
- categoria;
- status.

## 14.4 Cadastro de livro

Formas de início:

- link da Amazon;
- link da editora;
- ISBN;
- cadastro manual.

Etapas:

1. identificação bibliográfica;
2. autores;
3. curadoria pastoral;
4. classificação;
5. formas de acesso;
6. revisão;
7. publicação.

## 14.5 Formulário de acesso

Campos:

- tipo;
- formato;
- provedor;
- fornecedor;
- URL;
- texto do botão;
- gratuito;
- link de associado;
- produção da IBO;
- fonte;
- ordem;
- observação pública;
- ativo.

Validações:

- URL obrigatória;
- protocolo HTTPS preferencial;
- texto do botão obrigatório;
- provedor obrigatório;
- formato recomendado;
- fonte obrigatória para acesso gratuito externo;
- links do Google Drive e OneDrive devem ser públicos.

## 14.6 Pré-visualização

Antes da publicação, disponibilizar visualização aproximada da página pública.

O botão “Publicar” deverá validar todas as regras do tipo de item.

## 14.7 Painel de relatos

Apresentar tabela com:

- livro;
- fornecedor;
- URL;
- motivo;
- quantidade de relatos;
- primeiro relato;
- último relato;
- status.

Ações:

- abrir link;
- editar acesso;
- desativar acesso;
- marcar em análise;
- marcar resolvido;
- descartar;
- registrar nota administrativa.

Ao corrigir a URL, permitir marcar todos os relatos pendentes daquele acesso como resolvidos.

---

# 15. Experiência visual

# Direção visual — Veredas IBO

## Conceito visual

A interface deve comunicar:

* caminhada;
* orientação;
* descoberta;
* profundidade;
* confiança;
* formação cristã;
* curadoria pastoral.

A referência funcional pode lembrar plataformas de catálogo, mas a estética deve ser editorial e contemplativa, não cinematográfica.

A página não deve parecer:

* uma cópia da Netflix;
* uma loja virtual;
* um portal acadêmico frio;
* um site infantil;
* uma plataforma de cursos pagos.

---

## Identidade

Nome principal:

> **Veredas IBO**

Assinatura sugerida:

> Livros, vídeos e caminhos para o amadurecimento cristão.

Alternativa:

> Curadoria de conteúdos para uma fé bíblica e madura.

O nome “Veredas” deve aparecer com destaque, acompanhado da identificação da Igreja Batista Olaria.

---

## Linguagem visual

A direção estética deve combinar:

* sobriedade;
* calor pastoral;
* espaço em branco;
* tipografia forte;
* fotografias e capas em destaque;
* elementos discretos que remetam a caminho, percurso e orientação.

Evitar excesso de:

* sombras;
* gradientes;
* bordas arredondadas;
* animações;
* efeitos de vidro;
* cores vibrantes;
* ícones decorativos.

---

## Paleta

Usar prioritariamente a identidade visual já existente no portal da IBO.

Caso seja necessário complementar, adotar tons naturais e sóbrios:

* off-white;
* bege;
* areia;
* verde oliva;
* verde escuro;
* marrom suave;
* cinza quente;
* preto suave.

A cor de destaque deve ser usada com moderação em:

* botões;
* filtros ativos;
* etiquetas;
* links;
* estados de foco.

Não utilizar vermelho e preto de forma que remeta à Netflix.

---

## Tipografia

Usar a tipografia já adotada no portal sempre que possível.

A hierarquia deve ser editorial:

* títulos grandes e claros;
* subtítulos curtos;
* textos de apoio com boa largura de leitura;
* metadados menores, mas legíveis;
* destaque visual para “Por que indicamos?”.

Os títulos dos conteúdos não devem ser cortados agressivamente.

Em cards, permitir até duas ou três linhas conforme o contexto.

---

## Página inicial

A página inicial deve conter:

### Hero editorial

Com:

* nome Veredas IBO;
* assinatura;
* breve explicação da proposta;
* campo de busca;
* acesso rápido a vídeos, livros e biblioteca gratuita.

O hero não deve usar carrossel automático.

Pode utilizar:

* fundo claro;
* textura discreta;
* imagem abstrata ou fotografia com caminho, estante, livro ou paisagem;
* linhas gráficas sutis que remetam a percurso.

### Conteúdo em destaque

Um único destaque principal com:

* imagem;
* título;
* tipo;
* descrição curta;
* motivo da indicação;
* botão para acessar.

### Seções editoriais

Exemplos:

* Comece por aqui;
* Fundamentos da fé;
* Bíblia e interpretação;
* História da Igreja;
* Vida cristã;
* Livros para começar;
* Conteúdos para aprofundar;
* Biblioteca gratuita;
* Adicionados recentemente.

---

## Cards de vídeo

Formato preferencial:

* imagem 16:9;
* título;
* expositor ou canal;
* categoria;
* duração;
* nível.

O card deve ser limpo e evitar excesso de informações.

A thumbnail deve manter boa visibilidade e não receber filtros pesados.

---

## Cards de livro

Formato preferencial:

* capa vertical;
* título;
* autor;
* categoria;
* nível;
* selo discreto quando gratuito ou com amostra.

As capas não devem ser deformadas.

Utilizar `object-fit: contain` quando necessário.

O fundo do card deve permitir que capas claras e escuras permaneçam legíveis.

---

## Página de livro

A página deve ter duas áreas principais:

### Apresentação

* capa;
* título;
* autor;
* editora;
* ano;
* nível;
* categorias;
* disponibilidade.

### Curadoria pastoral

* resumo;
* por que indicamos;
* público recomendado;
* ressalvas;
* formas de acesso.

O bloco “Por que indicamos?” deve ter destaque visual próprio.

As formas de acesso devem ser organizadas em grupos claros:

* acesso gratuito;
* aquisição;
* outras opções.

O botão “Reportar link quebrado” deve aparecer discretamente abaixo de cada link.

---

## Página de vídeo

A página deve priorizar:

* player;
* título;
* expositor;
* canal;
* duração;
* nível;
* resumo;
* por que indicamos;
* ressalvas;
* conteúdos relacionados.

O player não deve dominar toda a altura da tela em dispositivos móveis.

---

## Busca e filtros

A busca deve ficar visível e ser fácil de usar.

Filtros devem aparecer como:

* chips;
* botões segmentados;
* selects simples;
* painel lateral em desktop;
* painel recolhível em mobile.

Evitar filtros excessivos na tela inicial.

---

## Sinalização de níveis

Utilizar texto, não apenas cor:

* Introdutório;
* Intermediário;
* Aprofundamento.

Os níveis podem receber pequenos selos visuais.

---

## Elementos de navegação

Navegação principal sugerida:

* Início;
* Vídeos;
* Livros;
* Biblioteca gratuita;
* Sobre.

Trilhas poderão ser adicionadas depois.

No mobile, usar menu simples e acessível.

---

## Animações

Permitidas apenas de forma discreta:

* hover suave;
* transições curtas;
* carregamento;
* expansão de filtros;
* feedback de formulário.

Evitar:

* autoplay;
* parallax;
* zoom excessivo;
* animações contínuas;
* transições cinematográficas.

---

## Responsividade

Priorizar mobile first.

Em telas pequenas:

* hero mais compacto;
* busca em largura total;
* cards em uma ou duas colunas;
* carrosséis com rolagem horizontal controlada;
* filtros recolhíveis;
* botões com área de toque adequada;
* textos sem truncamento excessivo.

---

## Acessibilidade visual

* contraste mínimo adequado;
* foco visível;
* textos alternativos;
* não depender apenas de cor;
* tamanho mínimo confortável de fonte;
* áreas clicáveis amplas;
* ícones acompanhados de texto quando necessário.

---

## Referência funcional

A experiência pode se inspirar em:

* bibliotecas digitais;
* catálogos editoriais;
* plataformas de leitura;
* serviços de curadoria cultural.

A referência à Netflix deve ficar limitada à facilidade de descoberta e organização em coleções, nunca à identidade visual.

---

## Critérios de aceite visual

A interface será considerada adequada quando:

1. parecer claramente parte do portal da IBO;
2. transmitir curadoria pastoral;
3. diferenciar vídeos e livros sem fragmentar a experiência;
4. funcionar bem em celular;
5. manter boa legibilidade;
6. não parecer uma loja;
7. não parecer uma cópia da Netflix;
8. destacar o conteúdo antes dos controles;
9. permitir descoberta rápida;
10. comunicar o conceito de caminhos de formação.


## Cards

### Vídeo

- proporção 16:9;
- thumbnail;
- título;
- expositor ou canal;
- duração;
- nível.

### Livro

- capa vertical;
- título;
- autor;
- categoria;
- indicação de gratuito, amostra ou aquisição.

## Acessibilidade

- contraste adequado;
- navegação por teclado;
- foco visível;
- `aria-label`;
- textos alternativos;
- player com título;
- não depender apenas de cor;
- botões com descrição clara;
- formulário de relato acessível.

---

# 16. SEO

Cada página publicada deverá possuir:

- título;
- descrição;
- URL canônica;
- Open Graph;
- imagem;
- tipo de conteúdo;
- metadados com React Helmet Async.

Gerar sitemap ou integrar as rotas ao mecanismo existente.

Não indexar:

- painel administrativo;
- login;
- rascunhos;
- páginas administrativas de relatos.

---

# 17. Desempenho

- carregar imagens com `loading="lazy"`;
- não carregar todos os vídeos em iframes na listagem;
- usar thumbnail nos cards;
- criar iframe somente na ficha ou após ação do usuário;
- paginar consultas;
- evitar dependências grandes;
- limitar resposta da API;
- usar cache HTTP público de curta duração;
- não consultar serviços externos durante cada renderização;
- não testar automaticamente todos os links em cada acesso ao site.

---

# 18. Auditoria editorial

Criar registro simples de atividades administrativas.

```prisma
model CuradoriaAuditoria {
  id              Int       @id @default(autoincrement())
  usuarioId       String
  usuarioEmail    String?
  acao            String
  entidade        String
  entidadeId      String
  dados           Json?
  criadoEm        DateTime  @default(now())

  @@index([entidade, entidadeId])
  @@index([criadoEm])
}
```

Registrar:

- criação;
- edição;
- publicação;
- arquivamento;
- criação ou alteração de acesso;
- remoção ou desativação de acesso;
- correção de link;
- análise de relato;
- resolução de relato;
- alteração de destaque.

Não registrar:

- senhas;
- tokens;
- service role key;
- IP puro.

---

# 19. Migrações

O agente deverá:

1. analisar o `schema.prisma` existente;
2. adicionar os modelos sem alterar semanticamente os modelos atuais;
3. gerar migration nomeada;
4. revisar o SQL gerado;
5. executar testes no banco de desenvolvimento;
6. documentar aplicação em produção;
7. nunca utilizar `prisma db push` diretamente em produção como substituto de migration;
8. preservar dados existentes.

Migration sugerida:

```text
add_curadoria_ibo_indica
```

---

# 20. Variáveis de ambiente

Verificar e documentar, sem incluir valores reais:

```env
DATABASE_URL=
DIRECT_URL=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Regras:

- variáveis iniciadas por `VITE_` podem ser expostas ao navegador;
- service role nunca pode usar prefixo `VITE_`;
- credenciais administrativas devem existir apenas na Netlify;
- atualizar `.env.example`;
- não alterar ou versionar `.env.local`.

Não criar variáveis relacionadas a Storage.

---

# 21. Testes

## Unitários

- extração de ID do YouTube;
- extração de ASIN;
- geração de slug;
- validação de ISBN;
- validação de URL;
- validação de link público do Google Drive;
- validação de link público do OneDrive;
- regras de publicação;
- agrupamento de acessos;
- filtros;
- rate limit de relatos;
- bloqueio de relato duplicado.

## Integração

- criar rascunho;
- editar;
- publicar;
- arquivar;
- impedir acesso administrativo não autenticado;
- listar apenas publicados;
- buscar e filtrar;
- preservar link de associado;
- cadastrar múltiplos acessos;
- enviar relato;
- impedir spam básico;
- analisar relato;
- corrigir link;
- desativar acesso;
- resolver relatos pendentes.

## Interface

- navegação pública;
- catálogo responsivo;
- formulários;
- mensagens de erro;
- estados vazios;
- carregamento;
- pré-visualização;
- formulário de reporte;
- painel de relatos;
- acessibilidade básica.

## Regressão

Confirmar que continuam funcionando:

- reservas;
- EBF;
- plano de leitura;
- temas de oração;
- APIs existentes;
- build da Netlify;
- Prisma generate;
- rotas atuais.

---

# 22. Critérios de aceite do MVP

O MVP será considerado concluído quando:

1. o visitante acessar `/indica`;
2. for possível listar vídeos e livros publicados;
3. a busca encontrar conteúdos por título e pessoa;
4. os filtros por categoria, tipo e nível funcionarem;
5. cada item possuir página própria;
6. o vídeo puder ser incorporado ou aberto no YouTube;
7. o livro puder ter múltiplas formas de acesso;
8. o link de associado for preservado;
9. links para PDF, EPUB ou amostras externas puderem ser cadastrados;
10. links do Google Drive e OneDrive puderem ser cadastrados;
11. o sistema não armazenar arquivos;
12. o usuário puder reportar link quebrado;
13. os relatos aparecerem no painel;
14. a administração puder corrigir ou desativar o link;
15. rascunhos não aparecerem publicamente;
16. o administrador conseguir cadastrar sem editar código;
17. o administrador conseguir publicar e arquivar;
18. o sistema funcionar em desktop e celular;
19. o build da Netlify passar;
20. os testes essenciais passarem;
21. os módulos existentes não sofrerem regressão;
22. nenhuma funcionalidade exigir serviço pago;
23. o fluxo completo estiver documentado.

---

# 23. Fases de implementação

## Fase 0 — Auditoria e preparação

- ler `AGENTS.md`, `AGENTE.md` ou equivalente;
- mapear arquitetura de pastas;
- identificar padrão atual de rotas;
- identificar padrão de API;
- revisar autenticação existente;
- revisar integração Prisma;
- revisar Netlify Functions;
- verificar capacidade do Supabase atual;
- registrar plano de implementação.

Entregável:

- relatório técnico breve;
- lista de arquivos a alterar;
- riscos;
- sequência de implementação.

## Fase 1 — Persistência

- criar modelos Prisma;
- gerar migration;
- criar seeds básicos;
- implementar repositórios ou services;
- criar validações.

Categorias iniciais sugeridas:

- Bíblia e interpretação;
- Teologia Sistemática;
- História da Igreja;
- Tradição Batista;
- Vida Cristã;
- Igreja e Ministério;
- Família;
- Apologética.

## Fase 2 — API pública

- listagens;
- filtros;
- busca;
- detalhe;
- destaques;
- recentes;
- reporte de links;
- tratamento de erros.

## Fase 3 — Área pública

- rotas;
- homepage;
- catálogos;
- cards;
- fichas;
- biblioteca gratuita;
- reporte de link;
- SEO;
- responsividade.

## Fase 4 — Autenticação e painel

- login;
- proteção;
- dashboard;
- CRUD;
- pré-visualização;
- publicação;
- arquivamento.

## Fase 5 — Acessos e relatos

- múltiplos links;
- links de associado;
- Google Drive;
- OneDrive;
- formulário público;
- proteção contra spam;
- painel de relatos;
- correção e desativação de links.

## Fase 6 — Importações assistidas

- parser de YouTube;
- parser de Amazon;
- fallback manual;
- preservação do link de associado.

## Fase 7 — Testes e documentação

- testes;
- correções;
- auditoria de segurança;
- documentação;
- checklist de deploy;
- registro de mudanças.

---

# 24. Backlog posterior ao MVP

## P1

- trilhas de estudo;
- relação com sermões;
- relação com cursos da igreja;
- verificador automático opcional de links;
- conteúdos relacionados mais inteligentes;
- importação por ISBN;
- integração oficial com Amazon;
- exportação de catálogo;
- resumo periódico de links reportados.

## P2

- revisão editorial com aprovação em duas etapas;
- agendamento de publicação;
- relatório de cliques;
- QR Code;
- recomendação semanal;
- compartilhamento otimizado no WhatsApp;
- dashboard editorial avançado.

## Não planejado

- streaming próprio;
- paywall;
- marketplace;
- rede social;
- comentários públicos;
- IA generativa avaliando livros automaticamente;
- armazenamento próprio de PDF ou EPUB.

---

# 25. Restrições de custo

O desenvolvimento deverá utilizar apenas:

- Netlify no plano atual gratuito;
- Supabase no plano gratuito;
- GitHub;
- Google Drive ou OneDrive gratuitos para materiais da IBO;
- APIs públicas gratuitas e opcionais;
- bibliotecas open source.

Não contratar:

- CMS externo;
- banco adicional pago;
- CDN paga;
- ferramenta de busca paga;
- serviço de autenticação pago;
- armazenamento pago;
- API comercial obrigatória.

Caso algum limite gratuito seja atingido:

1. não ativar cobrança automaticamente;
2. não adicionar cartão ou plano pago;
3. registrar o limite;
4. propor otimização;
5. solicitar decisão humana antes de qualquer mudança financeira.

---

# 26. Observabilidade e manutenção

O sistema deverá registrar erros do backend sem expor dados sensíveis.

Criar tratamento para:

- vídeo removido;
- link externo quebrado;
- página não encontrada;
- link que exige login;
- conteúdo que deixou de ser gratuito;
- erro de autenticação;
- falha do banco;
- item não encontrado;
- excesso de relatos;
- tentativa de spam.

Estados vazios deverão ser amigáveis e não bloquear o painel.

---

# 27. Documentação obrigatória

Criar ou atualizar:

```text
docs/ibo-indica/PRD.md
docs/ibo-indica/ARQUITETURA.md
docs/ibo-indica/BANCO-DE-DADOS.md
docs/ibo-indica/ADMINISTRACAO.md
docs/ibo-indica/LINKS-E-FONTES.md
docs/ibo-indica/DEPLOY.md
docs/ibo-indica/TESTES.md
```

Também atualizar:

- `README.md`, quando necessário;
- `.env.example`;
- protocolo de rastreabilidade existente;
- `AGENTS.md` ou arquivo equivalente;
- histórico de alterações do projeto.

---

# 28. Orientações imperativas ao agente de codificação

1. Leia integralmente os arquivos de instrução e rastreabilidade do repositório antes de alterar código.
2. Faça uma auditoria inicial da implementação existente.
3. Não presuma que a estrutura informada neste PRD corresponde exatamente às pastas atuais.
4. Adapte os nomes e locais ao padrão já consolidado no projeto.
5. Não remova ou reescreva módulos existentes sem necessidade.
6. Não altere a stack principal.
7. Não introduza CMS externo.
8. Não crie novo projeto Supabase sem impedimento técnico comprovado.
9. Não implementar Supabase Storage.
10. Não implementar upload de PDF ou EPUB.
11. Não implementar armazenamento de arquivos.
12. Não implementar scraping da Amazon.
13. Não expor credenciais.
14. Não usar dados simulados em produção.
15. Não desativar automaticamente links reportados.
16. Não coletar dados pessoais desnecessários no formulário de reporte.
17. Não interromper a execução após gerar apenas a estrutura inicial.
18. Execute cada fase até que o respectivo fluxo esteja funcional.
19. Rode lint, typecheck, testes e build.
20. Corrija os erros encontrados.
21. Registre todos os arquivos criados e alterados.
22. Documente migrations e variáveis.
23. Entregue relatório final com:
    - resumo;
    - alterações;
    - decisões;
    - testes;
    - riscos;
    - pendências;
    - instruções de configuração;
    - instruções de deploy.

---

# 29. Definição de pronto

Uma tarefa somente estará pronta quando:

- código implementado;
- tipagem válida;
- lint aprovado;
- testes aprovados;
- build aprovado;
- migration criada;
- documentação atualizada;
- variáveis documentadas;
- segurança revisada;
- fluxo manual testado;
- regressão verificada;
- rastreabilidade registrada.

O agente não deverá declarar conclusão apenas porque os componentes visuais foram criados.

---

# 30. Decisões arquiteturais registradas

## Banco

**Decisão:** utilizar o banco PostgreSQL/Supabase já conectado ao portal.

**Motivos:**

- volume esperado pequeno;
- separação adequada por tabelas;
- Prisma já configurado;
- exigência de custo zero;
- novo projeto aumentaria a complexidade;
- autenticação poderá ser reaproveitada.

## Arquivos

**Decisão:** o veredas ibo não armazenará arquivos.

**Motivos:**

- reduzir complexidade;
- evitar gerenciamento de Storage;
- reduzir risco jurídico;
- evitar controle de permissões de arquivos;
- evitar consumo desnecessário de cota;
- simplificar manutenção;
- manter custo zero.

## Conteúdos gratuitos

**Decisão:** utilizar links para fontes oficiais.

Prioridade:

1. editora;
2. autor;
3. instituição responsável;
4. biblioteca digital legítima;
5. Google Drive ou OneDrive institucional para materiais da IBO.

## Links quebrados

**Decisão:** implementar reporte público.

**Motivos:**

- evitar verificação manual constante;
- envolver usuários na manutenção;
- identificar conteúdos removidos;
- manter o catálogo confiável;
- reduzir automações e consumo de recursos.

---

# 31. Resultado esperado

Ao final do MVP, a Igreja Batista Olaria deverá possuir um ambiente integrado ao site no qual:

- visitantes encontrem vídeos e livros confiáveis;
- o pastor explique suas indicações;
- livros tenham opções independentes de acesso;
- materiais gratuitos sejam acessados por fontes legítimas;
- materiais da IBO sejam distribuídos por links institucionais;
- links de aquisição possam incluir associação;
- usuários possam reportar links quebrados;
- a administração possa corrigir os links pelo painel;
- o catálogo seja atualizado sem edição de código;
- o funcionamento permaneça gratuito;
- a manutenção seja simples e sustentável.