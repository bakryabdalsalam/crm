import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Link,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Form from '../components/Form';
import { useFormValidation, emailPattern } from '../hooks/useFormValidation';
import PreLoginLayout from '../components/PreLoginLayout';
import FormField from '../components/FormField';
import FormSection from '../components/FormSection';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { errors, validateField, validateForm } = useFormValidation<RegisterFormData>({
    firstName: {
      required: true,
      minLength: 2,
      errorMessage: 'First name is required (minimum 2 characters)'
    },
    lastName: {
      required: true,
      minLength: 2,
      errorMessage: 'Last name is required (minimum 2 characters)'
    },
    email: {
      required: true,
      pattern: emailPattern,
      errorMessage: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      validate: (value) => {
        if (!/\d/.test(value)) return 'Password must contain at least one number';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        return true;
      },
      errorMessage: 'Password must be at least 8 characters'
    },
    confirmPassword: {
      required: true,
      validate: (value) => value === formData.password,
      errorMessage: 'Passwords do not match'
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name as keyof RegisterFormData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PreLoginLayout>
      <Card 
        sx={{ 
          maxWidth: 600, 
          width: '100%',
          boxShadow: theme.shadows[3],
          borderRadius: 2,
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
            zIndex: -1,
            borderRadius: 'inherit',
          }
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontSize: { xs: '1.75rem', sm: '2rem' }
              }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register a new admin account
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Form
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Register"
          >
            <FormSection
              title="Personal Information"
              description="Please enter your personal details for the admin account."
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormField
                    label="First Name"
                    name="firstName"
                    fullWidth
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    hint="Enter your first name"
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    label="Last Name"
                    name="lastName"
                    fullWidth
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    hint="Enter your last name"
                    required
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection
              title="Account Details"
              description="Set up your login credentials for accessing the CRM system."
            >
              <FormField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                hint="This will be your login username"
                required
                disabled={loading}
                autoComplete="email"
              />
              <FormField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                hint="Password must be at least 8 characters with numbers and letters"
                required
                disabled={loading}
                endIcon={showPassword ? <VisibilityOff /> : <Visibility />}
                onEndIconClick={() => setShowPassword(!showPassword)}
                tooltip="Toggle password visibility"
              />
              <FormField
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                hint="Re-enter your password to confirm"
                required
                disabled={loading}
                endIcon={showPassword ? <VisibilityOff /> : <Visibility />}
                onEndIconClick={() => setShowPassword(!showPassword)}
                tooltip="Toggle password visibility"
              />
            </FormSection>
          </Form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </PreLoginLayout>
  );
};

export default Register;