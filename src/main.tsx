
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Service Worker registration completely removed for clean deployment
// No service worker functionality to avoid deployment conflicts

createRoot(document.getElementById("root")!).render(<App />);
