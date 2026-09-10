import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import type {
  ShowcaseItem,
  PluginOptions,
} from '@homotechsual/docusaurus-plugin-showcase';
import styles from './styles.module.css';

type Props = {
  item: ShowcaseItem;
  options: PluginOptions;
};

type OfferType = 'commercial' | 'free' | 'open-source';

type CommunityShowcaseItem = ShowcaseItem & {
  offerType?: OfferType;
  license?: string;
  details?: string;
};

const DEFAULT_PREVIEW_IMAGE = '/img/undraw_halopsa_integrate.svg';

const markdownSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...((defaultSchema.attributes?.a ?? []) as string[]),
      'target',
      'rel',
      'title',
    ],
  },
};

function formatOfferType(value: OfferType): string {
  switch (value) {
    case 'open-source':
      return 'Open Source';
    case 'commercial':
      return 'Commercial';
    default:
      return 'Free';
  }
}

function displayOrFallback(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : 'Not provided';
}

function normalizePreview(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'n/a') {
    return null;
  }

  if (
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('./') &&
    !trimmed.startsWith('../') &&
    !/^https?:\/\//i.test(trimmed)
  ) {
    return null;
  }

  return trimmed;
}

function resolveScreenshotUrl(template: string, website: string): string {
  return template
    .replace('{url}', encodeURIComponent(website))
    .replace('{rawUrl}', website);
}

export default function ShowcaseCard({item, options}: Props): React.JSX.Element {
  const communityItem = item as CommunityShowcaseItem;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const normalizedPreview = normalizePreview(communityItem.preview);
  const hasWebsite = Boolean(communityItem.website && communityItem.website.trim().length > 0);
  const generatedPreview =
    !normalizedPreview && hasWebsite && options.screenshotUrl
      ? resolveScreenshotUrl(options.screenshotUrl, communityItem.website)
      : null;
  const previewImage = normalizedPreview ?? generatedPreview ?? (!hasWebsite ? DEFAULT_PREVIEW_IMAGE : null);
  const statusLabel =
    communityItem.status && options.statuses[communityItem.status]
      ? options.statuses[communityItem.status].label
      : displayOrFallback(communityItem.status);
  const tagLabels = communityItem.tags.map((tag) => options.tags[tag]?.label ?? tag);

  return (
    <>
      <li className={clsx('card shadow--md', styles.card)}>
        <div className="card__body">
          <div className={styles.previewBlock}>
            {hasWebsite && communityItem.website && previewImage ? (
              <Link href={communityItem.website} className={styles.previewLink}>
                <img
                  src={previewImage}
                  alt={`${communityItem.name} preview`}
                  className={styles.previewImage}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_PREVIEW_IMAGE;
                  }}
                />
              </Link>
            ) : previewImage ? (
              <img
                src={previewImage}
                alt={`${communityItem.name} preview`}
                className={styles.previewImage}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_PREVIEW_IMAGE;
                }}
              />
            ) : null}
            {!hasWebsite && <span className={styles.previewBadge}>No website link</span>}
          </div>

          <div className={styles.headerRow}>
            <h4 className={styles.title}>
              {communityItem.website ? (
                <Link href={communityItem.website} className={styles.titleLink}>
                  {communityItem.name}
                </Link>
              ) : (
                <span>{communityItem.name}</span>
              )}
            </h4>

            {communityItem.source && (
              <Link href={communityItem.source} className="button button--secondary button--sm">
                Source
              </Link>
            )}

            {communityItem.website && (
              <Link href={communityItem.website} className="button button--info button--sm">
                Website
              </Link>
            )}
          </div>

          <button
            type="button"
            className={clsx('button button--sm button--primary', styles.detailsButton)}
            onClick={() => setShowDetailsModal(true)}>
            View full plugin info
          </button>

          <dl className={styles.metaGrid}>
            <div className={styles.metaCell}>
              <dt className={styles.metaLabel}>Author</dt>
              <dd className={styles.metaValue}>{displayOrFallback(communityItem.author)}</dd>
            </div>

            <div className={styles.metaCell}>
              <dt className={styles.metaLabel}>Offer Type</dt>
              <dd className={styles.metaValue}>{formatOfferType(communityItem.offerType ?? 'free')}</dd>
            </div>

            <div className={styles.metaCell}>
              <dt className={styles.metaLabel}>License</dt>
              <dd className={styles.metaValue}>{displayOrFallback(communityItem.license)}</dd>
            </div>

            <div className={styles.metaCell}>
              <dt className={styles.metaLabel}>Status</dt>
              <dd className={styles.metaValue}>{statusLabel}</dd>
            </div>
          </dl>
        </div>

        <ul className={styles.tags}>
          {tagLabels.map((tagLabel) => (
            <li key={tagLabel} className={styles.tagChip}>{tagLabel}</li>
          ))}
        </ul>
      </li>

      {showDetailsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)} role="presentation">
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-label={`${communityItem.name} full details`}
            onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{communityItem.name}</h3>
              <button
                type="button"
                className={clsx('button button--secondary button--sm', styles.modalClose)}
                onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>

            <div className={styles.modalMeta}>
              <span><strong>ID:</strong> {communityItem.id}</span>
              <span><strong>Offer Type:</strong> {formatOfferType(communityItem.offerType ?? 'free')}</span>
              <span><strong>License:</strong> {displayOrFallback(communityItem.license)}</span>
              <span><strong>Status:</strong> {statusLabel}</span>
            </div>

            <p className={styles.modalDescription}>{communityItem.description}</p>

            {communityItem.details && (
              <div className={styles.modalDetails}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[[rehypeSanitize, markdownSchema]]}
                  components={{
                    a: ({node: _node, ...props}) => (
                      <a {...props} target="_blank" rel="noreferrer" />
                    ),
                  }}>
                  {communityItem.details}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
