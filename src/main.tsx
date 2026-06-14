/**
 * TwinLink - Main Entry Point
 * Renders the React application with providers
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E1E3F',
            color: '#fff',
            border: '1px solid #2D2D44',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#1E1E3F',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#1E1E3F',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
