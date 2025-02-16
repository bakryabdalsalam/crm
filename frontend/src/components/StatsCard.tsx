import { Box, Card, Typography, IconButton, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { ArrowForward } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatsCard = ({ title, value, icon, trend, onClick }: StatsCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        } : {},
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
          }}
        >
          {icon}
        </Box>
        {onClick && (
          <IconButton size="small" color="primary">
            <ArrowForward fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 600 }}>
        {value}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: trend ? 1 : 0 }}>
        {title}
      </Typography>

      {trend && (
        <Typography
          variant="caption"
          sx={{
            color: trend.isPositive ? 'success.main' : 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 'auto'
          }}
        >
          {trend.isPositive ? '+' : ''}{trend.value}%
          {trend.isPositive ? ' increase' : ' decrease'}
        </Typography>
      )}
    </Card>
  );
};

export default StatsCard;