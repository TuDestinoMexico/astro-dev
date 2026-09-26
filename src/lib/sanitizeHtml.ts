import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'ul',
    'ol',
    'li',
    'h3',
    'h4',
    'blockquote',
    'a',
];

const HTML_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
        a: ['href', 'rel'],
    },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {
        a: ['http', 'https'],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
};

export function sanitizeCatalogHtml(value: unknown): string {
    if (typeof value !== 'string') return '';

    return sanitizeHtml(value, HTML_OPTIONS);
}

export function stripCatalogHtml(value: unknown): string {
    const sanitized = sanitizeCatalogHtml(value);
    const textWithSpacing = sanitized
        .replace(/<br\s*\/?>(\s*)/gi, ' ')
        .replace(/<\/(?:p|li|h3|h4|blockquote|ul|ol|a)>/gi, ' ');
    const text = sanitizeHtml(textWithSpacing, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'discard',
    });

    return text.replace(/\s+/g, ' ').trim();
}
