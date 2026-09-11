import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DockView } from './components/DockView.jsx'

const isDock = window.location.hash === '#dock' || window.location.search.includes('view=dock');

try {
  const rootEl = document.getElementById('root');
  createRoot(rootEl).render(
    <StrictMode>
      {isDock ? <DockView /> : <App />}
    </StrictMode>,
  );
} catch (err) {
  console.error('Fatal render error:', err);
}
