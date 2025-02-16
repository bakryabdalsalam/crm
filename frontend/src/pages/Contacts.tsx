import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem
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

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  customer_id: string;
  customers?: {
    company_name: string;
  };
}

interface Customer {
  id: string;
  company_name: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formError, setFormError] = useState('');
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    customer_id: ''
  });

  const { showError } = useError();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, wrapLoading } = useLoadingState();

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/contacts');
      setContacts(response.data);
    } catch (error: any) {
      showError(
        'Failed to Load Contacts',
        'Could not retrieve the contact list.',
        error.response?.data?.details || error.message
      );
    }
  };

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
    fetchContacts();
    fetchCustomers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormError('');
    setNewContact({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      customer_id: ''
    });
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setNewContact({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone || '',
      position: contact.position || '',
      customer_id: contact.customer_id
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedContact(null);
    setFormError('');
    setNewContact({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      customer_id: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`http://localhost:3000/api/contacts/${id}`);
        setContacts(contacts.filter(contact => contact.id !== id));
        enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
      } catch (error: any) {
        showError(
          'Delete Failed',
          'Could not delete the contact.',
          error.response?.data?.details || error.message
        );
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContact({
      ...newContact,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newContact.first_name.trim() || !newContact.last_name.trim() || !newContact.email.trim() || !newContact.customer_id) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      if (editMode && selectedContact) {
        const response = await wrapLoading(
          axios.put(`http://localhost:3000/api/contacts/${selectedContact.id}`, newContact)
        );
        setContacts(contacts.map(contact => 
          contact.id === selectedContact.id ? response.data : contact
        ));
        enqueueSnackbar('Contact updated successfully', { variant: 'success' });
      } else {
        const response = await wrapLoading(
          axios.post('http://localhost:3000/api/contacts', newContact)
        );
        setContacts([response.data, ...contacts]);
        enqueueSnackbar('Contact added successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to save contact');
    }
  };

  const columns = [
    { 
      id: 'name', 
      label: 'Name',
      minWidth: 170,
      format: (_value: any, row: Contact) => `${row.first_name} ${row.last_name}`
    },
    { 
      id: 'email', 
      label: 'Email', 
      minWidth: 170,
      format: (value: string) => value || '-'
    },
    { 
      id: 'phone', 
      label: 'Phone', 
      minWidth: 130,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    },
    { 
      id: 'position', 
      label: 'Position', 
      minWidth: 130,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    },
    {
      id: 'customers',
      label: 'Company',
      minWidth: 170,
      format: (value: { company_name: string } | undefined) => value?.company_name || '-'
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Contacts"
        action={{
          label: "Add Contact",
          icon: <AddIcon />,
          onClick: handleOpen
        }}
      />

      <DataTable
        columns={columns}
        rows={contacts}
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
        searchPlaceholder="Search contacts..."
      />

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Edit Contact' : 'Add New Contact'}
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
                name="first_name"
                label="First Name"
                value={newContact.first_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="last_name"
                label="Last Name"
                value={newContact.last_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="email"
                label="Email"
                type="email"
                value={newContact.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="phone"
                label="Phone"
                value={newContact.phone}
                onChange={handleChange}
                fullWidth
              />
              <FormField
                name="position"
                label="Position"
                value={newContact.position}
                onChange={handleChange}
                fullWidth
              />
              <FormField
                select
                name="customer_id"
                label="Company"
                value={newContact.customer_id}
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
              {editMode ? 'Save Changes' : 'Add Contact'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Contacts;