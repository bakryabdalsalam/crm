import { Box, Typography, Button } from '@mui/material';
import { Warning, Refresh } from '@mui/icons-material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ErrorMessage = ({ 
  title = 'Something went wrong', 
  message, 
  action 
}: ErrorMessageProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Warning 
        color="error" 
        sx={{ 
          fontSize: 48,
          mb: 2,
          opacity: 0.8
        }} 
      />
      
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {title}
      </Typography>

      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          maxWidth: '400px',
          mb: action ? 3 : 0
        }}
      >
        {message}
      </Typography>

      {action && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default ErrorMessage;