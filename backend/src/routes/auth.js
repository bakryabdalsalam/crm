const express = require('express');
const router = express.Router();
const { supabasePublic, supabase } = require('../config/supabase');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({ error: authError.message });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: userData,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'agent' } = req.body;

    // Register user without email confirmation
    const { data: authData, error: authError } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        },
        emailRedirectTo: null
      }
    });

    if (authError) {
      console.error('Registration error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData?.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Create user record in users table
    const { data: userData, error: userError } = await supabasePublic
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        password_hash: 'managed_by_supabase'
      }])
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      // Clean up auth user if database insert fails
      try {
        await supabasePublic.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Failed to clean up auth user:', deleteError);
      }
      return res.status(500).json({ error: 'Error creating user record' });
    }

    // Auto-sign in the user
    const { data: signInData, error: signInError } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      return res.status(201).json({
        message: 'User created successfully. Please sign in.',
        user: userData
      });
    }

    res.status(201).json({
      user: userData,
      session: signInData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabasePublic.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user route
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Get user error:', authError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', user.email)
      .single();

    if (userError) {
      console.error('User data error:', userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;