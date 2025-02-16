import { Box, Typography, Divider, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  noDivider?: boolean;
}

const FormSection = ({ 
  title, 
  description, 
  children, 
  noDivider = false 
}: FormSectionProps) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 4, '&:last-child': { mb: 0 } }}>
      {title && (
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              mb: description ? 1 : 0
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                maxWidth: '600px',
                lineHeight: 1.6
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          [theme.breakpoints.up('sm')]: {
            gap: 3,
          },
        }}
      >
        {children}
      </Box>
      {!noDivider && (
        <Divider 
          sx={{ 
            mt: 4,
            opacity: 0.5
          }} 
        />
      )}
    </Box>
  );
};

export default FormSection;