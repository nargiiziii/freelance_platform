import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
// import { ThemeProvider } from '../src/context/ThemeContext'; // ✅ Добавлено
import "./index.scss";
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider> {/* ✅ Обернули */}
        <App />
      </ThemeProvider>
    </PersistGate>
  </Provider>
);
