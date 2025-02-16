
---

## Backend Development Steps using Supabase

### Step 1: Environment Setup & Supabase Project Configuration

1. **Create a Supabase Account & Project:**
   - Sign up or log in at [Supabase](https://supabase.com).
   - Create a new project and configure your database (choose a name, password, region, etc.).

2. **Configure API Keys & Settings:**
   - In the Supabase dashboard, note your Project URL and `anon`/public API key.
   - Configure authentication settings as needed (enable email/password, OAuth providers, etc.).

### Step 2: Database Design & Schema Creation

1. **Identify Entities & Relationships:**
   - **User:** `id`, `name`, `email`, `role` (sales_agent, admin, manager), etc.
   - **Lead:** `id`, `first_name`, `last_name`, `contact_details`, `source`, `status`, `assigned_to` (User ID), timestamps.
   - **Call/Appointment:** `id`, `lead_id`, `scheduled_time`, `call_notes`, `status`, `created_by` (User ID).
   - **Activity Log:** `id`, `user_id`, `action`, `timestamp`.

2. **Create Tables in Supabase:**
   - Use the SQL Editor in the Supabase dashboard to run migration scripts. For example:

   ```sql
   -- Users table (if not relying solely on Supabase Auth)
   create table profiles (
     id uuid primary key references auth.users not null,
     name text,
     role text check (role in ('sales_agent', 'admin', 'manager')),
     created_at timestamp with time zone default timezone('utc', now())
   );

   -- Leads table
   create table leads (
     id uuid primary key default uuid_generate_v4(),
     first_name text not null,
     last_name text not null,
     contact_details jsonb,  -- store phone, email, etc.
     source text,
     status text,
     assigned_to uuid references profiles(id),
     created_at timestamp with time zone default timezone('utc', now()),
     updated_at timestamp with time zone default timezone('utc', now())
   );

   -- Calls/Appointments table
   create table calls (
     id uuid primary key default uuid_generate_v4(),
     lead_id uuid references leads(id) not null,
     scheduled_time timestamp with time zone,
     call_notes text,
     status text,
     created_by uuid references profiles(id),
     created_at timestamp with time zone default timezone('utc', now())
   );

   -- Activity Log table
   create table activity_logs (
     id uuid primary key default uuid_generate_v4(),
     user_id uuid references profiles(id),
     action text,
     timestamp timestamp with time zone default timezone('utc', now())
   );
