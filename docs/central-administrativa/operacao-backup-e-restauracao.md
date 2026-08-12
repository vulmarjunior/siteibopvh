# Operação de backup e restauração

## Política

- banco oficial: `ibopvh-producao`;
- homologação: `ibopvh-homologacao`;
- manter backup lógico fora do Supabase, com acesso restrito e criptografia;
- frequência inicial: semanal e imediatamente antes de qualquer migração de produção;
- retenção sugerida: quatro backups semanais e três mensais;
- nunca armazenar dumps, senhas ou chaves dentro do repositório Git.

No plano gratuito, não presumir a existência de backups automáticos restauráveis. A documentação oficial recomenda exportações regulares com `supabase db dump` para projetos gratuitos.

## Criar backup lógico

Pré-requisitos: CLI atual do Supabase, autenticação concluída e senha do banco disponível somente na sessão local.

```powershell
npx supabase db dump --db-url "CONEXAO_DE_SESSAO" --file "CAMINHO_SEGURO\ibopvh-AAAA-MM-DD.sql"
```

Depois do dump:

1. registrar data, ambiente, tamanho e responsável;
2. calcular e guardar o hash SHA-256 ao lado do arquivo;
3. criptografar o arquivo;
4. copiar para armazenamento externo restrito;
5. remover cópias temporárias não criptografadas.

O Storage precisa de rotina separada: backup do banco guarda metadados, não restaura arquivos excluídos dos buckets.

## Teste de restauração

Nunca testar restauração sobre produção.

1. criar ou selecionar um projeto descartável autorizado;
2. restaurar o dump usando conexão de sessão e ferramentas PostgreSQL compatíveis;
3. aplicar migrações posteriores ao horário do backup, se necessário;
4. regenerar o Prisma Client;
5. comparar contagens por tabela com o relatório do backup;
6. testar login, séries, Veredas, Relógio e histórico da EBF;
7. conferir RLS e executar os advisors de segurança;
8. registrar o resultado e destruir o ambiente descartável somente após aprovação.

Uma restauração não é considerada testada apenas porque o dump foi criado. O primeiro exercício completo requer um projeto descartável e confirmação de custo, caso aplicável.

## Recuperação de produção

1. declarar janela de manutenção e interromper gravações;
2. obter aprovação explícita do responsável;
3. escolher o backup imediatamente anterior ao incidente;
4. restaurar pelo Dashboard quando houver backup gerenciado ou pelo procedimento lógico;
5. redefinir senhas de papéis personalizados, se existirem;
6. validar RLS, contagens, autenticação e fluxos críticos;
7. reabrir operações gradualmente;
8. registrar causa, perda máxima de dados e horário de retorno.

Referência: [Backups do Supabase](https://supabase.com/docs/guides/platform/backups).

