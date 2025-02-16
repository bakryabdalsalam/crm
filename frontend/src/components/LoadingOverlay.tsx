import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingOverlay = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: (theme) => theme.zIndex.drawer + 2,
        color: '#fff',
      }}
    >
      <CircularProgress color="inherit" size={48} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingOverlay;