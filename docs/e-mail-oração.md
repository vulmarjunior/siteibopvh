TEMPLATE DE E-MAIL — CONFIRMAÇÃO DE HORÁRIO DE ORAÇÃO

Igreja Batista Olaria
Sistema Relógio de Oração

---

### 1. TEMPLATE DO E-MAIL (versão final para implementação)

Assunto do e-mail: ✝️ Seu horário de oração está confirmado — Igreja Batista Olaria

---

#### Corpo do e-mail:

Querido(a) `{{nome}}`,

*"Não cessamos de orar por vós."* — Colossenses 1.9

Seu compromisso de oração foi registrado. A Igreja Batista Olaria agradece a sua dedidação.

---

📅 SEU HORÁRIO DE ORAÇÃO

---

**Data:** `{{data}}`
**Horário:** `{{horario_inicio}}` às `{{horario_fim}}`
**Dia da semana:** `{{dia_da_semana}}`

Você não estará sozinho(a) neste horário.
Outros `{{numero_intercessores}}` irmão(s) também assumiram este mesmo momento diante de Deus.

---

🙏 SUA PAUTA DE ORAÇÃO

---

Estes são os temas que você escolheu interceder neste horário:

`{{lista_de_temas}}`

---

(para referência do desenvolvedor — não aparece no e-mail final)

---

⏰ LEMBRETE AUTOMÁTICO

---

Você receberá um lembrete **15 minutos antes** do seu horário.
O arquivo de agenda (ICS) está anexo a este e-mail — adicione ao seu Google Calendar, Apple Calendar ou Outlook para não esquecer.

---

📖 PALAVRA DE ENCORAJAMENTO

---

*"A oração eficaz do justo pode muito."* — Tiago 5.16b

Você está prestes a fazer algo de valor eterno.
Quando você se sperar um momento para oração às `{{horario_inicio}}`, saiba que não está só — 
a igreja toda estará representada na sua oração.

Ore com fé. Ore com perseverança. Ore com expectativa.

---

Em Cristo e com gratidão,

Pr. Vulmar Junior
**Igreja Batista Olaria**
Porto Velho — Rondônia
[www.ibopvh.com.br](www.ibopvh.com.br)

---

Precisa cancelar este horário?
→ `{{link_cancelamento}}`

Este é um e-mail automático. Não responda a esta mensagem.

---

### 2. NOTAS DE IMPLEMENTAÇÃO PARA O DESENVOLVEDOR

#### 2.1 Variáveis de substituição obrigatórias:

-   `{{nome}}` — primeiro nome do intercessor
-   `{{data}}` — ex: **"segunda-feira, 3 de agosto de 2026"**
-   `{{horario_inicio}}` — ex: **"06:00"**
-   `{{horario_fim}}` — ex: **"07:00"**
-   `{{dia_da_semana}}` — ex: **"Segunda-feira"**
-   `{{numero_intercessores}}` — número de outros intercessores no mesmo slot (ex: **"2 outros"**)
-   `{{lista_de_temas}}` — renderizada dinamicamente com tema + versículo correspondente
-   `{{pedido_pessoal_bloco}}` — bloco condicional: só renderiza se o campo foi preenchido
-   `{{pedido_pessoal}}` — texto livre digitado pelo membro
-   `{{link_cancelamento}}` — URL única de cancelamento gerada por token


#### 2.4 Arquivo ICS anexo:

-   **Título do evento:** **"Oração — Igreja Batista Olaria · {{horario_inicio}}"**
-   **Duração:** **1 hora**
-   **Alarme:** **15 minutos antes**
-   **Descrição:** primeiros 100 caracteres do e-mail de encorajamento

#### 2.5 Campo editável pelo admin:

O bloco **"PALAVRA DE ENCORAJAMENTO"** deve ser editável pelo administrador via painel `/admin` → **Template de E-mail**. As demais seções são fixas estruturalmente, mas o texto pastoral pode ser ajustado.

---

### 3. EXEMPLO RENDERIZADO (caso de uso real)


Assunto: ✝️ Seu horário de oração está confirmado — Igreja Batista Olaria

Querido(a) João,

"Não cessamos de orar por vós." — Colossenses 1.9

Seu compromisso de oração foi registrado. A Igreja Batista Olaria agradece a sua dedicação.

──────────────────────────────
📅 SEU HORÁRIO DE ORAÇÃO
──────────────────────────────

Data: Segunda-feira, 3 de agosto de 2026
Horário: 06:00 às 07:00
Dia da semana: Segunda-feira

Você não estará sozinho(a) neste horário.
Outros 2 irmãos também assumiram este mesmo momento diante de Deus.

──────────────────────────────
🙏 SUA PAUTA DE ORAÇÃO
──────────────────────────────

✦ Tema 1
   
✦ Tema 2
 
✦ Tema 3
   

──────────────────────────────
⏰ LEMBRETE AUTOMÁTICO
──────────────────────────────

Você receberá um lembrete 15 minutos antes do seu horário.
O arquivo de agenda (ICS) está anexo a este e-mail.

──────────────────────────────
📖 PALAVRA DE ENCORAJAMENTO
──────────────────────────────

"A oração eficaz do justo pode muito." — Tiago 5.16b

Você está prestes a fazer algo de valor eterno.
Quando você se separar esse momento para oração às 06:00, saiba que não está só —
a igreja toda estará representada no seu clamor.

Ore com fé. Ore com perseverança. Ore com expectativa.

──────────────────────────────

Em Cristo e com gratidão,

Pr. Vulmar Junior
Igreja Batista Olaria
Porto Velho — Rondônia
www.ibopvh.com.br

──────────────────────────────
Precisa cancelar este horário?
→ [link de cancelamento]
──────────────────────────────
Este é um e-mail automático. Não responda a esta mensagem.
