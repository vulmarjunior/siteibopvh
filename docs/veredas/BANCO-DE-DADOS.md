# Banco de Dados — Veredas IBO

## Entidades e Relacionamentos

- `CuradoriaItem`: Entidade base compartilhada entre Livros e Vídeos.
- `CuradoriaLivro`: Metadados bibliográficos do livro.
- `CuradoriaVideo`: Metadados do vídeo (YouTube).
- `CuradoriaCategoria`: Classificação temática (ex: Bíblia e Interpretação, Teologia Sistemática).
- `CuradoriaItemCategoria`: Relação N:N item-categoria.
- `CuradoriaPessoa`: Autores, pregadores e expositores.
- `CuradoriaLivroPessoa`: Relação N:N livro-pessoa com ordenação (`ordem`).
- `CuradoriaVideoPessoa`: Relação N:N vídeo-pessoa com ordenação (`ordem`).
- `CuradoriaAcesso`: Opções de aquisição, leitura digital, amostras ou downloads institucionais da IBO.
- `CuradoriaLinkRelato`: Registros públicos de reporte de link quebrado com rate limit persistido.
- `CuradoriaUsuario`: Tabela de autorização vinculada ao UUID do Supabase Auth (`id @db.Uuid`).
- `CuradoriaAuditoria`: Histórico de ações editoriais.

## Migrações Prisma
- Seed oficial via `prisma/seed.ts` utilizando `upsert`.
