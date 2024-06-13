import React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import styles from './NoSidebarLayout.module.css';

function NoSidebarLayout({ children }) {
  return (
    <Layout>
      <div className={clsx('container', styles.noSidebar)}>
        {children}
      </div>
    </Layout>
  );
}

export default NoSidebarLayout;
