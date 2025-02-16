import { SnackbarProvider } from 'notistack';
import { useTheme } from '@mui/material';

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const theme = useTheme();

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      autoHideDuration={3000}
      style={{
        marginBottom: theme.spacing(2)
      }}
    >
      {children}
    </SnackbarProvider>
  );
};

export default NotificationProvider;