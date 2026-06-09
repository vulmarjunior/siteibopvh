# Resumo Técnico: Portal IBO & Guia de Integração

Este documento serve como base técnica para orientar a criação de novos PRDs (Documentos de Requisitos) para hotsites que serão integrados ao ecossistema da Igreja Batista Olaria.

## 1. Stack Tecnológica Atual (Portal Principal)

O portal foi construído com foco em alta performance e design premium, utilizando as tecnologias mais modernas de 2025:

* **Framework**: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/).
* **Linguagem**: TypeScript (Garante que o código não tenha erros de tipo).
* **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS moderno, focado em performance e customização profunda).
* **Ícones**: [Lucide React](https://lucide.dev/).
* **Hospedagem**: [Netlify](https://www.netlify.com/) (Site estático, carregamento instantâneo).

## 2. Identidade Visual (Design System)

Para que um novo hotsite pareça parte da "família" IBO, ele deve seguir os padrões já estabelecidos:

* **Cores**: Tons de `Stone` (pedra/escuro) e `Olaria/Amber` (dourado/terra) para um visual solene e premium.
* **Tipografia**:
  * `Cinzel`: Para títulos e cabeçalhos (estilo heráldico/clássico).
  * `Lato`: Para textos de leitura e corpo.
* **Estética**: Uso de gradientes sutis, glassmorphism (transparências) e micro-animações.

## 3. Guia para Novos PRDs (Hotsites)

Ao planejar um novo hotsite (ex: Evento de Jovens, Conferência, Campanha), o PRD deve especificar:

### A. Escopo de Navegação

* O hotsite será uma **página única (Landing Page)** dentro do portal ou uma **sub-rota** (ex: `ibopvh.com.br/conferencia`)?
* Haverá integração com o menu principal ou será independente?

### B. Nível de Interatividade

* **Estático**: Apenas textos, fotos e vídeos (Melhor para Vite/React atual).
* **Dinâmico**: Precisa de formulários complexos, login ou banco de dados?
    > **Nota Técnica**: Se precisar de banco de dados (como o Relógio de Oração), o ideal é usar um framework como **Next.js** em um subdomínio separado (ex: `hotsite.ibopvh.com.br`) para não sobrecarregar o portal institucional.

### C. Elementos Obrigatórios

* Seção de Hero (Impacto inicial).
* Informações de data/local (com Google Maps).
* Botão de Ação (CTA) - Ex: Inscrição, WhatsApp ou Doação.
* Rodapé com links sociais e endereço oficial.

## 4. Recomendações de Hospedagem

* **Hotsites Leves**: Integrar diretamente no repositório atual via `react-router-dom`.
* **Hotsites Complexos**: Repositório separado no GitHub, hospedado no subdomínio da igreja.
