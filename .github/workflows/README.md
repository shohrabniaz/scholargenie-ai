# CI/CD

## CI (always runs)

On every push and pull request to `master` / `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

## CD (production deploy)

After CI passes on a push to `master` / `main`, the **Deploy to Vercel** job runs only when:

1. Repository variable `VERCEL_DEPLOY_ENABLED` is set to `true`  
   (**Settings → Secrets and variables → Actions → Variables**)
2. These secrets are configured:

| Secret | How to get it |
|--------|----------------|
| `VERCEL_TOKEN` | [Vercel account tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` (after `npx vercel link`) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

If `VERCEL_DEPLOY_ENABLED` is not set, CI still runs on every push/PR and **deploy is skipped** (green build). Vercel’s Git integration can still deploy from GitHub pushes.
