# Push Bar Ops v0.15.3 to GitHub

This package keeps `public/sw.js` and is intended to be pushed with normal Git rather than a file-by-file GitHub REST API uploader.

## GitHub Desktop

1. Clone the target repository in GitHub Desktop.
2. Copy the contents of this folder into the cloned repository folder.
3. In GitHub Desktop, review the changed files.
4. Commit once with: `Release Bar Ops v0.15.3`.
5. Click **Push origin** once.

Do not repeatedly retry while GitHub reports a secondary rate limit.

## Command line

For an existing repository:

```bash
git clone git@github.com:YOUR_ACCOUNT/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY

# Copy this package's contents into the repository, then:
git add -A
git commit -m "Release Bar Ops v0.15.3"
git push
```

For a new empty repository:

```bash
git init
git add -A
git commit -m "Release Bar Ops v0.15.3"
git branch -M main
git remote add origin git@github.com:YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

## Important

- `public/sw.js` is intentionally included.
- `public/offline.html` is intentionally absent.
- `vercel.json` is intentionally absent because Vercel detects Next.js automatically.
- Never commit `node_modules`, `.next`, local `.env` files, local databases, or deployment caches.
