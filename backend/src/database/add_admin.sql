-- Temporarily disable RLS for admin insertion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert admin user
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role
) VALUES (
    'admin@crm.com',
    '$2a$10$NtpJXA5c0CCxU4.dR8FiaeGQNqRT0FBJUfFyGsNB9qH9YyMsyq5Pi', -- Default password: admin123
    'Super',
    'Admin',
    'admin'
) ON CONFLICT (email) 
DO UPDATE SET
    role = 'admin',
    is_active = true;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify admin user was created
SELECT id, email, role, is_active 
FROM users 
WHERE email = 'admin@crm.com';