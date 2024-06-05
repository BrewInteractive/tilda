import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import Translate from '@docusaurus/Translate';

function HomepageHeader({ subtitle, buttonLabel }) {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{subtitle}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction">
            {buttonLabel}⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="">
      <HomepageHeader 
        subtitle={<Translate> Tilda is a rest api designed to validate form data with a custom manifest by Brew Interactive. </Translate>} 
        buttonLabel={<Translate> Tutorial </Translate>}
      />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
