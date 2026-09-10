export type ShowcaseItem = {
  id: string;
  name: string;
  description: string;
  details: string;
  website?: string | null;
  source?: string | null;
  author?: string | null;
  preview?: string | null;
  tags: string[];
  status?: string | null;
  offerType: 'commercial' | 'free' | 'open-source';
  license: string;
};

export const ALLOWED_LICENSES = [
  'MIT',
  'Apache-2.0',
  'AGPL-3.0',
  'GPL-3.0',
  'LGPL-3.0',
  'BSD-3-Clause',
  'MPL-2.0',
  'EPL-2.0',
  'Unlicense',
  'Proprietary',
  'Other',
] as const;

const RESERVED_SUBMISSION_TAGS = new Set(['featured']);

export function sanitizeSingleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isValidId(value: string): boolean {
  return /^[a-z0-9]+([.-][a-z0-9]+)+$/.test(value);
}

export function validateItem(item: ShowcaseItem): string | null {
  if (!isValidId(item.id)) {
    return 'ID must be lowercase and dot/hyphen separated (e.g. halocommunity.my-tool).';
  }

  if (!item.name?.trim() || !item.description?.trim() || !item.details?.trim()) {
    return 'Name, description, and details are required.';
  }

  if (!Array.isArray(item.tags) || item.tags.length === 0) {
    return 'At least one tag is required.';
  }

  if (
    item.tags
      .map((tag) => tag.trim().toLowerCase())
      .some((tag) => RESERVED_SUBMISSION_TAGS.has(tag))
  ) {
    return 'The featured tag is reserved for moderators.';
  }

  if (!['commercial', 'free', 'open-source'].includes(item.offerType)) {
    return 'Invalid offer type.';
  }

  if (!item.license?.trim()) {
    return 'License is required.';
  }

  if (!ALLOWED_LICENSES.includes(item.license as (typeof ALLOWED_LICENSES)[number])) {
    return 'Invalid license value.';
  }

  return null;
}

export function yamlBlock(value: string): string {
  const lines = value.replace(/\r\n/g, '\n').split('\n');
  return ['|', ...lines.map((line) => `  ${line}`)].join('\n');
}

export function toYaml(item: ShowcaseItem): string {
  const lines = [
    `id: ${sanitizeSingleLine(item.id)}`,
    `name: ${sanitizeSingleLine(item.name)}`,
    `description: ${sanitizeSingleLine(item.description)}`,
    `details: ${yamlBlock(item.details)}`,
    `website: ${item.website ? item.website : 'null'}`,
    `source: ${item.source ? item.source : 'null'}`,
    `author: ${item.author ? sanitizeSingleLine(item.author) : 'null'}`,
    `preview: ${item.preview ? item.preview : 'null'}`,
    'tags:',
    ...item.tags.map((tag) => `  - ${sanitizeSingleLine(tag)}`),
    `status: ${item.status ? sanitizeSingleLine(item.status) : 'null'}`,
    `offerType: ${item.offerType}`,
    `license: ${sanitizeSingleLine(item.license)}`,
    'npmPackages: []',
    'minimumVersion: null',
  ];

  return `${lines.join('\n')}\n`;
}
