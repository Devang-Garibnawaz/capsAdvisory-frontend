import * as Sentry from "@sentry/react";
import React from "react";
import AppRoutes from "./AppRoutes";
import AuthProvider from "./auth/contexts/AuthProvider";
import Loader from "./core/components/Loader";
import SettingsProvider from "./core/contexts/SettingsProvider";
import SnackbarProvider from "./core/contexts/SnackbarProvider";
import usePageTracking from "./core/hooks/usePageTracking";
import { setupFetchInterceptor, setupAxiosInterceptor } from "./http/interceptors";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
  });
}

// Initialize API interceptors
setupFetchInterceptor();
setupAxiosInterceptor();

function App() {
  usePageTracking();

  return (
    <React.Suspense fallback={<Loader />}>
      <Sentry.ErrorBoundary fallback={"An error has occurred"}>
        <SettingsProvider>
          <SnackbarProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </SnackbarProvider>
        </SettingsProvider>
      </Sentry.ErrorBoundary>
    </React.Suspense>
  );
}

export default App;
