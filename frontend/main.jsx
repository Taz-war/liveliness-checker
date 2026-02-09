import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline'; // <--- Import this
import App from './App';

// Import Roboto font weights
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const rootElement = document.getElementById('root');
const context = JSON.parse(rootElement.dataset.context || '{}');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* CssBaseline kicks in consistent styling across browsers */}
    <CssBaseline />
    <App user={context} />
  </React.StrictMode>
);