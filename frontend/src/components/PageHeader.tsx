import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  children?: ReactNode;
}

const PageHeader = ({ title, action, children }: PageHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: children ? 3 : 0
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon}
            onClick={action.onClick}
            fullWidth={isMobile}
          >
            {action.label}
          </Button>
        )}
      </Box>
      {children}
    </Box>
  );
};

export default PageHeader;