const { supabase } = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // First set the session with the provided token
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: null
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Now get the user with the active session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth user error:', userError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user data from our users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(401).json({ error: 'User not found in database' });
    }

    // Set user data on request object
    req.user = {
      ...userData,
      session: sessionData.session
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;