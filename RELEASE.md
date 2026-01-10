# Release Process

Releases are automated via [semantic-release](https://github.com/semantic-release/semantic-release).

## How It Works

1. Commits to `main` trigger the release workflow
2. semantic-release analyzes commit messages to determine version bump
3. If releasable commits exist, it:
   - Bumps version in `package.json`
   - Generates/updates `CHANGELOG.md`
   - Builds the package
   - Publishes to npm
   - Creates GitHub release with release notes
   - Commits version bump back to repo

## Commit Message Format

Releases are triggered by [Conventional Commits](https://www.conventionalcommits.org/):

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `fix:` | Patch (0.0.x) | `fix: correct address validation` |
| `feat:` | Minor (0.x.0) | `feat: add SPHINCS+ wallet support` |
| `feat!:` or `BREAKING CHANGE:` | Major (x.0.0) | `feat!: change signature format` |

Other prefixes (`chore:`, `docs:`, `test:`, `refactor:`) do not trigger releases.

## Manual Release (Emergency)

If automated release fails, you can release manually:

```bash
# Ensure clean working tree
git status

# Run tests and lint
npm test
npm run lint-check

# Build
npm run build

# Verify package contents
npm pack --dry-run

# Publish (requires npm auth)
npm publish --access public

# Tag and push
git tag v<VERSION>
git push origin main --tags
```

## Trusted Publishing (OIDC)

This repo uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) with OIDC for secure, tokenless publishing.

**Setup on npmjs.com:**
1. Go to package settings → Trusted Publishers
2. Add GitHub Actions publisher:
   - Organization: `theQRL`
   - Repository: `wallet.js`
   - Workflow: `test.yml`
   - Environment: `npm-publish`

**Benefits:**
- No long-lived NPM_TOKEN to manage/rotate/leak
- Short-lived, workflow-specific OIDC credentials
- Automatic provenance attestations
- Cryptographic trust chain

**GitHub Environment:**
Create an environment called `npm-publish` in repository settings (Settings → Environments).

## Required Secrets

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (no manual setup)

## Configuration

- `.releaserc.json` - semantic-release configuration
- Workflow: `.github/workflows/test.yml` (release job)
