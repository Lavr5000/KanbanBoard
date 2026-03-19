# 🔒 Security Setup Guide

## Critical Security Information

**IMPORTANT:** This project uses Cloudflare Workers for deployment. API keys and secrets are NOT stored in the repository.

## ⚠️ What Changed (Security Fix)

We've removed all sensitive API keys from the repository and moved them to Cloudflare Secrets.

### Before (INSECURE ❌):
- API keys were in `wrangler.toml`
- Anyone with repo access could see them
- Keys were committed to git history

### After (SECURE ✅):
- API keys are in Cloudflare Dashboard
- `wrangler.toml` contains only public variables
- Secrets are encrypted and never committed

---

## 📋 Required Secrets

You need to set these secrets in Cloudflare Dashboard:

1. **DEEPSEEK_API_KEY** - Your DeepSeek API key
2. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key
3. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key

---

## 🚀 How to Setup Secrets

### Option 1: Cloudflare Dashboard (Recommended for Production)

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **kanban-board-peach-three** → **Settings** → **Variables and Secrets**
3. Click **"Add variable"** for each secret:
   - Name: `DEEPSEEK_API_KEY` → Value: `your-actual-key`
   - Name: `SUPABASE_SERVICE_ROLE_KEY` → Value: `your-actual-key`
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: `your-actual-key`
4. Click **"Encrypt"** button (🔒) for secrets
5. Click **"Save"**

### Option 2: Using Wrangler CLI (Recommended for Local Testing)

```bash
# Install wrangler if not installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 💻 Local Development

For local development, create a `.dev.vars` file:

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars and add your actual keys
```

**⚠️ WARNING:** `.dev.vars` is in `.gitignore` and will NEVER be committed to git.

### Example `.dev.vars`:

```env
DEEPSEEK_API_KEY=sk-your-actual-deepseek-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ-your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ-your-actual-service-role-key
```

---

## 🔄 Deployment Process

### Automatic Deployment (GitHub Actions)

When you push to `main` branch:
1. GitHub Actions workflow runs automatically
2. Uses secrets from Cloudflare Dashboard
3. Deploys to Cloudflare Workers

**No secrets needed in repository!**

### Manual Deployment

```bash
# Build
npm run build

# Deploy (wrangler will use secrets from Cloudflare)
npm run deploy:cloudflare
```

---

## 🛡️ Security Best Practices

### 1. Rotate Compromised Keys

Since the old keys were in the repository, you should:

1. **Revoke DeepSeek API key** → Generate new one at https://platform.deepseek.com/
2. **Regenerate Supabase keys** → Supabase Dashboard → Settings → API
3. **Update Cloudflare Secrets** → Add new keys
4. **Test thoroughly** → Verify everything works

### 2. Never Commit Secrets

- ✅ DO: Use Cloudflare Secrets
- ✅ DO: Use `.dev.vars` for local development
- ❌ DON'T: Commit API keys to git
- ❌ DON'T: Share screenshots with secrets visible

### 3. Regular Audits

```bash
# Check for secrets in git history
git log --all --full-history --source -- "*secret*"

# Check current files
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
```

---

## 📝 Public Variables (Safe to Commit)

These are in `wrangler.toml` and are public:

```toml
NEXT_PUBLIC_SUPABASE_URL = "https://ygxnblhpjdhqjgcmcxgu.supabase.co"
```

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser, but this is safe (it's just the URL).

---

## 🚨 Emergency: If Secrets Are Leaked

1. Immediately revoke all API keys
2. Generate new keys
3. Update Cloudflare Secrets
4. Rotate all credentials
5. Review access logs

---

## ✅ Verification

After setup, verify everything works:

```bash
# Run locally with .dev.vars
npm run dev

# Deploy to production
npm run deploy:cloudflare

# Check deployment
curl https://your-worker-url.workers.dev
```

---

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler Secrets Documentation](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/commands/#secret)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)

---

## 🎯 Summary

| What | Where | Who Can See |
|------|-------|-------------|
| **Secrets** | Cloudflare Dashboard (encrypted) | Only you |
| **Public vars** | `wrangler.toml` (committed) | Everyone (safe) |
| **Local dev** | `.dev.vars` (not committed) | Only you |

**Remember:** Never commit secrets to git! Use Cloudflare Secrets. 🔒
