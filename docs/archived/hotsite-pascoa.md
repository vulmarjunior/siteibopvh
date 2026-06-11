# Plano de Implementação: Hotsite Semana da Paixão e Ressurreição

## Overview

Implementação de um hotsite (landing page) no portal-ibopvh para a "Semana da Paixão e Ressurreição" (Páscoa 2026). A página única foca em duas celebrações distintas (Cerimônia Tenebras e Culto da Ressurreição) através de uma estrutura visualmente contrastante (luz e sombra, estilo low-poly), incorporando o design premium do projeto atual de forma respeitosa, poética e persuasiva.

## Project Type

**WEB**

## Success Criteria

- [ ] O hotsite apresenta o fluxo "Trevas → Luz" perfeitamente transicionado entre as seções.
- [ ] CTAs claros e textos litúrgicos da semana exibidos nas seções apropriadas.
- [ ] Responsividade 100% Mobile-first assegurada (cards empilhados, toques acessíveis).
- [ ] Acessibilidade e tipografia (serifada elegante e sans moderna) respeitando contraste AA.
- [ ] Adoção estética correta das imagens providenciadas ou geradas (sem cenas diretas de pessoas ou adoração).
- [ ] Mapa e FAQ embutidos corretamente.

## Tech Stack

- Frontend: **Next.js 16 (React)** integrado ao ecosistema do `portal-ibopvh`.
- Estilos: **Tailwind CSS v4** mantendo os padrões estéticos definidos em `index.css`.
- UI/UX: Customização de componentes e uso de ícones estilo *Lucide*.

## File Structure

**Diretório Base**: `app/semana-paixao-ressurreicao/` (ou endpoint associado `app/pascoa/`)

```text
app/pascoa/
├── page.tsx                           (Landing page agrupadora)
components/pascoa/
├── PascoaHeader.tsx                   (Menu Topo dinâmico com âncoras)
├── PascoaHero.tsx                     (Dobra principal com estilo low-poly/sombra-luz)
├── PascoaSobre.tsx                    (Resumo poético da semana)
├── PascoaTenebras.tsx                 (Seção 1: Sombras / layout escuro)
├── PascoaRessurreicao.tsx             (Seção 2: Luz / layout iluminado)
├── PascoaProgramacao.tsx              (Agenda das celebrações c/ Add to Calendar)
├── PascoaLocalizacao.tsx              (Google Maps c/ infos de estacionamento)
├── PascoaFAQ.tsx                      (Dúvidas frequentes do evento)
└── PascoaFooter.tsx                   (Rodapé institucional)
```

## Task Breakdown

### Tarefa 1: Configuração do Roteamento e Core da Página

- **Description**: Criar estrutura básica usando `page.tsx` e integrar o Header customizado.
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `clean-code`
- **INPUT**: Solicitação do Hotsite.
- **OUTPUT**: Rota `/pascoa` alcançável com Header de navegação de âncoras funcionando.
- **VERIFY**: Header com botões responsivos ("Sobre", "Tenebras", "Ressurreição", etc) e clique rolando para seções vazias.

### Tarefa 2: Seção Hero e Visão Geral (Sobre)

- **Description**: Implementar a dobra principal com Título H1, subtítulo, dados rápidos (2 cards minerais low-poly) e botão CTA, seguida da seção 'Sobre'.
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `tailwind-patterns`
- **INPUT**: Imagens base de estilo geométrico. Ref. Títulos.
- **OUTPUT**: `PascoaHero.tsx` e `PascoaSobre.tsx`.
- **VERIFY**: Tipografia serif exibe "Semana da Paixão e Ressurreição"; fundo em overlay atinge leitura AA; Cards apresentam "Tenebras" e "Ressurreição" ao lado.

### Tarefa 3: Seção "Tenebras" e "Culto da Ressurreição"

- **Description**: Implementar `PascoaTenebras.tsx` (fundo carvão/grafite, detalhes em cobre, 2 col) e `PascoaRessurreicao.tsx` (fundo off-white, aspeto luminoso). Em cada uma, incluir o "Convite".
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `web-design-guidelines`
- **INPUT**: Referências de paleta contrastante e textos-convite litúrgicos.
- **OUTPUT**: Duas seções altamente polidas demonstrando "Trevas → Luz".
- **VERIFY**: Fator wow e contraste entre as duas; ambas contendo o texto, a info central, e "O que esperar" em bullets.

### Tarefa 4: Programação, Localização, FAQ e Componentes Finais

- **Description**: Inserir os cards de data com ação de "Adicionar Calendário/Mapa", construir FAQ em accordion/lista e incluir Footer simplificado.
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `frontend-design`
- **INPUT**: Infos de como chegar, 6 perguntas para o FAQ e texto unificador para rodapé.
- **OUTPUT**: `PascoaProgramacao.tsx`, `PascoaLocalizacao.tsx`, `PascoaFAQ.tsx`, `PascoaFooter.tsx`.
- **VERIFY**: FAQ recolhível e legível; Botões secundários arredondados; Mapa com placeholder correto.

## Phase X: Verificações Finais

- [ ] Executar `npx tsc --noEmit` e `npm run lint`.
- [ ] Rodar **ux_audit.py** se aplicável para garantir aderência de regras de UI (se disponível no ambiente).
- [ ] Auditar contraste e tamanhos dos toques no Mobile (botões de agenda e menu hambúrguer).
- [ ] Nenhúm código violeta/roxo em uso; aderência absoluta às cores "terrosas", "carvão" e "off-white" definidas.
