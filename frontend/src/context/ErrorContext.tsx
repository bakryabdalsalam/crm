import { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorContextType {
  showError: (title: string, message: string, details?: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [error, setError] = useState<{
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const showError = (title: string, message: string, details?: string) => {
    setError({ title, message, details });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
      <Dialog
        open={Boolean(error)}
        onClose={clearError}
        maxWidth="sm"
        fullWidth
      >
        {error && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon color="error" />
                <Typography variant="h6" component="span">
                  {error.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {error.message}
              </Typography>
              {error.details && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {error.details}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={clearError} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};