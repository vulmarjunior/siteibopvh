import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u',
  's', 'blockquote', 'ul', 'ol', 'li', 'a', 'hr', 'table', 'thead', 'tbody', 'tr',
  'th', 'td', 'sup', 'sub', 'code', 'pre', 'span',
];

export function sanitizeEditorialHtml(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      span: [],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
      }),
    },
    disallowedTagsMode: 'discard',
  }).trim();
  return cleaned || null;
}
