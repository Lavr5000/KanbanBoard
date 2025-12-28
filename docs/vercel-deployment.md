# Vercel Deployment Guide

## 🚀 Automatic Deployment Setup

This project is configured for automatic deployment on Vercel with GitHub Integration.

---

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project with API keys

---

## Step 1: Connect GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select: `Lavr5000/0-KanBanDoska`
5. Click **"Import"**

---

## Step 2: Configure Project

### Framework Preset
- **Framework**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Environment Variables

Add these in **Settings > Environment Variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |

**Get your Supabase credentials:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings > API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3: Deploy

After clicking **"Deploy"**:

1. Vercel will install dependencies
2. Build the Next.js application
3. Deploy to production
4. Provide a URL like: `https://kanban-board.vercel.app`

---

## Automatic Deployments

After setup, deployments are **automatic**:

| Trigger | Action |
|---------|--------|
| Push to `main` | Production deployment |
| Push to other branches | Preview deployment |
| Pull Request | Preview deployment |

---

## Custom Domain (Optional)

1. Go to **Settings > Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `kanban.yourdomain.com`)
4. Configure DNS records as instructed

---

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Supabase URL and keys are valid
- Check build logs in Vercel dashboard

### Supabase Connection Issues
- Verify RLS policies are set up correctly
- Check Supabase project is active
- Ensure anon key has correct permissions

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Re-deploy after changing variables

---

## Current Deployment Status

| Branch | Status | URL |
|--------|--------|-----|
| `main` | Production | TBD - Set up in Vercel |
| `claude/fix-phase-3-bugs-auto-jJadF` | Merged | - |

---

## Notes

- **vercel.json** configuration is included in the repo
- Environment variables must be added manually in Vercel dashboard
- Preview deployments are automatically created for PRs
- Deployments are incremental (only changed files are uploaded)
