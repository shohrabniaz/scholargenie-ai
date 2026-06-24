# CI/CD

## CI (always runs)

On every push and pull request to `master` / `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

## CD (production deploy)

After CI passes on a push to `master` / `main`, the **Deploy to Vercel** job runs when these GitHub repository secrets are set:

| Secret | How to get it |
|--------|----------------|
| `VERCEL_TOKEN` | [Vercel account tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `npx vercel link` then read `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

Add secrets under **GitHub → Settings → Secrets and variables → Actions**.

If secrets are not configured, CI still runs and Vercel’s Git integration can deploy from the push instead.
