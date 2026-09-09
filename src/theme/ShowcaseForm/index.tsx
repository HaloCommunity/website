import React, {useEffect, useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import clsx from 'clsx';
import ShowcaseCard from '@theme/ShowcaseCard';
import styles from './styles.module.css';
import type {
  ShowcaseItem,
  ShowcasePageData,
  PluginOptions,
} from '@homotechsual/docusaurus-plugin-showcase';

type Props = {
  showcase: ShowcasePageData;
};

type OfferType = 'commercial' | 'free' | 'open-source';

type FormState = {
  name: string;
  description: string;
  details: string;
  website: string;
  source: string;
  author: string;
  preview: string;
  status: string;
  offerType: OfferType;
  license: string;
  tags: string[];
};

type CommunityShowcaseItem = ShowcaseItem & {
  offerType?: OfferType;
  license?: string;
  details?: string;
};

type CommunityShowcasePluginOptions = PluginOptions & {
  submissionApiUrl?: string;
  turnstileSiteKey?: string;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  details: '',
  website: '',
  source: '',
  author: '',
  preview: '',
  status: '',
  offerType: 'free',
  license: 'MIT',
  tags: [],
};

const REQUIRED_FIELDS: (keyof FormState)[] = [
  'author',
  'name',
  'description',
  'details',
  'offerType',
  'license',
];

const LICENSE_OPTIONS = [
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

type TurnstileWidgetId = string | number;

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'auto' | 'light' | 'dark';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ) => TurnstileWidgetId;
  reset: (widgetId?: TurnstileWidgetId) => void;
  remove?: (widgetId: TurnstileWidgetId) => void;
};

type TurnstileWindow = Window & {
  turnstile?: TurnstileApi;
};

function fieldHasValue(field: keyof FormState, value: FormState): boolean {
  if (field === 'offerType' || field === 'license') {
    return true;
  }

  return String(value[field]).trim().length > 0;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildGeneratedId(author: string, name: string): string {
  const authorSlug = slugify(author);
  const nameSlug = slugify(name);

  if (!authorSlug || !nameSlug) {
    return '';
  }

  return `${authorSlug}.${nameSlug}`;
}

function toYamlPayload(form: FormState, generatedId: string): Partial<CommunityShowcaseItem> {
  return {
    id: generatedId || undefined,
    name: form.name || undefined,
    description: form.description || undefined,
    details: form.details || undefined,
    website: form.website || null,
    source: form.source || null,
    author: form.author || null,
    preview: form.preview || null,
    status: form.status || null,
    tags: form.tags,
    offerType: form.offerType,
    license: form.license,
  };
}

function toYamlString(item: Partial<CommunityShowcaseItem>): string {
  const details = item.details ?? '';
  const detailLines = details.replace(/\r\n/g, '\n').split('\n');
  const website = item.website ? item.website : 'null';
  const source = item.source ? item.source : 'null';
  const author = item.author ? item.author : 'null';
  const preview = item.preview ? item.preview : 'null';
  const status = item.status ? item.status : 'null';
  const tags = item.tags ?? [];

  const lines = [
    `id: ${item.id ?? ''}`,
    `name: ${item.name ?? ''}`,
    `description: ${item.description ?? ''}`,
    'details: |',
    ...detailLines.map((line) => `  ${line}`),
    `website: ${website}`,
    `source: ${source}`,
    `author: ${author}`,
    `preview: ${preview}`,
    'tags:',
    ...tags.map((tag) => `  - ${tag}`),
    `status: ${status}`,
    `offerType: ${item.offerType ?? 'free'}`,
    `license: ${item.license ?? 'MIT'}`,
    'npmPackages: []',
    'minimumVersion: null',
  ];

  return `${lines.join('\n')}\n`;
}

function buildPreviewItem(form: FormState, generatedId: string): CommunityShowcaseItem {
  return {
    id: generatedId || 'preview',
    name: form.name || 'Example integration',
    description: form.description || 'A short summary of the integration, script, or tool.',
    details:
      form.details ||
      '## Summary\nA richer markdown description appears here with links, bullet points and usage notes.',
    website: form.website || '#',
    source: form.source || null,
    author: form.author || null,
    preview: form.preview || null,
    status: form.status || null,
    tags: form.tags,
    offerType: form.offerType,
    license: form.license,
  };
}

export default function ShowcaseForm({showcase}: Props): React.JSX.Element {
  const options = showcase.options as CommunityShowcasePluginOptions;
  const submissionUrl = options.submissionApiUrl ?? null;
  const turnstileSiteKey = options.turnstileSiteKey ?? null;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileLoadError, setTurnstileLoadError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [copied, setCopied] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<TurnstileWidgetId | null>(null);

  const generatedId = useMemo(() => buildGeneratedId(form.author, form.name), [form.author, form.name]);
  const previewItem = useMemo(() => buildPreviewItem(form, generatedId), [form, generatedId]);
  const yaml = useMemo(() => toYamlString(toYamlPayload(form, generatedId)), [form, generatedId]);
  const valid = generatedId.length > 0 && REQUIRED_FIELDS.every((field) => fieldHasValue(field, form));

  useEffect(() => {
    if (!turnstileSiteKey) {
      return;
    }

    let cancelled = false;
    let tries = 0;
    const maxTries = 40;

    const renderWidget = (): boolean => {
      const container = turnstileContainerRef.current;
      const api = (window as TurnstileWindow).turnstile;

      if (!container || !api || turnstileWidgetIdRef.current !== null) {
        return Boolean(container && api);
      }

      container.innerHTML = '';
      turnstileWidgetIdRef.current = api.render(container, {
        sitekey: turnstileSiteKey,
        theme: 'auto',
        callback: (token) => {
          setTurnstileToken(token);
          setTurnstileError(null);
          setTurnstileLoadError(null);
        },
        'expired-callback': () => {
          setTurnstileToken('');
        },
        'error-callback': () => {
          setTurnstileToken('');
          setTurnstileLoadError('Security check could not load. Refresh the page and try again.');
        },
      });

      return true;
    };

    if (renderWidget()) {
      return () => {
        cancelled = true;
        const api = (window as TurnstileWindow).turnstile;
        if (api && turnstileWidgetIdRef.current !== null) {
          api.remove?.(turnstileWidgetIdRef.current);
          turnstileWidgetIdRef.current = null;
        }
      };
    }

    const interval = window.setInterval(() => {
      if (cancelled) {
        window.clearInterval(interval);
        return;
      }

      tries += 1;
      if (renderWidget()) {
        window.clearInterval(interval);
        return;
      }

      if (tries >= maxTries) {
        window.clearInterval(interval);
        setTurnstileLoadError('Security check could not load. Refresh the page and try again.');
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      const api = (window as TurnstileWindow).turnstile;
      if (api && turnstileWidgetIdRef.current !== null) {
        api.remove?.(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [field]: value}));
  }

  function toggleTag(tag: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      tags: checked ? [...prev.tags, tag] : prev.tags.filter((value) => value !== tag),
    }));
  }

  function fieldError(field: keyof FormState): boolean {
    return attempted && !fieldHasValue(field, form);
  }

  async function handleCopyYaml() {
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmitToApi() {
    if (!valid) {
      setAttempted(true);
      return;
    }

    if (!submissionUrl) {
      setApiError('Submission API URL is not configured.');
      return;
    }

    setSubmitting(true);
    setApiError(null);
    setApiMessage(null);
    setTurnstileError(null);
    setTurnstileLoadError(null);

    try {
      if (turnstileSiteKey && turnstileToken.length === 0) {
        setTurnstileError('Please complete the security check before submitting.');
        setSubmitting(false);
        return;
      }

      const response = await fetch(submissionUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          item: toYamlPayload(form, generatedId),
          turnstileToken,
          routeBasePath: options.routeBasePath,
          dataDir: options.dataDir,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        issueUrl?: string;
        pullRequestUrl?: string;
      };

      if (!response.ok) {
        setApiError(payload.message ?? 'Submission failed. Please try again later.');
        return;
      }

      const links = [payload.pullRequestUrl, payload.issueUrl].filter(Boolean).join(' | ');
      setApiMessage(payload.message ? `${payload.message}${links ? ` ${links}` : ''}` : 'Submission created.');
      setForm(emptyForm);
      setTurnstileToken('');
      setAttempted(false);

      const turnstile = (window as TurnstileWindow).turnstile;
      if (turnstileWidgetIdRef.current !== null) {
        turnstile?.reset(turnstileWidgetIdRef.current);
      } else {
        turnstile?.reset();
      }
    } catch {
      setApiError('Unable to reach the submission service. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title={translate({id: 'showcase.form.title', message: 'Submit an item'})}>
      <main className="container margin-vert--lg">
        <div className={styles.pageHeader}>
          <h1><Translate id="showcase.form.title">Submit an item</Translate></h1>
          <p>
            Use this form to submit an integration, script, or tool. Website and source links are optional.
          </p>
        </div>

        <div className={styles.layout}>
          <section className={styles.formPanel}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-id">ID <span className={styles.required}>*</span></label>
              <input
                id="sf-id"
                className={clsx(styles.input, attempted && generatedId.length === 0 && styles.inputError)}
                type="text"
                value={generatedId}
                readOnly
                placeholder="author.tool-name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-author">Author <span className={styles.required}>*</span></label>
              <input
                id="sf-author"
                className={clsx(styles.input, fieldError('author') && styles.inputError)}
                type="text"
                value={form.author}
                onChange={(e) => setField('author', e.target.value)}
                placeholder="Your name or org"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-name">Name <span className={styles.required}>*</span></label>
              <input
                id="sf-name"
                className={clsx(styles.input, fieldError('name') && styles.inputError)}
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="My Halo Integration"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-description">Description <span className={styles.required}>*</span></label>
              <input
                id="sf-description"
                className={clsx(styles.input, fieldError('description') && styles.inputError)}
                type="text"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="One-line summary for card view"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-details">Details (Markdown) <span className={styles.required}>*</span></label>
              <textarea
                id="sf-details"
                className={clsx(styles.textarea, fieldError('details') && styles.inputError)}
                rows={8}
                value={form.details}
                onChange={(e) => setField('details', e.target.value)}
                placeholder={'## What it does\nDescribe setup, scope, and caveats using markdown.'}
              />
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-offer">Offer Type <span className={styles.required}>*</span></label>
                <select
                  id="sf-offer"
                  className={styles.select}
                  value={form.offerType}
                  onChange={(e) => setField('offerType', e.target.value as OfferType)}>
                  <option value="commercial">Commercial</option>
                  <option value="free">Free</option>
                  <option value="open-source">Open Source</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-license">License <span className={styles.required}>*</span></label>
                <select
                  id="sf-license"
                  className={styles.select}
                  value={form.license}
                  onChange={(e) => setField('license', e.target.value)}>
                  {LICENSE_OPTIONS.map((license) => (
                    <option key={license} value={license}>{license}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-website">Website (optional)</label>
                <input
                  id="sf-website"
                  className={styles.input}
                  type="url"
                  value={form.website}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sf-source">Source (optional)</label>
                <input
                  id="sf-source"
                  className={styles.input}
                  type="url"
                  value={form.source}
                  onChange={(e) => setField('source', e.target.value)}
                  placeholder="https://github.com/org/repo"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sf-status">Status</label>
              <select
                id="sf-status"
                className={styles.select}
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}>
                <option value="">(none)</option>
                {Object.entries(options.statuses).map(([key, status]) => (
                  <option key={key} value={key}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tags</label>
              <div className={styles.checkboxGroup}>
                {Object.entries(options.tags).map(([key, tag]) => (
                  <label className={styles.checkboxLabel} key={key}>
                    <input
                      type="checkbox"
                      checked={form.tags.includes(key)}
                      onChange={(e) => toggleTag(key, e.target.checked)}
                    />
                    <span className={styles.tagDot} style={{backgroundColor: tag.color}} />
                    {tag.label}
                  </label>
                ))}
              </div>
            </div>

            {attempted && !valid && (
              <p className={styles.errorMsg}>Please complete all required fields before submitting.</p>
            )}

            <div className={styles.actionRow}>
              <button type="button" className="button button--secondary" onClick={handleCopyYaml}>
                {copied ? 'YAML Copied' : 'Copy YAML'}
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={handleSubmitToApi}
                disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            {turnstileSiteKey && (
              <div className={styles.turnstileWrap}>
                <div ref={turnstileContainerRef} />
                {turnstileLoadError && <p className={styles.errorMsg}>{turnstileLoadError}</p>}
              </div>
            )}

            {apiMessage && <p className={styles.successMsg}>{apiMessage}</p>}
            {apiError && <p className={styles.errorMsg}>{apiError}</p>}
            {turnstileError && <p className={styles.errorMsg}>{turnstileError}</p>}
          </section>

          <section className={styles.previewPanel}>
            <h2 className={styles.panelHeading}>Preview</h2>
            <ul className={styles.previewList}>
              <ShowcaseCard item={previewItem} options={options} />
            </ul>

            <h2 className={styles.panelHeading}>YAML</h2>
            <pre className={styles.yaml}>{yaml}</pre>
          </section>
        </div>
      </main>
    </Layout>
  );
}
