# Central Administrativa IBO — Etapa 12: limpeza e endurecimento

Data: 10 de agosto de 2026.

## Removido

- painéis administrativos antigos do Relógio e da EBF;
- login administrativo duplicado do Veredas;
- compatibilidade com token local legado do Veredas;
- endpoints administrativos protegidos por `ADMIN_PASSWORD`;
- senhas administrativas em query strings;
- endpoint público de diagnóstico de ambiente;
- endpoint administrativo de seed;
- teste de e-mail legado da Parousia;
- consumo operacional de `sermoes.json`.

O arquivo histórico `sermoes.json` permanece no repositório sem consumidor em produção. Sua exclusão física exige aprovação específica junto com os demais materiais históricos.

## Endurecimento

- dados inseridos por usuários são escapados antes de entrar em e-mails HTML;
- healthcheck retorna somente estado genérico;
- EBF e Parousia foram extraídas do backend monolítico para routers públicos próprios;
- APIs administrativas permanecem separadas por domínio;
- falha da API da Parousia resulta em estado indisponível, sem reativar fonte editorial antiga;
- dados pessoais foram revisados: interfaces públicas expõem apenas primeiro nome quando necessário; detalhes permanecem em APIs autenticadas;
- procedimentos de backup, restauração, limites e responsabilidades foram documentados.

## Pendências operacionais externas

- configurar uma chave válida do Resend;
- executar o primeiro dump criptografado fora do repositório;
- testar a restauração em projeto descartável, o que pode exigir criação de recurso e confirmação de custo;
- aplicar a migração da EBF em produção somente após conferência dos totais;
- remover `ADMIN_PASSWORD` dos ambientes Vercel/produção depois do deploy desta versão;
- configurar monitoramento mensal conforme o documento operacional.
- habilitar **Leaked Password Protection** no Supabase Auth; o advisor de segurança marcou a proteção como desativada ([orientação oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).

## Validação técnica esperada

- busca no código sem `ADMIN_PASSWORD`, senha em URL, token legado ou import de `sermoes.json`;
- endpoints legados retornam `404` após reinício;
- endpoints administrativos novos retornam `401` sem sessão;
- build e testes completos aprovados;
- fluxos públicos de séries, Relógio, EBF e Veredas preservados.

## Resultado da verificação local

- endpoints legados do Relógio, EBF e diagnóstico: `404` JSON;
- API administrativa nova sem token: `401` JSON;
- API pública da Parousia: `200` JSON;
- healthcheck: `200` JSON;
- 15 arquivos e 96 testes aprovados;
- build de produção aprovado.
