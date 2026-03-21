import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </SettingsProvider>
  </StrictMode>,
);
