import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ensureSpeechVoices } from './lib/speech';
import './index.css';

ensureSpeechVoices();

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
