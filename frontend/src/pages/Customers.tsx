import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useError } from '../context/ErrorContext';
import { useSnackbar } from 'notistack';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import LoadingButton from '../components/LoadingButton';
import { useLoadingState } from '../hooks/useLoadingState';

interface Customer {
  id: string;
  company_name: string;
  industry: string;
  website: string;
  address: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formError, setFormError] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    industry: '',
    website: '',
    address: ''
  });

  const { showError } = useError();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, wrapLoading } = useLoadingState();

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/customers');
      setCustomers(response.data);
    } catch (error: any) {
      showError(
        'Failed to Load Customers',
        'Could not retrieve the customer list.',
        error.response?.data?.details || error.message
      );
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormError('');
    setNewCustomer({
      company_name: '',
      industry: '',
      website: '',
      address: ''
    });
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      company_name: customer.company_name,
      industry: customer.industry || '',
      website: customer.website || '',
      address: customer.address || ''
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedCustomer(null);
    setFormError('');
    setNewCustomer({
      company_name: '',
      industry: '',
      website: '',
      address: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:3000/api/customers/${id}`);
        setCustomers(customers.filter(customer => customer.id !== id));
        enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      } catch (error: any) {
        showError(
          'Delete Failed',
          'Could not delete the customer.',
          error.response?.data?.details || error.message
        );
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newCustomer.company_name.trim()) {
      setFormError('Company name is required');
      return;
    }

    try {
      if (editMode && selectedCustomer) {
        const response = await wrapLoading(
          axios.put(`http://localhost:3000/api/customers/${selectedCustomer.id}`, newCustomer)
        );
        setCustomers(customers.map(customer => 
          customer.id === selectedCustomer.id ? response.data : customer
        ));
        enqueueSnackbar('Customer updated successfully', { variant: 'success' });
      } else {
        const response = await wrapLoading(
          axios.post('http://localhost:3000/api/customers', newCustomer)
        );
        setCustomers([response.data, ...customers]);
        enqueueSnackbar('Customer added successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to save customer');
    }
  };

  const columns = [
    { 
      id: 'company_name', 
      label: 'Company Name', 
      minWidth: 170 
    },
    { 
      id: 'industry', 
      label: 'Industry', 
      minWidth: 130,
      hideOnMobile: true 
    },
    { 
      id: 'website', 
      label: 'Website', 
      minWidth: 170,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    },
    { 
      id: 'address', 
      label: 'Address', 
      minWidth: 170,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Customers"
        action={{
          label: "Add Customer",
          icon: <AddIcon />,
          onClick: handleOpen
        }}
      />

      <DataTable
        columns={columns}
        rows={customers}
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
        searchPlaceholder="Search customers..."
      />

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Edit Customer' : 'Add New Customer'}
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
                name="company_name"
                label="Company Name"
                value={newCustomer.company_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="industry"
                label="Industry"
                value={newCustomer.industry}
                onChange={handleChange}
                fullWidth
              />
              <FormField
                name="website"
                label="Website"
                type="url"
                value={newCustomer.website}
                onChange={handleChange}
                fullWidth
              />
              <FormField
                name="address"
                label="Address"
                multiline
                rows={3}
                value={newCustomer.address}
                onChange={handleChange}
                fullWidth
              />
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
              {editMode ? 'Save Changes' : 'Add Customer'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Customers;