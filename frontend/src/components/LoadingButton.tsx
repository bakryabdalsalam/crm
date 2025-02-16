import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

const LoadingButton = ({ loading = false, children, ...props }: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      disabled={loading || props.disabled}
      sx={{
        position: 'relative',
        ...props.sx,
      }}
    >
      {loading ? (
        <>
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              color: (theme) => 
                props.variant === 'contained' 
                  ? 'rgba(255, 255, 255, 0.6)' 
                  : theme.palette.primary.main
            }}
          />
          <span style={{ opacity: 0 }}>{children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;