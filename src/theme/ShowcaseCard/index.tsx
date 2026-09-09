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

export default function ShowcaseCard({item}: Props): React.JSX.Element {
  const communityItem = item as CommunityShowcaseItem;

  return (
    <li className={clsx('card shadow--md', styles.card)}>
      <div className="card__body">
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
        </div>

        <p className={styles.description}>{communityItem.description}</p>

        <div className={styles.metaGrid}>
          {communityItem.author && (
            <p className={styles.metaRow}>
              <span className={styles.metaLabel}>Author:</span>
              <span>{communityItem.author}</span>
            </p>
          )}

          {communityItem.offerType && (
            <p className={styles.metaRow}>
              <span className={styles.metaLabel}>Offer:</span>
              <span>{formatOfferType(communityItem.offerType)}</span>
            </p>
          )}

          {communityItem.license && (
            <p className={styles.metaRow}>
              <span className={styles.metaLabel}>License:</span>
              <span>{communityItem.license}</span>
            </p>
          )}

          {communityItem.status && (
            <p className={styles.metaRow}>
              <span className={styles.metaLabel}>Status:</span>
              <span>{communityItem.status}</span>
            </p>
          )}
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
        {communityItem.tags.map((tag) => (
          <li key={tag} className={styles.tagChip}>{tag}</li>
        ))}
      </ul>
    </li>
  );
}
