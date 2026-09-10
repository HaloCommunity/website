import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import ShowcaseFilters from '@theme/ShowcaseFilters';
import ShowcaseCard from '@theme/ShowcaseCard';
import type {ShowcaseItem, ShowcasePageData} from '@homotechsual/docusaurus-plugin-showcase';
import styles from './styles.module.css';

type Props = {
  showcase: ShowcasePageData;
};

function sortBy<T>(array: T[], getter: (item: T) => string | number | boolean): T[] {
  const copy = [...array];
  copy.sort((a, b) => {
    const va = getter(a);
    const vb = getter(b);
    if (va > vb) {
      return 1;
    }
    if (vb > va) {
      return -1;
    }
    return 0;
  });
  return copy;
}

export default function ShowcasePage({showcase}: Props): React.JSX.Element {
  const {items, options} = showcase;

  const sortedItems = useMemo(() => {
    let result = sortBy(items, (item) => item.name.toLowerCase());
    if (options.favouriteTag) {
      result = sortBy(result, (item) => !item.tags.includes(options.favouriteTag as string));
    }
    return result;
  }, [items, options.favouriteTag]);

  const [filteredItems, setFilteredItems] = useState<ShowcaseItem[]>(sortedItems);

  useEffect(() => {
    setFilteredItems(sortedItems);
  }, [sortedItems]);

  const title = options.pageTitle ?? translate({id: 'showcase.page.title', message: 'Showcase'});
  const description =
    options.pageDescription ?? translate({id: 'showcase.page.description', message: 'A community showcase.'});
  const isFiltered = filteredItems.length !== sortedItems.length;

  const submitHref = options.submitFormPath
    ? `/${[options.routeBasePath, options.submitFormPath.replace(/^\//, '')].filter(Boolean).join('/')}`
    : options.submitUrl ?? null;
  const submitIsExternal = !options.submitFormPath && !!options.submitUrl;

  const favouriteItems = sortedItems.filter(
    (item) => options.favouriteTag && item.tags.includes(options.favouriteTag),
  );
  const otherItems = sortedItems.filter(
    (item) => !options.favouriteTag || !item.tags.includes(options.favouriteTag),
  );

  return (
    <Layout title={title} description={description}>
      <main className="margin-vert--lg">
        <section className={clsx('margin-top--lg margin-bottom--lg', styles.pageHeader)}>
          <h1>{title}</h1>
          <p>{description}</p>
          {submitHref && (
            <Link
              className={clsx('button button--primary button--lg', styles.submitButton)}
              href={submitHref}
              target={submitIsExternal ? '_blank' : undefined}
              rel={submitIsExternal ? 'noreferrer' : undefined}>
              {options.submitLabel ?? <Translate id="showcase.header.addButton">Add an item</Translate>}
            </Link>
          )}
        </section>

        <ShowcaseFilters items={sortedItems} options={options} onFilter={setFilteredItems} />

        {filteredItems.length === 0 ? (
          <section className={styles.noResults}>
            <h2>
              <Translate id="showcase.noResults">No results</Translate>
            </h2>
          </section>
        ) : isFiltered ? (
          <div className="container">
            <ul className={clsx('clean-list', styles.grid)}>
              {filteredItems.map((item) => (
                <ShowcaseCard key={item.id} item={item} options={options} />
              ))}
            </ul>
          </div>
        ) : (
          <>
            {favouriteItems.length > 0 && (
              <div className={styles.favouriteSection}>
                <div className="container">
                  <div className={styles.favouriteHeader}>
                    <h2>
                      <Translate id="showcase.favourites.title">Our favourites</Translate>
                    </h2>
                  </div>
                  <ul className={clsx('clean-list', styles.grid)}>
                    {favouriteItems.map((item) => (
                      <ShowcaseCard key={item.id} item={item} options={options} />
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="container margin-top--lg">
              <h2>
                <Translate id="showcase.allItems.title">All items</Translate>
              </h2>
              <ul className={clsx('clean-list', styles.grid)}>
                {otherItems.map((item) => (
                  <ShowcaseCard key={item.id} item={item} options={options} />
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </Layout>
  );
}
