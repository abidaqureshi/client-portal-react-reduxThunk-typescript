import 'bootstrap/dist/css/bootstrap.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import configureStore from './store/configureStore';
import App from './app/App';
import { mockRequests } from './fetch/mockRequests';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import theme from './theme';
import { postRequestAccessLinkAsync } from './fetch/requests';
// import registerServiceWorker from './registerServiceWorker';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') as string;
const history = createBrowserHistory({ basename: baseUrl });

const { store, persistor } = configureStore(history);

const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Lato', sans-serif;
    color: ${theme.colors.darkGreen};
    font-size: ${theme.typography.fontM};
  }
`;

if (process.env.REACT_APP_MOCKS) {
    console.log('MOCKS are enabled');
    mockRequests();
}

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <PersistGate persistor={persistor}>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <GlobalStyles />
                    <App />
                </ConnectedRouter>
            </Provider>
        </PersistGate>
    </ThemeProvider>,
    document.getElementById('root'),
);

// registerServiceWorker();
