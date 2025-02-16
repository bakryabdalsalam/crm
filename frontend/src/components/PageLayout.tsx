import { Box, Container, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';
import PageTransition from './PageTransition';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  noPadding?: boolean;
}

const PageLayout = ({ 
  children, 
  maxWidth = 'xl',
  noPadding = false
}: PageLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        marginLeft: { xs: 0, md: `${drawerWidth}px` },
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar /> {/* Space for AppBar */}
      <Container 
        maxWidth={maxWidth} 
        sx={{ 
          py: noPadding ? 0 : { xs: 2, sm: 3 },
          px: noPadding ? 0 : { xs: 2, sm: 3 },
        }}
      >
        <PageTransition>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 1,
              p: noPadding ? 0 : { xs: 2, sm: 3 },
              boxShadow: theme.shadows[1],
              minHeight: `calc(100vh - ${theme.spacing(3)} - 64px)`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </PageTransition>
      </Container>
    </Box>
  );
};

export default PageLayout;