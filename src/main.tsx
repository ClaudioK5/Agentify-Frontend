import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getGoogleWebClientId } from "./auth/apiConfig";
import { AuthProvider } from "./auth/AuthProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { I18nProvider } from "./i18n/I18nProvider";
import App from "./App";
import "./index.css";

const googleClientId = getGoogleWebClientId() ?? "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ToastProvider>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
