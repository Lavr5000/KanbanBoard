# Supabase Migrations

This directory contains SQL migrations for the Kanban Board 2.0 database schema.

## Migrations

### 1. `20251226000000_initial_schema.sql`
Creates the initial database schema:
- **profiles**: User profiles (auto-created on signup)
- **boards**: Kanban boards owned by users
- **columns**: Columns within boards
- **tasks**: Tasks within columns

Features:
- UUID primary keys
- Foreign key relationships with CASCADE deletes
- CHECK constraints for data validation
- Indexes for query performance
- Automatic `updated_at` timestamps

### 2. `20251226000001_rls_policies.sql`
Configures Row Level Security (RLS) policies:
- Users can only access their own data
- Secure by default
- Auto-profile creation on signup

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Copy and paste the contents of each migration file in order:
   - First: `20251226000000_initial_schema.sql`
   - Second: `20251226000001_rls_policies.sql`
4. Click **Run** for each file
5. Verify success messages in the output

### Option 2: Using Supabase CLI (For development)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

### Option 3: Manual Execution

You can also execute the SQL directly using any PostgreSQL client by connecting to your Supabase database using the connection string from your project settings.

## Verification

After running migrations, verify the schema:

1. Go to **Database** → **Tables** in Supabase dashboard
2. You should see 4 tables:
   - profiles
   - boards
   - columns
   - tasks

3. Check **Authentication** → **Policies** to verify RLS policies are active

## Next Steps

After migrations are complete:
1. Test the database connection in your app
2. Create a test board and tasks
3. Verify RLS policies are working (users can only see their own data)

## Rollback

If you need to rollback (delete all tables):

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS columns CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
```

## Schema Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
boards (1:many)
    ↓
columns (1:many)
    ↓
tasks (1:many)
```

## Notes

- All tables use UUID for primary keys
- Cascade deletes: Deleting a board deletes all its columns and tasks
- RLS is enabled on all tables for security
- Timestamps are automatically managed
