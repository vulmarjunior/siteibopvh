# Central Administrativa IBO — Supabase de homologação

Data de preparação: 8 de agosto de 2026.

## Projetos

| Ambiente | Projeto | Project ref | Região |
|---|---|---|---|
| Produção | `ibopvh-producao` | `tyqdxqfuppmwtkxbpvho` | `sa-east-1` |
| Homologação | `ibopvh-homologacao` | `nvjxhfdoxpcdraovgsuu` | `sa-east-1` |

## Estado da homologação

- esquema Prisma aplicado pelas migrações versionadas;
- 17 tabelas públicas criadas sem dados de produção;
- RLS habilitado em todas as tabelas públicas;
- nenhuma política pública criada deliberadamente: o acesso aos dados ocorre pelo backend Prisma;
- primeiro usuário do Supabase Auth convidado: `vulmarjunior@ibopvh.com.br`;
- perfil correspondente criado em `CuradoriaUsuario` como `ADMIN` ativo (`ADMIN_GERAL` na Central);
- nenhuma variável da Vercel ou do ambiente de produção alterada.

## Migrações aplicadas

1. `20260701_initial_prayer_schema`
2. `20260712_add_ebf_registration`
3. `20260718_add_reading_subscribers`
4. `20260806_add_veredas_ibo_curadoria`
5. `20260808_enable_rls_public_tables`

## Configuração local pendente

O arquivo `.env.local` só deve ser direcionado para homologação quando estiverem disponíveis, para o mesmo projeto:

- `DATABASE_URL` e `DIRECT_URL` de homologação;
- `SUPABASE_URL` e `VITE_SUPABASE_URL` de homologação;
- `SUPABASE_ANON_KEY` e `VITE_SUPABASE_ANON_KEY` de homologação.

Não misturar URL/chave de Auth da homologação com conexão Prisma de produção. Isso criaria identidades em um projeto e perfis administrativos em outro.

## Primeiro administrador de teste

1. aceitar o convite enviado para `vulmarjunior@ibopvh.com.br` e definir a senha de homologação;
2. configurar as variáveis locais para apontarem integralmente ao projeto de homologação;
3. validar login, `/api/admin/auth/me`, logout e os registros em `CuradoriaAuditoria`;
4. nunca copiar senha ou sessão de produção.
