import React from 'react';
import App from '@site/src/components/Generator/App';
import NoSidebarLayout from '@site/src/components/NoSidebarLayout';

const GeneratorPage: React.FC = () => {
  return (
    <NoSidebarLayout>
      <App />
    </NoSidebarLayout>
  );
};

export default GeneratorPage;
