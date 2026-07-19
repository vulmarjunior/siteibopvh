# Galeria Lúdica da EBF — O Mapa das Memórias

## Visão Geral

A galeria é uma experiência interativa integrada à página `/ebf` que permite reviver os momentos da Escola Bíblica de Férias 2026. Inclui:

- **O Mapa das Memórias**: Experiência lúdica com 5 etapas e caça ao tesouro digital
- **Galeria convencional**: Visualização de todas as fotos com filtros e paginação
- **Lightbox**: Visualizador ampliado com suporte a teclado, gestos e compartilhamento
- **Destaques**: Seção "Tesouros encontrados" com fotos marcadas
- **Encerramento**: Mensagem cristã de agradecimento

## Arquitetura

```
EBFIMG/*.jpeg (originais)
    ↓ scripts/process-ebf-gallery.mjs (sharp)
public/images/ebf-gallery/*.webp (otimizadas)
    ↓
src/data/ebf-gallery.generated.json (manifesto)
    ↓ import estático
src/components/ebf/EbfGallery.tsx (React)
```

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `scripts/process-ebf-gallery.mjs` | Script de processamento de imagens |
| `EBFIMG/gallery.config.json` | Configuração opcional |
| `src/data/ebf-gallery.generated.json` | Manifesto gerado |
| `src/components/ebf/ebf-gallery.types.ts` | Tipos TypeScript |
| `src/lib/ebf-gallery-utils.ts` | Utilitários |
| `src/components/ebf/EbfGallery.tsx` | Orquestrador principal |
| `src/components/ebf/MapaDasMemorias.tsx` | Mapa interativo |
| `src/components/ebf/EbfLightbox.tsx` | Lightbox |
| `src/components/ebf/GalleryGrid.tsx` | Grade convencional |
| `src/components/ebf/Highlights.tsx` | Destaques |
| `src/components/ebf/EbfClosing.tsx` | Encerramento |

## Como Adicionar Novas Fotos

1. Copiar as imagens `.jpeg` para `EBFIMG/`
2. Rodar: `node scripts/process-ebf-gallery.mjs`
3. Verificar a galeria em `http://localhost:3000/ebf`
4. Build: `npm run build`
5. Publicar

## Como Remover uma Foto

1. Remover o arquivo `.jpeg` de `EBFIMG/`
2. Rodar: `node scripts/process-ebf-gallery.mjs`
3. Os arquivos derivados da imagem removida são mantidos (segurança)
4. Para limpar arquivos órfãos: `node scripts/process-ebf-gallery.mjs --force`

## Como Ocultar uma Foto

Adicionar em `EBFIMG/gallery.config.json`:

```json
{
  "photos": {
    "WhatsApp Image 2026-07-18 at 20.49.37.jpeg": {
      "hidden": true
    }
  }
}
```

## Como Marcar Destaque

```json
{
  "photos": {
    "WhatsApp Image 2026-07-18 at 20.49.37.jpeg": {
      "featured": true
    }
  }
}
```

## Como Desabilitar Download

```json
{
  "photos": {
    "WhatsApp Image 2026-07-18 at 20.49.37.jpeg": {
      "downloadEnabled": false
    }
  }
}
```

## Como Adicionar Legenda

```json
{
  "photos": {
    "WhatsApp Image 2026-07-18 at 20.49.37.jpeg": {
      "caption": "Momento especial da nossa aventura"
    }
  }
}
```

## Como Regenerar Tudo

```bash
node scripts/process-ebf-gallery.mjs --force
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `node scripts/process-ebf-gallery.mjs` | Processamento incremental |
| `node scripts/process-ebf-gallery.mjs --force` | Reprocessar tudo |
| `npm run process-gallery` | Atalho para o processamento |

## Privacidade

- Sem reconhecimento facial
- Sem identificação de crianças
- Sem metadados EXIF no navegador
- Sem GPS nas versões públicas
- Download controlável por foto

## Limitações Conhecidas

- Vídeos MP4 são ignorados (apenas imagens JPEG)
- O processador requer Node.js 18+ e sharp
- As imagens derivadas não são commitadas (geradas no build)
- A config de destaques aceita apenas nomes de arquivo, não IDs
