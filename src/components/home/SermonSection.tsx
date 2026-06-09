import React, { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

// Interface para tipagem dos dados do vídeo
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  date: string;
  author: string;
}

const SermonSection: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  /* 
     CONFIG API: Integração YouTube
     - CHANNEL_ID: ID público do canal
  */
  const CHANNEL_ID = 'UCKVIlkzStEpyodr8J-boq6Q';

  // Dados de Fallback (Caso a API falhe ou atinja limite)
  const FALLBACK_VIDEOS: Video[] = [
    {
      id: 'fallback-1',
      title: 'Culto Solene - A Soberania de Deus',
      thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop',
      link: 'https://www.youtube.com/@ibopvh',
      date: 'Domingo Recente',
      author: 'IB Olaria'
    },
    {
      id: 'fallback-2',
      title: 'Estudo Bíblico - O Evangelho de João',
      thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop',
      link: 'https://www.youtube.com/@ibopvh',
      date: 'Domingo Passado',
      author: 'IB Olaria'
    },
    {
      id: 'fallback-3',
      title: 'Escola Bíblica Dominical',
      thumbnail: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=1000&auto=format&fit=crop',
      link: 'https://www.youtube.com/@ibopvh',
      date: 'Semana Passada',
      author: 'IB Olaria'
    }
  ];

  useEffect(() => {
    // Função auxiliar para parsear XML do YouTube de forma robusta
    const parseYouTubeXML = (xmlString: string) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        // Verifica se houve erro no parse
        const parserError = xmlDoc.getElementsByTagName("parsererror");
        if (parserError.length > 0) {
          console.error("Erro no parser de XML:", parserError[0].textContent);
          return [];
        }

        const entries = Array.from(xmlDoc.querySelectorAll("entry"));
        
        return entries.map(entry => {
          const getTagContent = (selector: string) => {
            const el = entry.querySelector(selector);
            return el ? el.textContent : null;
          };

          // Tenta pegar o ID do vídeo de várias formas (com e sem namespace)
          const videoId = getTagContent("videoId") || 
                          getTagContent("yt\\:videoId") || 
                          entry.getElementsByTagName("yt:videoId")[0]?.textContent ||
                          entry.getElementsByTagName("id")[0]?.textContent?.split(':').pop();
          
          const title = getTagContent("title");
          const linkEl = entry.querySelector("link[rel='alternate']") || entry.querySelector("link");
          const link = linkEl ? linkEl.getAttribute("href") : null;
          const published = getTagContent("published");
          
          return {
            id: videoId,
            title: title,
            link: link,
            pubDate: published,
            guid: videoId ? `yt:video:${videoId}` : null
          };
        }).filter(v => v.id && v.title); // Remove entradas inválidas
      } catch (e) {
        console.error("Erro ao parsear XML:", e);
        return [];
      }
    };

    const fetchVideos = async () => {
      const services = [
        // 0. Local API Proxy (Most reliable as it's our own server)
        `/api/youtube-proxy?channelId=${CHANNEL_ID}`,
        // 1. rss2json (Serviço dedicado)
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}&api_key=`,
        // 2. allorigins (Proxy JSON)
        `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}&callback=?`,
        // 3. codetabs (Proxy CORS)
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`,
        // 4. corsproxy.io (Proxy CORS)
        `https://corsproxy.io/?${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`,
        // 5. feed2json (Conversor)
        `https://feed2json.org/convert?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`
      ];

      for (const service of services) {
        try {
          const res = await fetch(service);
          if (!res.ok) continue;

          let items = [];
          const contentType = res.headers.get('content-type') || '';

          if (contentType.includes('application/json') || service.includes('allorigins')) {
            const text = await res.text();
            // allorigins pode retornar um JSON com callback se usarmos &callback=?
            let data;
            if (text.startsWith('?(')) {
              data = JSON.parse(text.substring(2, text.length - 1));
            } else {
              data = JSON.parse(text);
            }

            if (data.items) {
              items = data.items;
            } else if (data.contents) {
              items = parseYouTubeXML(data.contents);
            }
          } else {
            const text = await res.text();
            if (text.includes('<feed') || text.includes('<entry')) {
              items = parseYouTubeXML(text);
            }
          }

          if (items && items.length > 0) {
            const formattedVideos = items.slice(0, 3).map((item: any) => {
              let videoId = '';
              if (item.guid && item.guid.includes('yt:video:')) {
                videoId = item.guid.split('yt:video:')[1];
              } else if (item.id && item.id.includes('yt:video:')) {
                videoId = item.id.split('yt:video:')[1];
              } else if (item.link && item.link.includes('v=')) {
                videoId = item.link.split('v=')[1].split('&')[0];
              } else if (item.url && item.url.includes('v=')) {
                videoId = item.url.split('v=')[1].split('&')[0];
              } else {
                videoId = item.id || '';
              }

              return {
                id: videoId,
                title: item.title,
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                link: item.link || item.url || `https://www.youtube.com/watch?v=${videoId}`,
                date: new Date(item.pubDate || item.date_published || item.published || Date.now()).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
                author: 'IB Olaria'
              };
            });

            setVideos(formattedVideos);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn(`Falha ao buscar em ${service}:`, error);
        }
      }

      console.error("Todas as APIs de RSS falharam. Usando fallback.");
      setVideos(FALLBACK_VIDEOS);
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  // Estado de carregamento
  if (loading) {
    return (
      <section className="py-24 bg-stone-850 text-white flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-olaria w-8 h-8" />
          <span className="text-stone-400 text-sm uppercase tracking-widest">Carregando sermões...</span>
        </div>
      </section>
    );
  }

  // Separação dos vídeos para o layout (1 destaque + 2 lista)
  const mainVideo = videos[0];
  const secondaryVideos = videos.slice(1, 3);

  return (
    <section id="sermoes" className="py-24 bg-stone-850 text-white">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">Pregação da Palavra</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Últimos Sermões</h2>
          </div>
          {/* LINK EXTERNO: Obrigatório target="_blank" e rel="noopener noreferrer" para segurança */}
          <a
            href="https://www.youtube.com/@ibopvh/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-white transition-colors border-b border-stone-600 pb-1 text-sm uppercase tracking-wide"
          >
            Ver canal completo
          </a>
        </div>

        {/* Grid de Vídeos */}
        <div className="grid md:grid-cols-3 gap-6 h-auto md:h-[500px]">

          {/* Vídeo Principal (Destaque) */}
          {mainVideo && (
            <div
              onClick={() => handleVideoClick(mainVideo.link)}
              className="md:col-span-2 relative group cursor-pointer overflow-hidden rounded-xl bg-stone-800 h-[300px] md:h-full shadow-xl"
            >
              <img
                src={mainVideo.thumbnail}
                alt={mainVideo.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                onError={(e) => {
                  // Fallback para imagem padrão caso a HD não exista
                  (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${mainVideo.id}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent">
                <div className="bg-olaria text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                  Mais Recente
                </div>
                <h3 className="text-2xl md:text-4xl font-serif font-bold mb-2 group-hover:text-olaria transition-colors line-clamp-2 leading-tight">
                  {mainVideo.title}
                </h3>
                <p className="text-stone-300 font-medium">{mainVideo.date}</p>
              </div>

              {/* Ícone de Play com efeito hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                <div className="w-20 h-20 bg-olaria rounded-full flex items-center justify-center pl-1 shadow-2xl ring-4 ring-white/10">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
              </div>
            </div>
          )}

          {/* Lista Lateral (2 vídeos secundários) */}
          <div className="flex flex-col gap-6 h-full">
            {secondaryVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video.link)}
                className="relative group cursor-pointer overflow-hidden rounded-xl bg-stone-800 flex-1 min-h-[200px] shadow-lg"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent">
                  <h3 className="text-xl font-serif font-bold mb-1 group-hover:text-olaria transition-colors line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-sm text-stone-300">{video.date}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center pl-1 ring-2 ring-white/10">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SermonSection;