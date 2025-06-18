import React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import '@atlaskit/css-reset';

const StrictMode = React.StrictMode as React.ComponentType<React.PropsWithChildren<{}>>;

// Legacy ReactDOM.render for React 16
interface LegacyReactDOM {
  render(element: React.ReactElement, container: Element | null): void;
}

(ReactDOM as unknown as LegacyReactDOM).render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
); 