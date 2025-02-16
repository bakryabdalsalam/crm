import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Form from '../components/Form';
import { useFormValidation } from '../hooks/useFormValidation';
import PreLoginLayout from '../components/PreLoginLayout';
import FormField from '../components/FormField';
import FormSection from '../components/FormSection';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const { errors, validateField, validateForm } = useFormValidation<LoginFormData>({
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email address'
    },
    password: {
      required: true,
      errorMessage: 'Password is required'
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name as keyof LoginFormData, value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // No need to call navigate here as the useEffect will handle it
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PreLoginLayout>
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 400, 
          mx: 'auto', 
          p: 2 
        }}
      >
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" component="h1" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} loading={loading} submitLabel="Sign In">
              <FormSection>
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                  required
                  fullWidth
                />

                <FormField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={loading}
                  required
                  fullWidth
                  endIcon={showPassword ? <VisibilityOff /> : <Visibility />}
                  onEndIconClick={() => setShowPassword(!showPassword)}
                  tooltip="Toggle password visibility"
                />
              </FormSection>
            </Form>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/register"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Register here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PreLoginLayout>
  );
};

export default Login;