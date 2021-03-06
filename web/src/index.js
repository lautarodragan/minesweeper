import { Auth0Provider } from "@auth0/auth0-react";
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './components/App';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-xzyu9ho6.us.auth0.com"
      clientId="wf7HEPTOdHDXXf7BfXvtJNevXZ5rv6T8"
      redirectUri={window.location.origin}
      audience="https://taros-minesweeper.herokuapp.com"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
