import { Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface PreLoginLayoutProps {
  children: ReactNode;
}

const PreLoginLayout = ({ children }: PreLoginLayoutProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          opacity: 0.05,
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: `radial-gradient(circle at 25px 25px, ${theme.palette.background.paper} 2%, transparent 0%), 
                          radial-gradient(circle at 75px 75px, ${theme.palette.background.paper} 2%, transparent 0%)`,
          backgroundSize: '100px 100px',
          opacity: 0.4,
          zIndex: 1,
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          zIndex: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PreLoginLayout;