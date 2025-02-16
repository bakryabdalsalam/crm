const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { supabase, setAuthUser } = require('./config/supabase');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration with more restrictive settings
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Mount auth routes without authentication middleware
app.use('/api/auth', authRoutes);

// Use authentication middleware for protected routes
app.use(setAuthUser);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Auth error handler
const handleSupabaseError = (error, res) => {
  console.error('Supabase error:', error);
  if (error.code === '42501') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  if (error.code === '42703') {
    return res.status(400).json({ error: 'Invalid column reference' });
  }
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Duplicate record' });
  }
  res.status(500).json({ error: 'Database operation failed' });
};

// Protected routes
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.get('/api/deals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*, customers(company_name)');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.post('/api/deals', async (req, res) => {
  try {
    const { title, value, status, customer_id, expected_close_date } = req.body;
    if (!title || !customer_id) {
      return res.status(400).json({ 
        error: 'Title and customer are required fields' 
      });
    }

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: customerExists } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .single();

    if (!customerExists) {
      return res.status(400).json({ 
        error: 'Invalid customer selected' 
      });
    }

    const { data, error } = await supabase
      .from('deals')
      .insert([{
        title,
        value: value || 0,
        status: status || 'LEAD',
        customer_id,
        expected_close_date,
        created_by: user.id,
        created_at: new Date().toISOString()
      }])
      .select('*, customers(company_name)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating deal:', error);
    handleSupabaseError(error, res);
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('customers')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_assignments')
      .select(`
        *,
        deal:deals(*),
        assigned_by:users!user_assignments_assigned_by_fkey(first_name, last_name)
      `);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_assignments')
      .insert(req.body)
      .select('*, deal:deals(*), assigned_by:users!user_assignments_assigned_by_fkey(first_name, last_name)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('contacts')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    handleSupabaseError(error, res);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});