import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

console.info('[LiftAI] main.tsx starting application bootstrap.');

window.addEventListener('error', (event) => {
  console.error('[LiftAI] Unhandled window error.', event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[LiftAI] Unhandled promise rejection.', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('LiftAI could not find the root element.');
}

console.info('[LiftAI] React root mount target found.', rootElement);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
