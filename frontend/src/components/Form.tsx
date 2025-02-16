import { ReactNode } from 'react';
import { Box } from '@mui/material';
import LoadingButton from './LoadingButton';

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  loading?: boolean;
  submitLabel?: string;
  submitFullWidth?: boolean;
  submitDisabled?: boolean;
}

const Form = ({ 
  onSubmit, 
  children, 
  loading = false, 
  submitLabel = 'Submit', 
  submitFullWidth = true,
  submitDisabled = false
}: FormProps) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {children}
      <LoadingButton
        type="submit"
        variant="contained"
        fullWidth={submitFullWidth}
        disabled={submitDisabled}
        loading={loading}
        sx={{
          py: 1.5,
          mt: 1,
          fontWeight: 600
        }}
      >
        {submitLabel}
      </LoadingButton>
    </Box>
  );
};

export default Form;