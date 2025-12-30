# Cloudflare Deployment Guide

This guide explains how to deploy the Next.js application to Cloudflare using OpenNext adapter.

## Deployment Method: Wrangler CLI

This project uses **Wrangler CLI** for deployment (NOT GitHub integration).

### Why Wrangler instead of Git-based deployment?

OpenNext generates a bundle that works with Cloudflare Workers. Git-based deployment in Cloudflare Pages doesn't properly support the Worker-based routing that OpenNext uses. Wrangler CLI deploys the correct bundle structure.

### Pre-Deployment Checklist

**Always run before deploying:**

```bash
npm run validate:cloudflare
```

This command:
1. Runs `next build` - validates Next.js builds correctly
2. Runs `@opennextjs/cloudflare build` - generates `.open-next` bundle

If either step fails, **do not deploy**.

### Deploying to Cloudflare

**One-command deployment:**

```bash
npm run deploy:cloudflare
```

This builds and deploys to Cloudflare Pages in one step.

**Manual deployment (if needed):**

```bash
# 1. Build
npm run validate:cloudflare

# 2. Deploy
npx wrangler pages deploy .open-next --project-name=lavr-ai-kanban-doska
```

### First-Time Setup

1. **Authenticate Wrangler:**
```bash
npx wrangler login
```

2. **Set environment variables** in Cloudflare Dashboard:
   - Go to: Cloudflare Pages → lavr-ai-kanban-doska → Settings → Environment variables
   - Add: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPSEEK_API_KEY`

## Code Checks

- [ ] **No edge runtime in API routes** - OpenNext doesn't support `export const runtime = 'edge'`
  - Check: `grep -r "runtime = 'edge'" src/app/api/`
  - Fix: Remove the runtime export from affected routes

- [ ] **OpenNext config exists** - `open-next.config.ts` must be present
  - Check: `ls open-next.config.ts`
  - Fix: Commit the config file

- [ ] **Worker file exists** - `_worker.js` must exist in project root
  - Check: `ls _worker.js`
  - Fix: Commit the worker file

- [ ] **TypeScript compiles** - No type errors
  - Check: `npx tsc --noEmit`
  - Fix: Resolve type errors before pushing

## Environment Variables (Cloudflare Dashboard)

Set these in Cloudflare Pages → Settings → Environment variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DEEPSEEK_API_KEY`

## Common Issues

### "edge runtime cannot be used"
**Error**: `app/api/xxx/route cannot use the edge runtime`

**Solution**: Remove `export const runtime = 'edge'` from the API route.

### "Missing open-next.config.ts"
**Error**: `Missing required open-next.config.ts file`

**Solution**: Ensure `open-next.config.ts` is committed to git.

### "Module has no exported member 'defineConfig'"
**Error**: `Type error: Module '"@opennextjs/cloudflare"' has no exported member 'defineConfig'`

**Solution**: Use plain object export in `open-next.config.ts`:
```ts
export default {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      // ...
    },
  },
  // ...
};
```

### "Cannot find module middleware-manifest.json"
**Error**: Build errors after changing config

**Solution**: Delete `.next` folder and rebuild:
```bash
rm -rf .next && npm run validate:cloudflare
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run validate:cloudflare` | Full build validation (run before deploy) |
| `npm run deploy:cloudflare` | Build and deploy to Cloudflare |
| `npm run build` | Next.js production build |
| `npm run build:cloudflare` | OpenNext Cloudflare bundle only |
| `npx wrangler login` | Authenticate with Cloudflare |
| `rm -rf .next .open-next` | Clean build artifacts |
