import { useSeries } from '../../lib/series-kit';

/** Exemplo deliberadamente neutro: copie a composição, não o visual. */
export function MinimalSeriesPage({ slug }: { slug: string }) {
  const result = useSeries(slug);
  if (result.status === 'loading') return <main aria-busy="true">Carregando série…</main>;
  if (result.status === 'error') return <main><p>Não foi possível carregar a série.</p><button onClick={result.reload}>Tentar novamente</button></main>;
  if (result.status === 'not-found') return <main>Série não encontrada.</main>;
  const { series, lifecycle } = result;
  if (lifecycle === 'prelaunch') return <main><h1>{series.title}</h1><p>Esta série estreia em breve.</p></main>;
  return <main><header><h1>{series.title}</h1>{series.description && <p>{series.description}</p>}</header>{lifecycle === 'ended' && <p>Esta série foi encerrada. As mensagens continuam disponíveis.</p>}<section aria-label="Mensagens">{series.availableMessages.map((message) => <article key={message.id}><h2>{message.title}</h2><p>{message.biblicalText}</p>{message.summary && <p>{message.summary}</p>}</article>)}</section></main>;
}

