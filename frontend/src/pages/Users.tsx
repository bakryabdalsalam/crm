import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip
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

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'agent';
  is_active: boolean;
}

interface UpdateUserData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'agent';
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formError, setFormError] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'agent' as User['role']
  });

  const { showError } = useError();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, wrapLoading } = useLoadingState();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users');
      setUsers(response.data);
    } catch (error: any) {
      showError(
        'Failed to Load Users',
        'Could not retrieve the user list.',
        error.response?.data?.details || error.message
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormError('');
    setNewUser({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'agent'
    });
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email,
      password: '', // Don't populate password for security
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    });
    setFormError('');
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedUser(null);
    setFormError('');
    setNewUser({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'agent'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUser.email.trim() || (!editMode && !newUser.password) || !newUser.first_name.trim() || !newUser.last_name.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      if (editMode && selectedUser) {
        const updateData: UpdateUserData = {
          email: newUser.email,
          password: newUser.password || undefined,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role
        };
        
        const response = await wrapLoading(
          axios.put(`http://localhost:3000/api/users/${selectedUser.id}`, updateData)
        );
        setUsers(users.map(user => 
          user.id === selectedUser.id ? response.data : user
        ));
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      } else {
        const response = await wrapLoading(
          axios.post('http://localhost:3000/api/users', newUser)
        );
        setUsers([response.data, ...users]);
        enqueueSnackbar('User added successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await axios.patch(`http://localhost:3000/api/users/${user.id}/toggle-status`);
      setUsers(users.map(u => 
        u.id === user.id ? response.data : u
      ));
      enqueueSnackbar(`User ${response.data.is_active ? 'activated' : 'deactivated'} successfully`, {
        variant: 'success'
      });
    } catch (error: any) {
      showError(
        'Status Update Failed',
        'Could not update user status.',
        error.response?.data?.details || error.message
      );
    }
  };

  const getRoleColor = (role: User['role']): 'error' | 'warning' | 'primary' => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      agent: 'primary'
    } as const;
    return colors[role];
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 170,
      format: (_, row: User) => `${row.first_name} ${row.last_name}`
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 170
    },
    {
      id: 'role',
      label: 'Role',
      minWidth: 130,
      format: (value: User['role']) => (
        <Chip
          label={value.toUpperCase()}
          color={getRoleColor(value)}
          size="small"
        />
      )
    },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 130,
      format: (value: boolean) => (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Users Management"
        action={{
          label: "Add User",
          icon: <AddIcon />,
          onClick: handleOpen
        }}
      />

      <DataTable
        columns={columns}
        rows={users}
        getRowActions={(row) => (
          <Box>
            <Button size="small" color="primary" onClick={() => handleEdit(row)}>
              Edit
            </Button>
            <Button
              size="small"
              color={row.is_active ? 'error' : 'success'}
              onClick={() => handleToggleStatus(row)}
              sx={{ ml: 1 }}
            >
              {row.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Box>
        )}
        searchPlaceholder="Search users..."
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? 'Edit User' : 'Add New User'}
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
                value={newUser.first_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="last_name"
                label="Last Name"
                value={newUser.last_name}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="email"
                label="Email"
                type="email"
                value={newUser.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormField
                name="password"
                label={editMode ? "New Password (leave empty to keep current)" : "Password"}
                type="password"
                value={newUser.password}
                onChange={handleChange}
                required={!editMode}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({
                    ...newUser,
                    role: e.target.value as User['role']
                  })}
                >
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
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
              {editMode ? 'Save Changes' : 'Add User'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users;