import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useError } from '../context/ErrorContext';
import LoadingOverlay from '../components/LoadingOverlay';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalContacts: 0,
    totalDeals: 0,
    recentDeals: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showError } = useError();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const results = await Promise.allSettled([
          axios.get('http://localhost:3000/api/customers'),
          axios.get('http://localhost:3000/api/contacts'),
          axios.get('http://localhost:3000/api/deals')
        ]);

        const [customers, contacts, deals] = results.map(result => 
          result.status === 'fulfilled' ? result.value?.data || [] : []
        );

        setStats({
          totalCustomers: customers.length,
          totalContacts: contacts.length,
          totalDeals: deals.length,
          recentDeals: deals.slice(0, 5)
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
        showError('Dashboard Error', 'Failed to load dashboard data', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h3">
                {stats.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Contacts
              </Typography>
              <Typography variant="h3">
                {stats.totalContacts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Deals
              </Typography>
              <Typography variant="h3">
                {stats.totalDeals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Deals
            </Typography>
            {stats.recentDeals.length > 0 ? (
              <List>
                {stats.recentDeals.map((deal: any) => (
                  <ListItem key={deal.id}>
                    <ListItemText
                      primary={deal.title || 'Untitled Deal'}
                      secondary={`$${deal.value?.toLocaleString() || '0'} - ${deal.status || 'Unknown'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No recent deals found</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;