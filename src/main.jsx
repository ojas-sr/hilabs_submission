import React from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import {ThemeProvider, CssBaseline} from '@mui/material';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './styles/global.css';
import App from './App.jsx';
import theme from './styles/theme.js';
import {DemoProvider} from './shared/hooks/useDemoStore.jsx';

// HashRouter so the static build works on GitHub Pages / Vercel without rewrites.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <DemoProvider>
          <App />
        </DemoProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
