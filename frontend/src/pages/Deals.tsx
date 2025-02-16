import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../config/axios';
import { useError } from '../context/ErrorContext';
import { useSnackbar } from 'notistack';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import LoadingButton from '../components/LoadingButton';
import { useLoadingState } from '../hooks/useLoadingState';

interface Deal {
  id: string;
  title: string;
  value: number;
  status: 'LEAD' | 'OPPORTUNITY' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  expected_close_date: string;
  customer_id: string;
  customers?: {
    company_name: string;
  };
}

interface Customer {
  id: string;
  company_name: string;
}

const statusOptions: Deal['status'][] = [
  'LEAD',
  'OPPORTUNITY',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST'
];

const getStatusColor = (status: Deal['status']) => {
  const colors: Record<Deal['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    LEAD: 'default',
    OPPORTUNITY: 'info',
    PROPOSAL: 'warning',
    NEGOTIATION: 'primary',
    CLOSED_WON: 'success',
    CLOSED_LOST: 'error'
  };
  return colors[status];
};

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [formError, setFormError] = useState('');
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: '',
    status: 'LEAD' as Deal['status'],
    expected_close_date: '',
    customer_id: ''
  });

  const { showError } = useError();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, wrapLoading } = useLoadingState();

  const fetchDeals = async () => {
    try {
      const response = await axiosInstance.get('/deals');
      setDeals(response.data);
    } catch (error: any) {
      showError(
        'Failed to Load Deals',
        'Could not retrieve the deal list.',
        error.response?.data?.error || error.message
      );
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
    } catch (error: any) {
      showError(
        'Failed to Load Customers',
        'Could not retrieve the customer list.',
        error.response?.data?.error || error.message
      );
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchCustomers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormError('');
    setNewDeal({
      title: '',
      value: '',
      status: 'LEAD',
      expected_close_date: '',
      customer_id: ''
    });
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setNewDeal({
      title: deal.title,
      value: deal.value.toString(),
      status: deal.status,
      expected_close_date: deal.expected_close_date,
      customer_id: deal.customer_id
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedDeal(null);
    setFormError('');
    setNewDeal({
      title: '',
      value: '',
      status: 'LEAD',
      expected_close_date: '',
      customer_id: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await axiosInstance.delete(`/deals/${id}`);
        setDeals(deals.filter(deal => deal.id !== id));
        enqueueSnackbar('Deal deleted successfully', { variant: 'success' });
      } catch (error: any) {
        showError(
          'Delete Failed',
          'Could not delete the deal.',
          error.response?.data?.error || error.message
        );
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDeal({
      ...newDeal,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newDeal.title.trim() || !newDeal.value || !newDeal.customer_id || !newDeal.expected_close_date) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      const formattedDeal = {
        ...newDeal,
        value: parseFloat(newDeal.value)
      };

      if (editMode && selectedDeal) {
        const response = await wrapLoading(
          axiosInstance.put(`/deals/${selectedDeal.id}`, formattedDeal)
        );
        setDeals(deals.map(deal => 
          deal.id === selectedDeal.id ? response.data : deal
        ));
        enqueueSnackbar('Deal updated successfully', { variant: 'success' });
      } else {
        const response = await wrapLoading(
          axiosInstance.post('/deals', formattedDeal)
        );
        setDeals([response.data, ...deals]);
        enqueueSnackbar('Deal added successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save deal';
      setFormError(errorMessage);
      showError('Save Failed', 'Could not save the deal.', errorMessage);
    }
  };

  const columns = [
    { 
      id: 'title', 
      label: 'Title', 
      minWidth: 170 
    },
    { 
      id: 'value', 
      label: 'Value', 
      minWidth: 130,
      format: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 130,
      format: (value: Deal['status']) => (
        <Chip 
          label={value.replace('_', ' ')} 
          color={getStatusColor(value)}
          size="small"
        />
      )
    },
    { 
      id: 'expected_close_date', 
      label: 'Expected Close Date', 
      minWidth: 170,
      hideOnMobile: true,
      format: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      id: 'customers',
      label: 'Customer',
      minWidth: 170,
      format: (value: { company_name: string }) => value?.company_name || '-'
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Deals"
        action={{
          label: "Add Deal",
          icon: <AddIcon />,
          onClick: handleOpen
        }}
      />

      <DataTable
        columns={columns}
        rows={deals}
        getRowActions={(row) => (
          <Box>
            <Button size="small" color="primary" onClick={() => handleEdit(row)}>
              Edit
            </Button>
            <Button 
              size="small" 
              color="error" 
              onClick={() => handleDelete(row.id)}
              sx={{ ml: 1 }}
            >
              Delete
            </Button>
          </Box>
        )}
        searchPlaceholder="Search deals..."
      />

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Edit Deal' : 'Add New Deal'}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                {formError}
              </Alert>
            )}
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormField
                autoFocus
                name="title"
                label="Deal Title"
                value={newDeal.title}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="value"
                label="Deal Value"
                type="number"
                value={newDeal.value}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                select
                name="status"
                label="Status"
                value={newDeal.status}
                onChange={handleChange}
                required
                fullWidth
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </FormField>
              <FormField
                name="expected_close_date"
                label="Expected Close Date"
                type="date"
                value={newDeal.expected_close_date}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormField
                select
                name="customer_id"
                label="Customer"
                value={newDeal.customer_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.company_name}
                  </MenuItem>
                ))}
              </FormField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isLoading}
            >
              {editMode ? 'Save Changes' : 'Add Deal'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Deals;