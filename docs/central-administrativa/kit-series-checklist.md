# Checklist obrigatório para novos hotsites de séries

## Antes de desenvolver

- [ ] a série foi cadastrada na Central Administrativa;
- [ ] o slug público foi definido e não depende do título visual;
- [ ] capacidades necessárias foram declaradas;
- [ ] campos específicos foram tipados e documentados;
- [ ] nenhuma tabela, API ou JSON editorial paralelo foi criado;
- [ ] exceções ao contrato possuem decisão arquitetural registrada.

## Implementação

- [ ] importar `useSeries`, o cliente e os tipos de `src/lib/series-kit`;
- [ ] tratar `loading`, `error` e `not-found`;
- [ ] tratar `prelaunch`, `active` e `ended`;
- [ ] usar `availableMessages` para conteúdo liberado;
- [ ] usar `messages` somente quando a programação futura puder aparecer;
- [ ] respeitar `capabilities` antes de renderizar recursos opcionais;
- [ ] sanitizar HTML antes de usar `dangerouslySetInnerHTML`;
- [ ] preservar acessibilidade, navegação por teclado e textos alternativos;
- [ ] não acessar Prisma nem segredos no navegador.

## Homologação

- [ ] série inexistente exibe estado apropriado;
- [ ] falha de rede oferece nova tentativa;
- [ ] pré-estreia não libera mensagens antecipadamente;
- [ ] mensagem agendada aparece somente no momento correto;
- [ ] série encerrada preserva o acervo definido;
- [ ] fallback de thumbnail funciona;
- [ ] vídeo, áudio, texto, materiais e leituras foram testados quando habilitados;
- [ ] visual responsivo foi conferido;
- [ ] testes e build foram aprovados.

