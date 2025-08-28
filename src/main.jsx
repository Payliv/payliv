import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from '@/App';
    import '@/index.css';
    import { AuthProvider } from '@/contexts/SupabaseAuthContext';
    import { ThemeProvider } from '@/contexts/ThemeContext';
    import { HelmetProvider } from 'react-helmet-async';
    import { ProfileProvider } from '@/contexts/ProfileContext';
    import ErrorBoundary from '@/components/ErrorBoundary';
    import { setupFetchInterceptor } from '@/lib/fetchInterceptor';
    import { NotificationsProvider } from '@/contexts/NotificationsContext';
    import 'swiper/css';
    import 'swiper/css/navigation';
    import 'swiper/css/pagination';
    import 'swiper/css/effect-fade';

    // Activate the global fetch interceptor
    setupFetchInterceptor();

    // --- Global Error Detection ---
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error, event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Global unhandled promise rejection caught:', event.reason);
    });
    // --- End of Global Error Detection ---

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <ErrorBoundary>
          <HelmetProvider>
            <AuthProvider>
              <ProfileProvider>
                <ThemeProvider>
                  <NotificationsProvider>
                    <App />
                  </NotificationsProvider>
                </ThemeProvider>
              </ProfileProvider>
            </AuthProvider>
          </HelmetProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
