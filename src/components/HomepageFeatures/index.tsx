import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Community Driven',
    Svg: require('@site/static/img/undraw_halopsa_community.svg').default,
    description: (
      <>
        We foster a community of HaloPSA, HaloITSM and HaloCRM users, developers, implementers, staff, and partners. We are community who are deeply passionate about HaloPSA, HaloITSM and HaloCRM.
      </>
    ),
  },
  {
    title: 'Integrations',
    Svg: require('@site/static/img/undraw_halopsa_integrate.svg').default,
    description: (
      <>
        We collaboratively develop integrations with HaloPSA, HaloITSM and HaloCRM as a community as well as showcasing excellent partner-developed integrations of a commercial nature.
      </>
    ),
  },
  {
    title: 'Knowledge Sharing',
    Svg: require('@site/static/img/undraw_halopsa_knowledge_sharing.svg').default,
    description: (
      <>
        We encourage the sharing of all knowledge and experience with HaloPSA, HaloITSM and HaloCRM. Whether you are a user, developer, implementer, staff or partner, the knowledge you have is valuable to the community.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
