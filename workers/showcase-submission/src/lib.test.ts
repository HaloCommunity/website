import {describe, expect, it} from 'vitest';
import {
  isValidId,
  normalizeUrl,
  toYaml,
  validateItem,
  type ShowcaseItem,
} from './lib';

describe('isValidId', () => {
  it('accepts expected dotted ids', () => {
    expect(isValidId('halocommunity.my-tool')).toBe(true);
  });

  it('rejects uppercase and spaces', () => {
    expect(isValidId('HaloCommunity.My Tool')).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('normalizes valid https urls', () => {
    expect(normalizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('rejects unsupported protocols', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('validateItem', () => {
  const validItem: ShowcaseItem = {
    id: 'halocommunity.valid-tool',
    name: 'Valid Tool',
    description: 'This is a valid showcase item description.',
    details: '## Details\nSome markdown details.',
    website: 'https://example.com',
    source: 'https://github.com/example/repo',
    author: 'Halo Community',
    tags: ['utility'],
    status: 'active',
    offerType: 'open-source',
    license: 'MIT',
  };

  it('accepts valid item', () => {
    expect(validateItem(validItem)).toBeNull();
  });

  it('rejects empty tag list', () => {
    expect(validateItem({...validItem, tags: []})).toContain('At least one tag is required');
  });

  it('rejects bad offer type', () => {
    const item = {...validItem, offerType: 'bad' as ShowcaseItem['offerType']};
    expect(validateItem(item)).toContain('Invalid offer type');
  });
});

describe('toYaml', () => {
  it('renders details block scalar and fields', () => {
    const yaml = toYaml({
      id: 'halocommunity.yaml-test',
      name: 'YAML Test',
      description: 'YAML generation test item.',
      details: 'Line 1\nLine 2',
      tags: ['script', 'utility'],
      offerType: 'free',
      license: 'Apache-2.0',
      website: null,
      source: null,
      author: null,
      status: null,
    });

    expect(yaml).toContain('details: |');
    expect(yaml).toContain('  Line 1');
    expect(yaml).toContain('offerType: free');
    expect(yaml).toContain('license: Apache-2.0');
  });
});
