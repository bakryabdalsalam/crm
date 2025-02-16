const logActivity = async (supabase, userId, action) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{ user_id: userId, action }]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const validateLead = (lead) => {
  const requiredFields = ['first_name', 'last_name'];
  for (const field of requiredFields) {
    if (!lead[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return true;
};

module.exports = {
  logActivity,
  validateLead
};