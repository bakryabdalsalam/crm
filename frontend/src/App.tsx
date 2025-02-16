import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import NotificationProvider from './components/NotificationProvider';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme/theme';
import AppRoutes from './routes';

// Import Inter font
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorProvider>
            <NotificationProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </NotificationProvider>
          </ErrorProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
