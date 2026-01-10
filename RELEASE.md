# Release Process

Release instructions for `@theqrl/wallet.js`.

## Pre-requisites

- [ ] Ensure the working tree is clean (`git status`)
- [ ] Run tests: `npm test`
- [ ] Run lint checks: `npm run lint-check`
- [ ] Verify build: `npm run build`
- [ ] Confirm npm auth: `npm whoami`

## Version bump

Update the version in `package.json`:

```bash
npm version <patch|minor|major> --no-git-tag-version
```

Or edit `package.json` manually.

## Build

```bash
npm run build
```

This runs Rollup to generate dual ESM/CJS bundles in `dist/`.

## Verify package contents (optional)

```bash
npm pack --dry-run
```

Ensure only `dist/`, `src/`, and `types/` are included.

## Publish

```bash
npm publish --access public
```

The `prepublishOnly` script will run the build automatically if needed.

## Post-publish

1. Commit the version bump:
   ```bash
   git add package.json
   git commit -m "Release v<VERSION>"
   ```

2. Tag the release:
   ```bash
   git tag v<VERSION>
   git push origin main --tags
   ```

3. Create a GitHub release (optional):
   - Go to Releases > Draft a new release
   - Select the tag
   - Add release notes

## Dry run (full simulation)

To test the entire publish flow without actually publishing:

```bash
npm publish --dry-run --access public
```
