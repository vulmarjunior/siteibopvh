# Limites e responsabilidades operacionais

## Verificação mensal

| Serviço | Conferir | Sinal para reavaliar o plano |
|---|---|---|
| Supabase Database | tamanho, conexões e crescimento por tabela | tendência de atingir 70% do limite ou necessidade de disponibilidade contínua |
| Supabase Storage | tamanho e transferência | 70% do limite ou arquivos essenciais sem backup externo |
| Supabase Auth | usuários ativos e falhas | crescimento anormal, abuso ou necessidade de controles avançados |
| Vercel | funções, execução, transferência e erros | 70% da franquia ou falhas por limite |
| Resend | envios diários/mensais, rejeições e domínio | 70% da franquia, bloqueios ou necessidade de volume previsível |
| Backups | idade, tamanho, hash e último teste | backup vencido ou restauração nunca testada |

## Baseline de homologação

Registrado em 10 de agosto de 2026:

- banco: 13 MB;
- reservas do Relógio: 0;
- inscrições EBF: 0;
- mensagens editoriais: 27;
- itens Veredas: 0.

Esses números são apenas do ambiente de homologação e não representam produção.

## Responsabilidades dos módulos

- Central: autenticação, permissões, navegação e auditoria;
- Séries: conteúdo editorial, mídia por URL, leitura e publicação;
- Veredas: curadoria teológica e relatos de links;
- Relógio: reservas, pedidos pessoais e temas de oração;
- EBF: inscrições isoladas por edição;
- módulos sazonais: ciclo de vida e página de encerramento;
- Resend: entrega de mensagens, não armazenamento editorial;
- Supabase: banco e autenticação; acesso público direto permanece bloqueado por RLS;
- Vercel: execução e entrega da aplicação.

## Falhas seguras

- falha da API editorial não reativa JSON antigo nem publica rascunhos;
- falha na consulta de módulos usa estado público conservador;
- falha no e-mail não desfaz uma gravação válida, mas deve ser registrada;
- ausência de token administrativo retorna `401`;
- falta de permissão retorna `403`;
- pedidos pessoais não aparecem em exportações nem em auditoria;
- operações públicas encerradas retornam `410`.
