markdown
PRD — Relógio de Oração

Igreja Batista Olaria · Porto Velho/RO

**Versão:** 3.0 — Final (Versão Enxuta)
**Data:** Junho/2026
**Classificação:** Documento de Requisitos de Produto — Experimento de Engajamento
**Repositório:** Separado do Mordomo (IBO) — Hotsite independente
**URL de produção:** `relogio.ibopvh.com.br`

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Objetivos](#2-objetivos)
3. [Público-Alvo](#3-público-alvo)
4. [Princípio Diretor](#4-princípio-diretor)
5. [Modelo de Slots](#5-modelo-de-slots)
6. [Funcionalidades](#6-funcionalidades)
7. [Fluxo do Usuário](#7-fluxo-do-usuário)
8. [Fluxo do Administrador](#8-fluxo-do-administrador)
9. [Design System](#9-design-system)
10. [Requisitos Não Funcionais](#10-requisitos-não-funcionais)
11. [Modelo de Dados](#11-modelo-de-dados)
12. [Arquitetura Técnica](#12-arquitetura-técnica)
13. [Plano de Implementação](#13-plano-de-implementação)
14. [Decisões de Simplificação](#14-decisões-de-simplificação)
15. [Impacto do Documento Técnico IBO](#15-impacto-do-documento-técnico-ibo)
16. [Critérios de Aceitação Consolidados](#16-critérios-de-aceitação-consolidados)
17. [Glossário](#17-glossário)

---

## 1. Visão Geral

O **Relógio de Oração** é um hotsite independente e experimental que organiza a cobertura de oração da Igreja Batista Olaria em **24 slots por hora cheia**, com capacidade de até **4 intercessores por slot**, totalizando até 96 responsáveis simultâneos distribuídos ao longo do dia.

O acesso é simplificado — apenas nome e e-mail, sem cadastro, sem senha — e o sistema envia automaticamente um e-mail de confirmação com arquivo ICS para integração à agenda pessoal do membro.

O foco é engajamento máximo com complexidade mínima. Este é um experimento: se provar valor junto à congregação, uma versão 2.0 com funcionalidades avançadas será desenvolvida com base real de uso.

### Problema que Resolve

Iniciativas de oração contínua frequentemente falham por três razões: falta de organização, ausência de visibilidade e falta de lembretes. O Relógio de Oração resolve os três com uma solução centralizada, intuitiva e inspiradora.

### Declaração de Valor

> *"Um lugar onde cada membro encontra seu horário, assume seu compromisso e sabe que, quando orar, não estará só — a igreja toda estará ao redor do trono da graça."*

---

## 2. Objetivos

- **OBJ-01** — Facilitar a inscrição de membros em horários de oração de forma autônoma, sem intermediários.
- **OBJ-02** — Garantir visibilidade clara da cobertura de oração ao longo das 24 horas do dia.
- **OBJ-03** — Aumentar o engajamento oracional da congregação tornando o compromisso individual visível e significativo para o coletivo.
- **OBJ-04** — Reduzir desistências mediante lembretes automáticos com integração à agenda pessoal (arquivo ICS).
- **OBJ-05** — Prover ao pastor e à liderança uma visão clara de quem está intercedendo e em quais horários.
- **OBJ-06** — Validar, como experimento, se os membros da IBO se engajam digitalmente em compromissos de oração estruturada.

---

## 3. Público-Alvo

| **Congregante** | Participação irregular, pode se engajar esporadicamente | Reserva de slots |
| **Administrador** | Pastor ou secretário responsável pelo sistema | Acesso total ao painel admin |

---

## 4. Princípio Diretor

> *Cada decisão de design deve responder à pergunta: isso facilita ou complica a participação do membro? Se complicar, eliminar.*

Este princípio governa todas as escolhas de funcionalidade, interface e arquitetura desta versão.

---

## 5. Modelo de Slots

### 5.1 Estrutura do Calendário

- **24 slots por dia** — um por hora cheia (00:00, 01:00, 02:00... 23:00).
- **Até 4 intercessores por slot** — capacidade configurável pelo admin via painel.
- Cada reserva é individual: um membro pode reservar quantos slots quiser, sem limite de cota nesta versão.

### 5.2 Representação Visual dos Slots

| Visual | Significado
| `● ● ● ○` | 3 reservados, 1 livre |

### 5.3 Regras de Reserva

- Um mesmo e-mail não pode reservar o mesmo slot duas vezes.
- Slots completos (4/4) ficam bloqueados visualmente e não aceitam novas reservas.
- A validação ocorre no Server Action (backend), não apenas no frontend.
- A capacidade máxima por slot (padrão: **4**) é configurável pelo admin sem alteração de código.

### 5.4 Impacto no Engajamento

O modelo de múltiplos responsáveis por slot é mais engajador do que o modelo 1:1. O membro vê que outros já se comprometeram com aquele horário e sente o senso de comunidade que é o objetivo central do projeto. A frase de convite pode contextualizar isso:

> *"Este horário já tem 2 intercessores — seja o 3º!"*

---

## 6. Funcionalidades

### 6.1 🌟 Index Público (Sem Login)

**Objetivo:** Principal vetor de convite à participação. Visível a qualquer pessoa.

**Conteúdo:**

- Hero com título em Cinzel e gradiente âmbar.
- Versículo ou frase do dia (configurável pelo admin).
- Painel de estatísticas dinâmico (ver 6.5).
- Frase contextual de encorajamento baseada na cobertura atual.
- Formulário de pedido de oração externo (nome + texto, sem login).
- Botão CTA principal: *"Assumir um Horário de Oração"* → redireciona ao calendário.

### 6.2 🕐 Calendário de Oração

**Objetivo:** Interface central de visualização e reserva dos slots.

**Comportamento:**

- Grade de **24 slots** (00:00 a 23:00).
- Cada slot exibe indicadores visuais de ocupação (○/●) e os **primeiros nomes** dos intercessores já inscritos.
- Slot em andamento no momento atual destacado visualmente.
- Exibição padrão: **dia atual**. Navegação por dia (anterior/próximo).
- Em mobile: lista vertical com agrupamento por período (manhã / tarde / noite / madrugada).
- Slots completos (4/4) acinzentados e não clicáveis.

**Critérios de Aceitação:**

- Grade completa renderiza em menos de **1,5 segundos**.
- Status de ocupação atualizado a cada **5 minutos** ou ao recarregar a página.
- Slots completos são visualmente distintos e não clicáveis.

### 6.3 ✅ Fluxo de Reserva

**Fluxo completo:**

Membro clica no slot disponível
        ↓
Modal leve abre:
  "Você está reservando [HH:00 – HH:59] de [data]"
  [campo: Nome completo] *obrigatório
  [campo: E-mail]*obrigatório
  [checkboxes: Temas de oração pré-definidos] *opcional
  [textarea: Pedido pessoal de oração]*opcional (máx. 200 caracteres)
  [Botão: CONFIRMAR]
        ↓
Server Action valida:

- E-mail não duplicado no mesmo slot
- Slot ainda tem vagas (count < capacidade)
        ↓
Slot atualizado imediatamente no calendário
        ↓
E-mail + ICS disparados em background (Resend)

```

**Critérios de Aceitação:**
-   Formulário valida e-mail inválido antes do envio.
-   Fluxo completo em no máximo **3 cliques** a partir do calendário.
-   Confirmação visual imediata após a reserva (toast de sucesso).

### 6.4 📋 Temas de Oração Pré-Definidos

**Objetivo:** Prover ao membro uma pauta concreta de oração no momento da reserva, sem depender de sua própria disciplina para lembrar pelo que orar.

**Modelo híbrido de dois níveis:**

**Nível 1 — Temas Permanentes (configurados pelo admin):**
Aparecem como checkboxes no modal de reserva. Exemplos:
-   ☐ Missões e evangelismo
-   ☐ Famílias da congregação
-   ☐ Autoridades e governo
-   ☐ Enfermos e enlutados
-   ☐ Avivamento e crescimento espiritual
-   ☐ Unidade da liderança pastoral

**Nível 2 — Pedido Pessoal (campo livre, opcional):**
O membro pode escrever qualquer pedido específico ou deixar em branco.

**Resultado:** Os temas marcados e o pedido pessoal são incluídos no e-mail de confirmação como pauta de oração individual.

**Administração dos temas:**
-   Admin cria, edita, reordena e desativa temas via painel.
-   Tema desativado não aparece no modal, mas preserva histórico de reservas que o selecionaram.

### 6.5 📊 Painel de Estatísticas Públicas

**Objetivo:** Demonstrar visualmente o alcance coletivo da oração e motivar novos participantes.

**Métricas exibidas:**

| Métrica | Descrição 
| **Em oração agora** | Destaque em tempo real do slot ativo no momento |
| **Total de horas este mês** | Soma acumulada de reservas em horas |

**Elementos inspiracionais:**
-   Versículo do dia (rotativo, configurável pelo admin).
-   Frase contextual dinâmica baseada na cobertura atual.
-   Atualização automática a cada **10 minutos**.

**Critérios de Aceitação:**
-   Nenhuma estatística expõe e-mails ou dados sensíveis.
-   Visível sem login na página inicial do hotsite.

### 6.6 📧 Notificação por E-mail + Arquivo ICS

**E-mail de Confirmação** (via Resend — plano gratuito: 3.000 e-mails/mês):

-   Saudação personalizada com o primeiro nome.
-   Data, dia da semana e horário reservado.
-   Lista dos temas de oração selecionados.
-   Pedido pessoal (se preenchido).
-   Versículo do dia.
-   Link para cancelar a reserva.
-   Template editável pelo admin via painel (ver 6.9).

**Arquivo ICS Anexo:**
-   Evento configurado no horário correto com duração de 1 hora.
-   Título: `"Hora de Oração — Igreja Batista Olaria · HH:00"`
-   Alarme: **15 minutos antes**.
-   Compatível com Google Calendar, Apple Calendar e Outlook.
-   Gerado via biblioteca `ical-generator` (npm).

**Critérios de Aceitação:**
-   E-mail entregue em até **2 minutos** após a reserva.
-   Arquivo ICS compatível e testado nos três clientes principais.
-   Lembrete de 15 minutos funcionando nos três clientes.

### 6.7 🔗 Cancelamento de Reserva

-   Link de cancelamento incluído no e-mail de confirmação.
-   O link é único por reserva (token seguro gerado no momento da reserva).
-   Ao clicar, o slot é liberado imediatamente e o indicador de ocupação atualizado.
-   Não requer login.

### 6.8 📿 Pedidos de Oração Externos

**Formulário público no index:**
-   Campos: nome + texto do pedido.
-   Sem login necessário.
-   Pedidos entram em fila de moderação no painel admin.
-   Apenas após aprovação do admin ficam visíveis.

**Visibilidade dos pedidos aprovados:**
-   Nesta versão enxuta: visíveis apenas ao admin no painel.
-   Feed público entre membros adiado para v2.

### 6.9 ⚙️ Painel Administrativo

**Acesso:** Rota `/admin` protegida por senha fixa configurada em variável de ambiente. Sem sistema de login elaborado.

**Seções do painel:**

**1. Calendário**
-   Visualização do dia com nome e e-mail dos intercessores por slot.
-   Cancelamento manual de reservas.
-   Navegação por data.

**2. Temas de Oração**
-   Criar, editar, reordenar e desativar temas.
-   Ativar/desativar temas individualmente.

**3. Pedidos Externos**
-   Fila de pedidos aguardando moderação.
-   Aprovar pedido (1 clique) ou rejeitar pedido (1 clique).

**4. Template de E-mail**
-   Editor de texto com o template completo.
-   Lista de variáveis disponíveis exibida ao lado para referência:

```

{{nome}}              → Primeiro nome do intercessor
{{horario}}           → Horário reservado (ex: 06:00 – 07:00)
{{data}}              → Data da reserva
{{dia_semana}}        → Dia da semana por extenso
{{motivos}}           → Lista dos temas de oração selecionados
{{pedido_personal}}   → Pedido pessoal (ou vazio se não preenchido)
{{versiculo_do_dia}}  → Versículo configurado para o dia
{{link_cancelamento}} → Link único de cancelamento

```

**5. Configurações**
-   Define versículo/frase do dia.
-   Ajusta capacidade máxima por slot (padrão: **4**).
-   Exporta relatório CSV mensal (nome, e-mail, slot, data de reserva).

---

## 7. Fluxo do Usuário

```

[Acessa relogio.ibopvh.com.br]
        ↓
[Index Público]
  ├── Vê estatísticas de cobertura
  ├── Lê versículo do dia
  ├── Lê frase de encorajamento contextual
  └── Clica em "Assumir um Horário"
        ↓
[Calendário de Oração]
  ├── Vê os 24 slots do dia atual
  ├── Identifica horários com vagas disponíveis (○/●)
  └── Clica no slot desejado
        ↓
[Modal de Reserva]
  ├── Preenche Nome e E-mail
  ├── Seleciona temas de oração (opcional)
  ├── Adiciona pedido pessoal (opcional)
  └── Clica em "Confirmar"
        ↓
[Confirmação Visual]
  └── Toast: "Reserva confirmada! Verifique seu e-mail."
        ↓
[E-mail Recebido]
  ├── Confirmação com pauta de oração
  ├── Arquivo ICS para adicionar à agenda
  └── Link de cancelamento (se necessário)
        ↓
[No dia e horário reservado]
  └── Alarme do calendário pessoal lembra o membro

```

---

## 8. Fluxo do Administrador

```

[Acessa relogio.ibopvh.com.br/admin]
        ↓
[Digita senha configurada no servidor]
        ↓
[Painel Admin — Dashboard]
  │
  ├── [Calendário]
  │     ├── Visualiza slots do dia com nomes e e-mails
  │     ├── Navega por datas
  │     └── Cancela reservas manualmente
  │
  ├── [Temas de Oração]
  │     ├── Cria novos temas
  │     ├── Edita temas existentes
  │     ├── Reordena a listagem
  │     └── Desativa temas sem excluir histórico
  │
  ├── [Pedidos Externos]
  │     ├── Visualiza fila de pedidos pendentes
  │     ├── Aprova pedido (1 clique)
  │     └── Rejeita pedido (1 clique)
  │
  ├── [Template de E-mail]
  │     ├── Edita texto livremente
  │     ├── Usa variáveis {{nome}}, {{horario}}, etc.
  │     └── Salva novo template
  │
  └── [Configurações]
        ├── Define versículo/frase do dia
        ├── Ajusta capacidade máxima por slot
        └── Exporta relatório CSV mensal

```

---

## 9. Design System

O hotsite herda a identidade visual do portal `ibopvh.com.br`. Como os projetos são repositórios separados (portal em Vite + React 19; hotsite em Next.js 14), **não há importação direta de arquivo CSS**. O desenvolvedor deve replicar o bloco `@theme` do `index.css` do portal no `globals.css` do hotsite Next.js.

### 9.1 Stack Visual

| Elemento | Tecnologia 
| Fonte de corpo | Lato (`font-sans`) — via `next/font` ou CDN |

### 9.2 Paleta de Cores

| `clay-*` | Barro/terra cota (50–900) | Elementos secundários, ações destrutivas |
| `amber-*` | Âmbar (padrão Tailwind) | Gradientes, CTAs, destaques de dados |

### 9.3 Mapeamento de Componentes

**Slots do Calendário:**

| Status | Classes Tailwind 
| Reservado (próprio usuário) | `bg-amber-600/20 border-amber-500 text-amber-300` |
| Completo (4/4) | `bg-stone-800/80 text-stone-500 cursor-not-allowed` |

**Elementos Globais:**

| Elemento | Classes Tailwind 
| Títulos principais | `font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600` |
| Labels e rótulos | `font-sans text-stone-400` |
| Botões admin (ação destrutiva) | `bg-clay-700 hover:bg-clay-800 text-stone-100` |

**Animações:**

| Animação | Uso 
| `animate-fade-in` | Surgimento do slot em andamento agora |

### 9.4 Regra Tipográfica

```

Cinzel (font-serif)  → Títulos, destaque de horário, nome do intercessor,
                       números de estatística, elementos litúrgicos
Lato (font-sans)     → Textos de instrução, labels, formulários,
                       botões, corpo de mensagens, e-mails

```

---

## 10. Requisitos Não Funcionais

| Requisito | Definição 
| **Desempenho** | Carregamento inicial < 2,5 segundos em 4G |
| **Simplicidade** | Nenhuma feature exige mais de 3 cliques |
| **Segurança** | Admin protegido por senha em variável de ambiente; tokens de cancelamento únicos por reserva |
| **Banco de dados** | SQLite local em dev; Turso (libSQL) em produção |

---

## 11. Modelo de Dados

### Tabelas (SQLite via Turso)

```sql
-- Reservas (tabela central)
CREATE TABLE reservations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  date          TEXT NOT NULL,           -- "2026-07-01"
  time_start    TEXT NOT NULL,           -- "06:00"
  time_end      TEXT NOT NULL,           -- "07:00"
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  prayer_themes TEXT,                    -- JSON array de temas selecionados
  personal_request TEXT,                 -- Pedido pessoal (opcional)
  cancel_token  TEXT UNIQUE NOT NULL,    -- Token único de cancelamento
  reserved_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at  DATETIME                 -- NULL = ativa
);

-- Configurações do sistema (chave-valor)
CREATE TABLE config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Exemplos de registros:
-- ('verse_of_day', 'Colossenses 4.2 — Perseverai em oração...')
-- ('slot_capacity', '4')
-- ('email_template', 'Querido(a) {{nome}}, ...')
-- ('prayer_themes', '[{"id":1,"label":"Missões","active":true}, ...]')
-- ('external_requests', '[{"id":1,"name":"João","request":"Orem por mim","status":"pending"}, ...]')
```

> **Nota:** O modelo intencional é mínimo — **2 tabelas apenas**. A tabela `config` armazena temas, template de e-mail, versículo, capacidade de slot e pedidos externos como registros chave-valor (JSON serializado).

---

## 12. Arquitetura Técnica

### 12.1 Stack Final

| **Banco de Dados** | SQLite via **Turso** (libSQL) | Gratuito, zero configuração de servidor, arquivo local em dev |
| **E-mail** | **Resend** (free: 3.000/mês) | Integração nativa com Next.js; zero configuração de servidor SMTP |
| **Estilo** | Tailwind CSS v4 + tokens replicados do portal IBO | Consistência visual com `ibopvh.com.br`; replicar bloco `@theme` do `index.css` |
| **Hospedagem** | **Vercel** (Hobby — gratuito) | Suporte nativo ao Next.js App Router e Server Actions sem adaptadores adicionais |

### 12.2 Custo de Infraestrutura

| Turso | Free Tier (500MB, 1B leituras/mês) | **Grátis** |
| **Total mensal** | | **R$ 0** |

### 12.3 Configuração DNS

```
DNS (gerenciado no Netlify ou no registrador do domínio):
  ibopvh.com.br              → Netlify  (portal institucional)
  relogio.ibopvh.com.br      → Vercel   (hotsite Relógio de Oração)
```

### 12.4 Diagrama de Fluxo Técnico

```
[Index Público — relogio.ibopvh.com.br]
        ↓
[Calendário de Slots — Next.js Server Component]
        ↓
Clica no slot → [Modal — Client Component]
        ↓
Submete formulário → [Server Action]
        ↓
Prisma valida → Turso (SQLite)
        ↓
┌───────────────────────┤
↓                       ↓
[Atualiza calendário]   [Resend: e-mail + ICS]
```

### 12.5 Ambiente de Desenvolvimento Local

```bash
# Requisitos (sem nada novo além do ambiente Mordomo):
Node.js 18+  |  npm/pnpm  |  Git

# Setup inicial (< 30 minutos):
npx create-next-app@latest relogio-oracao
cd relogio-oracao
npm install prisma @prisma/client @prisma/adapter-libsql
npm install ical-generator resend
npx prisma init --datasource-provider sqlite
npx prisma migrate dev
npm run dev
# ✅ Sistema rodando em localhost:3000
```

**Variáveis de ambiente necessárias (`.env.local`):**

```env
DATABASE_URL="file:./dev.db"
RESEND_API_KEY="re_..."
ADMIN_PASSWORD="senha-segura-aqui"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 13. Plano de Implementação

### Fase 1 — MVP Funcional (Semanas 1–2)

**Entregáveis:**

- Setup do projeto Next.js 14 + Turso + Prisma + Resend.
- Replicação dos tokens do design system IBO no `globals.css`.
- Index público com estatísticas básicas e CTA.
- Calendário visual com 24 slots e indicadores de ocupação.
- Modal de reserva com validação de cota (capacity check).
- Temas de oração pré-definidos como checkboxes.
- E-mail de confirmação com ICS via Resend.
- Cancelamento de slot via link no e-mail (token único).
- Painel admin básico (calendário + temas + template de e-mail).
- Deploy no Vercel com subdomínio `relogio.ibopvh.com.br`.

### Fase 2 — Engajamento e Administração (Semanas 3–4)

**Entregáveis:**

- Painel de estatísticas completo no index público.
- Formulário de pedidos externos + fila de moderação no admin.
- Frases contextuais dinâmicas baseadas na cobertura atual.
- Configurações de capacidade por slot e versículo do dia.
- Exportação CSV mensal de participação.
- Lembrete por e-mail 1 hora antes do slot reservado.

### Fase 3 — Campanhas Especiais (Opcional — Semana 5+)

**Entregáveis:**

- CRUD de campanhas no painel admin (nome, período, versículo específico).
- Banner temático automático durante campanhas ativas.
- Relatório de participação por campanha.

### Cronograma Estimado

| **Lançamento MVP** | — | **Semana 3** |
| **Fase 3 (opcional)** | 1 semana | Semana 5+ |

> **MVP em produção: aproximadamente 3 semanas. Projeto completo: 5 semanas.**

### Estratégia de Lançamento

1. **Dias 1–3:** Deploy silencioso para pastor e dois líderes testarem internamente.
2. **Dias 4–5:** Ajustes com base no feedback interno.
3. **Domingo de Lançamento:** Apresentação breve no culto + link no grupo WhatsApp da igreja.
4. **Semana seguinte:** Post no Instagram/site da IBO convidando à participação.

---

## 14. Decisões de Simplificação

Registro formal das escolhas deliberadas que mantêm este projeto como um experimento leve e viável:

### ✅ Incluído nesta versão

| Decisão | Justificativa
| Até 4 intercessores/slot | Engajamento comunitário com impacto técnico mínimo (+2h dev) |
| 2 tabelas no banco de dados | Mínimo absoluto para o funcionamento do sistema |
| SQLite via Turso | Zero servidor de banco de dados; arquivo local em dev |

### ❌ Adiado para v2 (se experimento provar valor)

| Feature Adiada | Razão do Adiamento
| Feed restrito de pedidos entre membros | Exige controle de sessão sem login |
| Campanhas especiais | Funcionalidade de produto maduro; adiada para Fase 3 |

---

## 15. Impacto do Documento Técnico IBO

Este PRD foi elaborado em conformidade com o **Resumo Técnico: Portal IBO & Guia de Integração**, que define os padrões para novos hotsites no ecossistema da Igreja Batista Olaria.

### Decisões Alinhadas ao Guia Técnico IBO

| Diretriz do Guia | Aplicação no PRD
| *"Hotsites leves: integrar no repositório atual via react-router-dom"* | Não aplicável — Relógio de Oração tem backend dinâmico |
| Estética: glassmorphism, gradientes, micro-animações | Frosted glass nos cards; gradiente âmbar nos títulos; animações Tailwind nativas |

### Justificativa Técnica para Next.js

> O portal principal (`ibopvh.com.br`) usa Vite + React 19 com arquitetura estática hospedada no Netlify — escolha correta para um site institucional de alta performance. O Relógio de Oração exige backend dinâmico (banco de dados, e-mail transacional, geração de ICS no servidor, validação de cotas em tempo real), o que justifica Next.js 14 com Server Actions em repositório e subdomínio separados, conforme recomendado pelo próprio guia técnico da IBO.

---

## 16. Critérios de Aceitação Consolidados

| Funcionalidade | Critério
| **Cota de slots** | 4º intercessor reserva com sucesso; 5ª tentativa bloqueada visual e funcionalmente |
| **ICS** | Compatível com Google Calendar, Apple Calendar e Outlook; alarme de 15 min funcionando |
| **Estatísticas** | Nenhum e-mail exposto; atualização a cada 10 min; visíveis sem login |
| **Temas de oração** | Admin cria/edita/desativa; temas aparecem corretamente no modal e no e-mail |
| **Mobile** | Interface utilizável em telas a partir de 375px; slots clicáveis com toque |

---

## 17. Glossário

| Termo | Definição
| **Cobertura** | Percentual de slots do dia que possuem ao menos um intercessor |
| **Server Action** | Função de backend executada no servidor, nativa do Next.js App Router |
| **Turso** | Serviço de banco de dados SQLite distribuído na nuvem, com plano gratuito |
| **Frosted glass** | Efeito visual de vidro fosco (glassmorphism) usando `backdrop-blur` + fundo semi-transparente |

---

*Documento gerado em Junho/2026.*
*Igreja Batista Olaria — Porto Velho/RO*
*PRD elaborado para uso interno de desenvolvimento.*
*Versão: 3.0 — Final (Versão Enxuta)*

```
