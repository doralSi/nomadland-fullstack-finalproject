import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/global.css';
import './styles/darkMode.css';
import './styles/accessibility.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RegionProvider } from './context/RegionContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <RegionProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </RegionProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);

