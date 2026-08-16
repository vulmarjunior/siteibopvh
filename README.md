# Portal Igreja Batista Olaria (IBOPVH)

Repositório do frontend do portal institucional da Igreja Batista Olaria - Porto Velho, Rondônia.

## Documentação

Toda a arquitetura e detalhes técnicos deste repositório estão documentados nos arquivos abaixo. Se você é um desenvolvedor (ou agente de IA), por favor leia os documentos antes de prosseguir:

- **[agente.md](agente.md)**: Documentação completa do projeto, estrutura de pastas, tecnologias e contexto das páginas (uso primário para IAs e novos contribuintes).
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)**: Histórico detalhado de todas as atualizações de funcionalidades, refatorações e correções.
- **`docs/`**: Contém manuais operacionais específicos para sistemas individuais (ex: galeria de fotos da EBF).

## Como Executar Localmente

### Pré-requisitos
- Node.js (v18+)
- Prisma instalado globalmente ou usando `npx`

### Passos

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie seu banco de dados SQLite temporário e gere as tipagens do Prisma:
   ```bash
   npx prisma generate
   ```
3. Defina as variáveis de ambiente necessárias copiando o modelo:
   ```bash
   cp .env.example .env.local
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy

O projeto está configurado para publicação automática na plataforma **Netlify**, conectando-se via API (Serverless Functions) na pasta `/netlify` para acessar o banco de dados PostgreSQL real em produção.
## Preços automáticos de livros no Veredas

Os preços dos links de compra da Amazon podem ser atualizados automaticamente pela Creators API. Configure no ambiente do servidor:

```env
AMAZON_CREATORS_CLIENT_ID=
AMAZON_CREATORS_CLIENT_SECRET=
AMAZON_CREATORS_PARTNER_TAG=
```

O Veredas usa o ASIN presente no link Amazon, mantém o resultado em cache por 12 horas e oculta o preço quando não há credenciais ou oferta válida. Nunca exponha essas variáveis com o prefixo `VITE_`.
