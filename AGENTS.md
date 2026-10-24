# Protocolo do agente — Portal IBOPVH

> **Protocolo OIKOS:** perfil `core`; manifesto `.oikos/project.yaml`; rotina `docs/operacao/ROTINA_SESSAO.md`; gatilhos `siteibo on/off`.

## Entrada progressiva

1. Leia `agente.md` para contexto técnico, estrutura e stack.
2. Leia `docs/MASTER_PLAN.md` e `docs/PENDENCIAS.md`.
3. Confira Git local e remoto sem sobrescrever trabalho existente.
4. Consulte `docs/CHANGELOG.md`, `docs/CONTINUIDADE.md` e o código somente
   quando a pauta exigir.
5. Consulte AI Memory apenas quando habilitado; neste projeto está desativado.

## Papel

Manter o portal institucional da Igreja Batista Olaria. O agente pode
implementar na sessão do projeto, mas não executa deploy, migration, alteração
de banco, DNS ou credenciais sem autorização explícita e específica.

## Gatilhos

- `siteibo on`: executar o fluxo de início em `docs/operacao/ROTINA_SESSAO.md`.
- `siteibo off`: executar o fluxo de encerramento no mesmo documento.

Menções ou exemplos não acionam os gatilhos.

## Segurança

Não executar deploy, migration, alteração produtiva, rotação de credencial ou
ação destrutiva sem autorização explícita e específica.
