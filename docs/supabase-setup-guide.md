# Supabase Setup Guide - Task 1.1

**Task:** Create Supabase project
**Date:** 2025-12-26
**Status:** Manual setup required

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up / Login to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Sign in with GitHub (recommended) or email

### 1.2 Create New Project

1. Click "New Project" button
2. Fill in project details:
   - **Name:** `kanban-board-2` (or your preferred name)
   - **Database Password:** Generate a strong password (save it securely!)
   - **Region:** Choose closest to your users (e.g., `eu-central-1` for Europe)
   - **Plan:** Free tier is sufficient for development

3. Click "Create new project"
4. Wait 2-3 minutes for project initialization

---

## Step 2: Get API Credentials

After project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:

### Required Environment Variables

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key (safe to use in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (keep secret! server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Save Credentials to `.env.local`

1. In your project root, create `.env.local` file (already in .gitignore)
2. Paste the credentials you copied
3. **NEVER commit this file to git!**

Example `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## Step 4: Verify Setup

After completing the manual steps above:

1. Confirm you have:
   - ✅ Supabase project created
   - ✅ Project URL saved
   - ✅ Anon key saved
   - ✅ Service role key saved
   - ✅ `.env.local` file created with all 3 variables

2. **Tell the AI agent:** "I've created the Supabase project and added credentials to .env.local"

3. The agent will then continue with:
   - Task 1.3: Installing dependencies
   - Task 1.4: Creating client files
   - Task 1.5: Database migrations
   - etc.

---

## Security Notes

⚠️ **IMPORTANT:**
- **ANON KEY:** Safe for browser (public), has limited permissions via RLS
- **SERVICE ROLE KEY:** Has admin access, ONLY use server-side, NEVER expose in client code
- **Database Password:** Keep secure, needed for direct database access

---

## Troubleshooting

### Project won't create
- Try different region
- Check your internet connection
- Wait a few minutes and try again

### Can't find API keys
- Project Settings → API section
- Keys are shown under "Project API keys"

### Lost database password
- Project Settings → Database → Reset database password

---

## Next Steps

After manual setup is complete, the agent will:
1. Install `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`
2. Create Supabase client files (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
3. Create database schema with SQL migrations
4. Configure Row Level Security policies
5. Create query functions

---

**Reference:** [Supabase Documentation](https://supabase.com/docs)
**Project Dashboard:** Will be at `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
