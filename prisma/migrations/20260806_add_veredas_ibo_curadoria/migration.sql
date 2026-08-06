-- CreateEnum
CREATE TYPE "CuradoriaTipoItem" AS ENUM ('VIDEO', 'LIVRO');
CREATE TYPE "CuradoriaNivel" AS ENUM ('INTRODUTORIO', 'INTERMEDIARIO', 'APROFUNDAMENTO');
CREATE TYPE "CuradoriaStatus" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ARQUIVADO');
CREATE TYPE "CuradoriaDisponibilidade" AS ENUM ('DISPONIVEL', 'GRATUITO', 'SOMENTE_DIGITAL', 'ESGOTADO', 'FORA_DE_CATALOGO', 'AQUISICAO_NAO_LOCALIZADA', 'INDISPONIVEL_TEMPORARIAMENTE');
CREATE TYPE "CuradoriaPapelPessoa" AS ENUM ('AUTOR', 'ORGANIZADOR', 'TRADUTOR', 'PREFACIADOR', 'EXPOSITOR', 'PREGADOR', 'ENTREVISTADOR', 'ENTREVISTADO', 'DEBATEDOR');
CREATE TYPE "CuradoriaTipoAcesso" AS ENUM ('COMPRA', 'LEITURA_ONLINE', 'DOWNLOAD_INTEGRAL', 'AMOSTRA', 'PAGINA_OFICIAL', 'EMPRESTIMO', 'MATERIAL_COMPLEMENTAR');
CREATE TYPE "CuradoriaFormatoAcesso" AS ENUM ('IMPRESSO', 'PDF', 'EPUB', 'KINDLE', 'WEB', 'VIDEO', 'OUTRO');
CREATE TYPE "CuradoriaProvedorAcesso" AS ENUM ('AMAZON', 'EDITORA', 'LIVRARIA', 'ESTANTE_VIRTUAL', 'GOOGLE_DRIVE', 'ONEDRIVE', 'SITE_AUTOR', 'SITE_INSTITUCIONAL', 'BIBLIOTECA_DIGITAL', 'OUTRO');
CREATE TYPE "CuradoriaMotivoRelato" AS ENUM ('LINK_NAO_ABRE', 'PAGINA_NAO_ENCONTRADA', 'CONTEUDO_REMOVIDO', 'EXIGE_LOGIN', 'NAO_E_MAIS_GRATUITO', 'CONTEUDO_INCORRETO', 'REDIRECIONAMENTO_INDESEJADO', 'OUTRO');
CREATE TYPE "CuradoriaStatusRelato" AS ENUM ('PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'DESCARTADO');
CREATE TYPE "CuradoriaPapelUsuario" AS ENUM ('ADMIN', 'CURADOR');

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaItem" (
    "id" SERIAL NOT NULL,
    "tipo" "CuradoriaTipoItem" NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "descricao" TEXT,
    "porqueIndicamos" TEXT NOT NULL,
    "ressalvas" TEXT,
    "publicoIndicado" TEXT,
    "nivel" "CuradoriaNivel" NOT NULL,
    "status" "CuradoriaStatus" NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordemDestaque" INTEGER,
    "imagemUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publicadoEm" TIMESTAMP(3),
    "arquivadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CuradoriaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaLivro" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "subtitulo" TEXT,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "asin" TEXT,
    "editora" TEXT,
    "anoPublicacao" INTEGER,
    "edicao" TEXT,
    "idioma" TEXT,
    "numeroPaginas" INTEGER,
    "formatoPrincipal" TEXT,
    "capaUrl" TEXT,
    "disponibilidade" "CuradoriaDisponibilidade" NOT NULL DEFAULT 'DISPONIVEL',
    CONSTRAINT "CuradoriaLivro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaVideo" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "youtubeId" TEXT,
    "urlOriginal" TEXT NOT NULL,
    "canal" TEXT,
    "duracaoSegundos" INTEGER,
    "publicadoOriginalEm" TIMESTAMP(3),
    "thumbnailUrl" TEXT,
    "incorporavel" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CuradoriaVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaCategoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CuradoriaCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaItemCategoria" (
    "itemId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    CONSTRAINT "CuradoriaItemCategoria_pkey" PRIMARY KEY ("itemId","categoriaId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaPessoa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CuradoriaPessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaLivroPessoa" (
    "livroId" INTEGER NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "papel" "CuradoriaPapelPessoa" NOT NULL DEFAULT 'AUTOR',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CuradoriaLivroPessoa_pkey" PRIMARY KEY ("livroId","pessoaId","papel")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaVideoPessoa" (
    "videoId" INTEGER NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "papel" "CuradoriaPapelPessoa" NOT NULL DEFAULT 'EXPOSITOR',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CuradoriaVideoPessoa_pkey" PRIMARY KEY ("videoId","pessoaId","papel")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaAcesso" (
    "id" SERIAL NOT NULL,
    "livroId" INTEGER NOT NULL,
    "tipo" "CuradoriaTipoAcesso" NOT NULL,
    "formato" "CuradoriaFormatoAcesso",
    "provedor" "CuradoriaProvedorAcesso",
    "fornecedor" TEXT,
    "url" TEXT NOT NULL,
    "textoBotao" TEXT NOT NULL,
    "gratuito" BOOLEAN NOT NULL DEFAULT false,
    "linkAssociado" BOOLEAN NOT NULL DEFAULT false,
    "producaoIbo" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "observacaoPublica" TEXT,
    "fonte" TEXT,
    "ultimaVerificacaoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CuradoriaAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaLinkRelato" (
    "id" SERIAL NOT NULL,
    "acessoId" INTEGER NOT NULL,
    "motivo" "CuradoriaMotivoRelato" NOT NULL,
    "observacao" TEXT,
    "status" "CuradoriaStatusRelato" NOT NULL DEFAULT 'PENDENTE',
    "ipHash" TEXT,
    "userAgentResumido" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analisadoEm" TIMESTAMP(3),
    "resolvidoEm" TIMESTAMP(3),
    "resolvidoPor" TEXT,
    "notaAdministrativa" TEXT,
    CONSTRAINT "CuradoriaLinkRelato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaUsuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "papel" "CuradoriaPapelUsuario" NOT NULL DEFAULT 'CURADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcessoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CuradoriaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CuradoriaAuditoria" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "usuarioEmail" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "dados" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CuradoriaAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaItem_slug_key" ON "CuradoriaItem"("slug");
CREATE INDEX IF NOT EXISTS "CuradoriaItem_status_publicadoEm_idx" ON "CuradoriaItem"("status", "publicadoEm");
CREATE INDEX IF NOT EXISTS "CuradoriaItem_tipo_status_idx" ON "CuradoriaItem"("tipo", "status");
CREATE INDEX IF NOT EXISTS "CuradoriaItem_destaque_status_idx" ON "CuradoriaItem"("destaque", "status");
CREATE INDEX IF NOT EXISTS "CuradoriaItem_nivel_status_idx" ON "CuradoriaItem"("nivel", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaLivro_itemId_key" ON "CuradoriaLivro"("itemId");
CREATE INDEX IF NOT EXISTS "CuradoriaLivro_disponibilidade_idx" ON "CuradoriaLivro"("disponibilidade");

CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaVideo_itemId_key" ON "CuradoriaVideo"("itemId");
CREATE INDEX IF NOT EXISTS "CuradoriaVideo_youtubeId_idx" ON "CuradoriaVideo"("youtubeId");

CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaCategoria_nome_key" ON "CuradoriaCategoria"("nome");
CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaCategoria_slug_key" ON "CuradoriaCategoria"("slug");
CREATE INDEX IF NOT EXISTS "CuradoriaCategoria_ativa_ordem_idx" ON "CuradoriaCategoria"("ativa", "ordem");

CREATE INDEX IF NOT EXISTS "CuradoriaItemCategoria_categoriaId_idx" ON "CuradoriaItemCategoria"("categoriaId");
CREATE INDEX IF NOT EXISTS "CuradoriaItemCategoria_itemId_idx" ON "CuradoriaItemCategoria"("itemId");

CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaPessoa_slug_key" ON "CuradoriaPessoa"("slug");
CREATE INDEX IF NOT EXISTS "CuradoriaPessoa_ativa_idx" ON "CuradoriaPessoa"("ativa");

CREATE INDEX IF NOT EXISTS "CuradoriaLivroPessoa_pessoaId_idx" ON "CuradoriaLivroPessoa"("pessoaId");
CREATE INDEX IF NOT EXISTS "CuradoriaLivroPessoa_livroId_ordem_idx" ON "CuradoriaLivroPessoa"("livroId", "ordem");

CREATE INDEX IF NOT EXISTS "CuradoriaVideoPessoa_pessoaId_idx" ON "CuradoriaVideoPessoa"("pessoaId");
CREATE INDEX IF NOT EXISTS "CuradoriaVideoPessoa_videoId_ordem_idx" ON "CuradoriaVideoPessoa"("videoId", "ordem");

CREATE INDEX IF NOT EXISTS "CuradoriaAcesso_livroId_ativo_idx" ON "CuradoriaAcesso"("livroId", "ativo");
CREATE INDEX IF NOT EXISTS "CuradoriaAcesso_gratuito_ativo_idx" ON "CuradoriaAcesso"("gratuito", "ativo");
CREATE INDEX IF NOT EXISTS "CuradoriaAcesso_tipo_ativo_idx" ON "CuradoriaAcesso"("tipo", "ativo");

CREATE INDEX IF NOT EXISTS "CuradoriaLinkRelato_acessoId_idx" ON "CuradoriaLinkRelato"("acessoId");
CREATE INDEX IF NOT EXISTS "CuradoriaLinkRelato_status_criadoEm_idx" ON "CuradoriaLinkRelato"("status", "criadoEm");
CREATE INDEX IF NOT EXISTS "CuradoriaLinkRelato_ipHash_criadoEm_idx" ON "CuradoriaLinkRelato"("ipHash", "criadoEm");

CREATE UNIQUE INDEX IF NOT EXISTS "CuradoriaUsuario_email_key" ON "CuradoriaUsuario"("email");
CREATE INDEX IF NOT EXISTS "CuradoriaUsuario_ativo_idx" ON "CuradoriaUsuario"("ativo");
CREATE INDEX IF NOT EXISTS "CuradoriaUsuario_papel_idx" ON "CuradoriaUsuario"("papel");

CREATE INDEX IF NOT EXISTS "CuradoriaAuditoria_entidade_entidadeId_idx" ON "CuradoriaAuditoria"("entidade", "entidadeId");
CREATE INDEX IF NOT EXISTS "CuradoriaAuditoria_criadoEm_idx" ON "CuradoriaAuditoria"("criadoEm");

-- AddForeignKeys
ALTER TABLE "CuradoriaLivro" ADD CONSTRAINT "CuradoriaLivro_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CuradoriaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaVideo" ADD CONSTRAINT "CuradoriaVideo_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CuradoriaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaItemCategoria" ADD CONSTRAINT "CuradoriaItemCategoria_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CuradoriaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaItemCategoria" ADD CONSTRAINT "CuradoriaItemCategoria_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CuradoriaCategoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaLivroPessoa" ADD CONSTRAINT "CuradoriaLivroPessoa_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "CuradoriaLivro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaLivroPessoa" ADD CONSTRAINT "CuradoriaLivroPessoa_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "CuradoriaPessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaVideoPessoa" ADD CONSTRAINT "CuradoriaVideoPessoa_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "CuradoriaVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaVideoPessoa" ADD CONSTRAINT "CuradoriaVideoPessoa_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "CuradoriaPessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaAcesso" ADD CONSTRAINT "CuradoriaAcesso_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "CuradoriaLivro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuradoriaLinkRelato" ADD CONSTRAINT "CuradoriaLinkRelato_acessoId_fkey" FOREIGN KEY ("acessoId") REFERENCES "CuradoriaAcesso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
