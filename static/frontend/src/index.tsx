import React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import '@atlaskit/css-reset';

const StrictMode = React.StrictMode as any;

(ReactDOM as any).render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root')
); 