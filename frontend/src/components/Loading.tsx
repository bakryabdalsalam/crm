import { Box, CircularProgress, Typography, useTheme, useMediaQuery } from '@mui/material';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

const Loading = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullPage = false 
}: LoadingProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getSizeValues = () => {
    switch (size) {
      case 'small':
        return { progress: 24, spacing: 1 };
      case 'large':
        return { progress: 48, spacing: 3 };
      default:
        return { progress: 36, spacing: 2 };
    }
  };

  const { progress, spacing } = getSizeValues();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullPage ? '100vh' : 200,
        gap: spacing,
        p: spacing,
        width: '100%'
      }}
    >
      <CircularProgress 
        size={isMobile ? Math.max(24, progress * 0.8) : progress}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
        }}
      />
      <Typography 
        variant={isMobile ? "body2" : "body1"} 
        color="text.secondary"
        sx={{
          textAlign: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 }
          }
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;