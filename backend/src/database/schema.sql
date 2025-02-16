-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS user_assignments CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent');

-- Create users table first since other tables reference it
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(12,2),
    status VARCHAR(50) CHECK (status IN ('LEAD', 'OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')),
    expected_close_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    type VARCHAR(50) CHECK (type IN ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE')),
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_assignments table
CREATE TABLE user_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, deal_id)
);

-- Create team_members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manager_id, agent_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX idx_deals_customer_id ON deals(customer_id);
CREATE INDEX idx_activities_customer_id ON activities(customer_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_assignments_user_id ON user_assignments(user_id);
CREATE INDEX idx_user_assignments_deal_id ON user_assignments(deal_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_team_members_manager_id ON team_members(manager_id);
CREATE INDEX idx_team_members_agent_id ON team_members(agent_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create security policies
-- Allow unrestricted access for registration
CREATE POLICY users_insert_public ON users
    FOR INSERT
    WITH CHECK (true);

-- Add policies for customers table
CREATE POLICY customers_select ON customers FOR SELECT USING (true);
CREATE POLICY customers_insert ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY customers_update ON customers FOR UPDATE USING (true);
CREATE POLICY customers_delete ON customers FOR DELETE USING (true);

-- Add policies for contacts table
DROP POLICY IF EXISTS contacts_select ON contacts;
DROP POLICY IF EXISTS contacts_insert ON contacts;
DROP POLICY IF EXISTS contacts_update ON contacts;
DROP POLICY IF EXISTS contacts_delete ON contacts;

CREATE POLICY contacts_select ON contacts FOR SELECT USING (true);
CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY contacts_update ON contacts FOR UPDATE USING (true);
CREATE POLICY contacts_delete ON contacts FOR DELETE USING (true);

-- Users can read their own data
CREATE POLICY users_select ON users
    FOR SELECT
    USING (true);

-- Only admins can update users
CREATE POLICY users_update ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = current_user::uuid 
            AND role = 'admin'
        )
    );

-- Only admins can delete users
CREATE POLICY users_delete ON users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = current_user::uuid 
            AND role = 'admin'
        )
    );

-- Disable RLS temporarily for admin insertion
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert a default admin user
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role
) VALUES (
    'admin@example.com',
    '$2a$10$NtpJXA5c0CCxU4.dR8FiaeGQNqRT0FBJUfFyGsNB9qH9YyMsyq5Pi', -- password: admin123
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for deals if they exist
DROP POLICY IF EXISTS deals_select_policy ON deals;
DROP POLICY IF EXISTS deals_insert_policy ON deals;
DROP POLICY IF EXISTS deals_update_policy ON deals;
DROP POLICY IF EXISTS deals_delete_policy ON deals;

-- Update auth handling for deals
CREATE OR REPLACE FUNCTION get_auth_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.uid()::uuid,
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
$$;

-- Enable administrators and managers to perform all operations
CREATE POLICY deals_select_policy ON deals
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
        OR EXISTS (
            SELECT 1 FROM user_assignments ua 
            WHERE ua.deal_id = deals.id 
            AND ua.user_id = get_auth_user_id()
        )
    );

CREATE POLICY deals_insert_policy ON deals
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

CREATE POLICY deals_update_policy ON deals
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

CREATE POLICY deals_delete_policy ON deals
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies for deals table
CREATE POLICY "Deals are viewable by authenticated users"
  ON deals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Deals can be created by authenticated users"
  ON deals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Deals can be updated by authenticated users"
  ON deals FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Deals can be deleted by authenticated users"
  ON deals FOR DELETE
  USING (auth.role() = 'authenticated');

-- Drop existing policies for user_assignments if they exist
DROP POLICY IF EXISTS user_assignments_select_policy ON user_assignments;
DROP POLICY IF EXISTS user_assignments_insert_policy ON user_assignments;
DROP POLICY IF EXISTS user_assignments_update_policy ON user_assignments;
DROP POLICY IF EXISTS user_assignments_delete_policy ON user_assignments;

CREATE POLICY user_assignments_select_policy ON user_assignments
    FOR SELECT 
    USING (
        user_id = get_auth_user_id()
        OR assigned_by = get_auth_user_id()
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

CREATE POLICY user_assignments_insert_policy ON user_assignments
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

CREATE POLICY user_assignments_update_policy ON user_assignments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

CREATE POLICY user_assignments_delete_policy ON user_assignments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = get_auth_user_id()
            AND (users.role = 'admin' OR users.role = 'manager')
        )
    );

-- Add trigger to automatically set assigned_by
CREATE OR REPLACE FUNCTION set_assigned_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.assigned_by = get_auth_user_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_assigned_by_trigger
    BEFORE INSERT ON user_assignments
    FOR EACH ROW
    EXECUTE FUNCTION set_assigned_by();

-- Users table RLS policies
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simpler RLS policies to avoid recursion
CREATE POLICY users_select_policy ON users
    FOR SELECT 
    USING (true); -- Allow all authenticated users to read user data

CREATE POLICY users_insert_policy ON users
    FOR INSERT 
    WITH CHECK (true); -- Allow new user registration

CREATE POLICY users_update_policy ON users
    FOR UPDATE 
    USING (
        auth.uid()::text = id::text -- Users can only update their own data
        OR 
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'::user_role
        )
    );

CREATE POLICY users_delete_policy ON users
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'::user_role
        )
    );