import React from 'react';
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

export default function ShowcaseCard({item, options}: Props): React.JSX.Element {
  const communityItem = item as CommunityShowcaseItem;
  const previewImage = communityItem.preview?.trim() ? communityItem.preview : DEFAULT_PREVIEW_IMAGE;
  const statusLabel =
    communityItem.status && options.statuses[communityItem.status]
      ? options.statuses[communityItem.status].label
      : displayOrFallback(communityItem.status);
  const tagLabels = communityItem.tags.map((tag) => options.tags[tag]?.label ?? tag);

  return (
    <li className={clsx('card shadow--md', styles.card)}>
      <div className="card__body">
        <div className={styles.previewBlock}>
          {communityItem.website ? (
            <Link href={communityItem.website} className={styles.previewLink}>
              <img src={previewImage} alt={`${communityItem.name} preview`} className={styles.previewImage} />
            </Link>
          ) : (
            <img src={previewImage} alt={`${communityItem.name} preview`} className={styles.previewImage} />
          )}
          {!communityItem.website && <span className={styles.previewBadge}>No website link</span>}
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

        <p className={styles.description}>{communityItem.description}</p>

        <div className={styles.metaGrid}>
          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>ID:</span>
            <span>{communityItem.id}</span>
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>Author:</span>
            <span>{displayOrFallback(communityItem.author)}</span>
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>Offer Type:</span>
            <span>{formatOfferType(communityItem.offerType ?? 'free')}</span>
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>License:</span>
            <span>{displayOrFallback(communityItem.license)}</span>
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>Status:</span>
            <span>{statusLabel}</span>
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>Website:</span>
            {communityItem.website ? (
              <Link href={communityItem.website} className={styles.metaLink}>Open link</Link>
            ) : (
              <span>Not provided</span>
            )}
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>Source:</span>
            {communityItem.source ? (
              <Link href={communityItem.source} className={styles.metaLink}>Open link</Link>
            ) : (
              <span>Not provided</span>
            )}
          </p>

          <p className={styles.metaRow}>
            <span className={styles.metaLabel}>Preview:</span>
            {communityItem.preview ? (
              <Link href={communityItem.preview} className={styles.metaLink}>Open link</Link>
            ) : (
              <span>Not provided</span>
            )}
          </p>
        </div>

        {communityItem.details && (
          <div className={styles.detailsBlock}>
            <div className={styles.detailsLabel}>Details</div>
            <div className={styles.detailsMarkdown}>
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
          </div>
        )}
      </div>

      <ul className={styles.tags}>
        {tagLabels.map((tagLabel) => (
          <li key={tagLabel} className={styles.tagChip}>{tagLabel}</li>
        ))}
      </ul>
    </li>
  );
}
