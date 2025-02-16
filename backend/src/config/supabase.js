require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file');
  process.exit(1);
}

// Create a Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Create a separate client for public operations
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Middleware to set auth context
const setAuthUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Store the token for subsequent requests
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth setup error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { 
  supabase,
  supabasePublic,
  setAuthUser 
};