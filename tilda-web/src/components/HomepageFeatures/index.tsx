import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Translate from '@docusaurus/Translate';

type FeatureItem = {
  title: JSX.Element;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate>Easy to Use</Translate>,
    Svg: require('@site/static/img/easy-to-use.svg').default,
    description: (
      <>
       <Translate>Tilda was designed from the ground up to be easily installed and used, allowing you to get started quickly with managing and validating your form data.</Translate>
      </>
    ),
  },
  {
    title: <Translate>Focus on What Matters</Translate>,
    Svg: require('@site/static/img/focus-on-what-matters.svg').default,
    description: (
      <>
        <Translate>Tilda lets you focus on your form data and leave the rest to us. With Tilda, you can seamlessly validate and manage your forms, allowing you to concentrate on what really matters—your content and users.</Translate>
      </>
    ),
  },
  {
    title: <Translate>Comprehensive Form Validation</Translate>,
    Svg: require('@site/static/img/comprehensive-form-validation.svg').default,
    description: (
      <>
        <Translate>Tilda offers robust form validation, ensuring your data is accurate and secure. With support for various validators, Tilda handles everything from simple text fields to complex data types, providing a reliable solution for all your form validation needs.</Translate>
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

export default function HomepageFeatures(): JSX.Element {
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
