import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { useSnackbar } from 'notistack';
import FormField from '../components/FormField';
import FormSection from '../components/FormSection';
import LoadingButton from '../components/LoadingButton';
import PageHeader from '../components/PageHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import { useLoadingState } from '../hooks/useLoadingState';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  status: string;
  customers: {
    company_name: string;
  };
}

interface Assignment {
  id: string;
  user_id: string;
  deal_id: string;
  assigned_by: {
    first_name: string;
    last_name: string;
  };
  deal: Deal;
}

const TaskAssignment = () => {
  const { user, getToken } = useAuth();
  const { showError } = useError();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, wrapLoading } = useLoadingState();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedDeal, setSelectedDeal] = useState('');
  const [formError, setFormError] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsDataLoading(true);
    try {
      const token = await getToken();
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [agentsRes, dealsRes, assignmentsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/users', { headers }),
        axios.get('http://localhost:3000/api/deals', { headers }),
        axios.get('http://localhost:3000/api/assignments', { headers })
      ]);

      setAgents(agentsRes.data.filter((u: Agent & { role: string }) => u.role === 'agent'));
      setDeals(dealsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error: any) {
      showError(
        'Failed to Load Data',
        'Could not retrieve the necessary data.',
        error.response?.data?.error || error.message
      );
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent || !selectedDeal) {
      setFormError('Please select both an agent and a deal');
      return;
    }

    setFormError('');
    
    try {
      const token = await getToken();
      const response = await wrapLoading(
        axios.post('http://localhost:3000/api/assignments', 
          {
            user_id: selectedAgent,
            deal_id: selectedDeal,
            assigned_by: user?.id
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      );
      
      setAssignments([response.data, ...assignments]);
      setSelectedAgent('');
      setSelectedDeal('');
      enqueueSnackbar('Task assigned successfully', { variant: 'success' });
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to assign task');
    }
  };

  return (
    <Box>
      <PageHeader title="Task Assignment" />

      {isDataLoading ? (
        <LoadingOverlay />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <FormSection
                  title="Assign New Task"
                  description="Select an agent and a deal to create a new task assignment."
                >
                  {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {formError}
                    </Alert>
                  )}
                  
                  <FormField
                    select
                    fullWidth
                    label="Select Agent"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    margin="normal"
                    required
                  >
                    {agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {`${agent.first_name} ${agent.last_name}`}
                      </MenuItem>
                    ))}
                  </FormField>

                  <FormField
                    select
                    fullWidth
                    label="Select Deal"
                    value={selectedDeal}
                    onChange={(e) => setSelectedDeal(e.target.value)}
                    margin="normal"
                    required
                  >
                    {deals.map((deal) => (
                      <MenuItem key={deal.id} value={deal.id}>
                        {`${deal.title} - ${deal.customers.company_name}`}
                      </MenuItem>
                    ))}
                  </FormField>

                  <LoadingButton
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleAssign}
                    loading={isLoading}
                    disabled={!selectedAgent || !selectedDeal}
                  >
                    Assign Deal
                  </LoadingButton>
                </FormSection>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Deal</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        {agents.find(a => a.id === assignment.user_id)
                          ? `${agents.find(a => a.id === assignment.user_id)?.first_name} ${agents.find(a => a.id === assignment.user_id)?.last_name}`
                          : 'Unknown Agent'}
                      </TableCell>
                      <TableCell>{assignment.deal.title}</TableCell>
                      <TableCell>${assignment.deal.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={assignment.deal.status}
                          color={assignment.deal.status === 'CLOSED_WON' ? 'success' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {`${assignment.assigned_by.first_name} ${assignment.assigned_by.last_name}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default TaskAssignment;