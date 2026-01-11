# Release Process

This project automates versioning through **semantic-release**, which analyzes commit messages to determine version bumps and publish releases automatically.

## How It Works

The system uses **Conventional Commits** format to trigger different version changes:

- `fix:` triggers patch versions (1.0.0 → 1.0.1)
- `feat:` triggers minor versions (1.0.0 → 1.1.0)
- `BREAKING CHANGE:` or `!` triggers major versions (1.0.0 → 2.0.0)

Other prefixes (`chore:`, `docs:`, `test:`, `refactor:`) do not trigger releases.

## Commit Message Format

Messages follow this template:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:

```
fix: correct address validation

feat(wallet): add SPHINCS+ support

feat!: change signature format

feat: update API response structure

BREAKING CHANGE: response now returns object instead of array
```

## Workflow

1. Create feature branches with properly formatted commits
2. Submit pull requests to `main`
3. Upon merge, GitHub Actions automatically:
   - Analyzes commits since the last release
   - Calculates the appropriate version number
   - Updates `package.json` version
   - Generates changelog from commit messages
   - Builds and publishes to npm
   - Creates a Git tag and GitHub release

## Best Practices

- Write atomic commits (one logical change per commit)
- Use clear, imperative-mood subjects under 72 characters
- Include detailed explanations in commit bodies when needed
- Reference relevant issues in footers (e.g., `Fixes #123`)
- Use consistent scope labels like `(crypto)`, `(wallet)`, `(api)` for organization
