import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

import { getApiBaseUrl } from './config/apiConfig';

const apiBaseUrl = getApiBaseUrl();
axios.defaults.baseURL = apiBaseUrl;

axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', apiBaseUrl);
    } else if (config.url.startsWith('/api')) {
      config.url = `${apiBaseUrl}${config.url}`;
    }
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
