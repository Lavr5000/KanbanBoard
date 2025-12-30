# Cloudflare Pages Deployment Checklist

This checklist helps verify code is ready for Cloudflare Pages deployment before pushing to GitHub.

## Pre-Push Validation (REQUIRED)

**Always run before pushing changes:**

```bash
npm run validate:cloudflare
```

This command:
1. Runs `next build` - validates Next.js builds correctly
2. Runs `@opennextjs/cloudflare build` - generates `.open-next` bundle

If either step fails, **do not push** to GitHub.

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

## Cloudflare Pages Build Settings

In Cloudflare Pages → Settings → Builds and deployments:

- **Framework preset**: Next.js
- **Build command**: `npm run validate:cloudflare`
- **Build output directory**: `.open-next/assets`
- **Node.js version**: `22`

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
| `npm run validate:cloudflare` | Full build validation (run before push) |
| `npm run build` | Next.js production build |
| `npm run build:cloudflare` | OpenNext Cloudflare bundle |
| `rm -rf .next .open-next` | Clean build artifacts |
