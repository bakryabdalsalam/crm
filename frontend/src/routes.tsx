import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from './components/Navigation';
import PageLayout from './components/PageLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Contacts from './pages/Contacts';
import Deals from './pages/Deals';
import Users from './pages/Users';
import TaskAssignment from './pages/TaskAssignment';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Navigation />
              <Routes>
                <Route path="/" element={<PageLayout><Dashboard /></PageLayout>} />
                <Route path="/customers" element={<PageLayout><Customers /></PageLayout>} />
                <Route path="/contacts" element={<PageLayout><Contacts /></PageLayout>} />
                <Route path="/deals" element={<PageLayout><Deals /></PageLayout>} />
                <Route path="/users" element={<PageLayout><Users /></PageLayout>} />
                <Route path="/task-assignment" element={<PageLayout><TaskAssignment /></PageLayout>} />
              </Routes>
            </Box>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes; 