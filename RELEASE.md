# Release Process

This project automates versioning through **semantic-release**, which analyzes commit messages to determine version bumps and publish releases automatically.

## How It Works

The system uses **Conventional Commits** format to trigger different version changes:

- `fix:` triggers patch versions (1.0.0 → 1.0.1)
- `feat:` triggers minor versions (1.0.0 → 1.1.0)
- `BREAKING CHANGE:` or `!` triggers major versions (1.0.0 → 2.0.0)
- `chore(deps):` triggers patch versions — dependency bumps release by policy,
  see "Dependency bumps are releasable by policy" below

Other prefixes (`chore:`, `docs:`, `test:`, `refactor:`) do not trigger releases.
A run that finds no releasable commit still **succeeds** — see "Recovering a
missed release trigger".

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

## Publish ordering & failure semantics

`npm publish` runs **inside** semantic-release's publish phase
(`@semantic-release/exec` `publishCmd` → `scripts/release-publish.sh`),
which executes before `@semantic-release/github` creates the GitHub
release. Consequences:

- A GitHub release existing for a version means that version **is** on npm.
- If npm publish fails, semantic-release aborts: no GitHub release is
  created. The **git tag is still pushed** (semantic-release core tags
  before the publish phase), and semantic-release will not retry a version
  whose tag exists.

The publish is **tarball-based**: `release-publish.sh` builds, packs the
package once into `.release/tarballs/`, runs entrypoint/forbidden-path
tripwires on the archive, and publishes that exact file. The workflow then
uploads the same file as the `npm-tarball` artifact; the SBOM, checksum,
attestation, and SLSA-provenance jobs all derive their outputs from it (no
checkout, no rebuild), so the supply-chain documents describe the published
bytes by construction. A post-publish gate additionally asserts the
registry's advertised integrity (`npm view … dist.integrity`) equals the
sha-512 of the handed-off tarball, and the release job only starts after an
ancestry assertion against the commit the preflight job validated.

## Recovering an orphaned release

State: tag `vX.Y.Z` exists, npm does not serve `X.Y.Z` (the release job
failed at or after publish). Historical example: v6.2.0 was tagged and
GitHub-released but never reached npm under the old step ordering; it was
superseded by v6.2.1 rather than recovered.

Preferred recovery — **supersede, don't backfill**: land a trivial `fix:`
commit and let the pipeline cut the next patch version end-to-end. The
orphaned version number stays burned (semver ranges skip the gap
harmlessly). Never move or delete the existing tag.

Manual backfill (only if the exact version must exist, and you hold
publish rights on `@theqrl`): check out the tag, `npm ci && npm run build`,
verify `git status` is clean (committed `dist/` must match), then
`npm publish --access public`. A manual publish lacks the workflow's
provenance attestation — note that in the GitHub release. Verify with
`npm view @theqrl/wallet.js@X.Y.Z version`.

## Recovering a missed release trigger

State: a releasable change is merged to `main`, but no release was cut.
The Release workflow run **succeeds** in this case — semantic-release
analyses the commit window, finds nothing matching a rule in
`.releaserc.json`, and exits without publishing. A green run is therefore
not evidence that a release happened; confirm with `npm view
@theqrl/wallet.js version` or the tag list.

Historical example: `chore(deps): update @noble/hashes to 2.4.0 and
@theqrl/mldsa87 to 2.1.5` (0cde957, PR #118) shipped a crypto dependency
bump under a type that triggers nothing. 6.2.5 stayed current until the
release was recovered.

Re-running the workflow via `workflow_dispatch` does **not** help: the
same commits are re-analysed against the same rules, with the same
result. Rewording the commit does not help either once it is on `main` —
the branch is protected and public.

Recovery — **add a commit, never rewrite one**. semantic-release analyses
every commit since the last release tag, so one releasable commit
anywhere in that window releases everything already merged into it:

```bash
git commit --allow-empty -m "fix: <what the missed change actually did>"
```

An empty commit is legitimate here; it carries no diff because the change
is already on `main`. Its subject becomes the changelog entry, so write it
to describe the missed change, not the mistake.

Alternatively, if the missed commit's type *should* have been releasable
as a matter of policy, add the rule to `.releaserc.json` instead. Rules
apply retroactively — the next run re-analyses the open window under the
new configuration and picks the missed commit up, with no empty commit
needed. `chore(deps)` is wired this way (see below).

### Dependency bumps are releasable by policy

`chore(deps)` is a patch-release trigger, and is surfaced under a
`Dependencies` changelog heading rather than hidden with other chores.
This is deliberate: per SECURITY.md "Bundled Dependencies in the CJS
Artifact", the CJS build embeds compiled copies of `@theqrl/mldsa87` and
`@noble/hashes`, so CJS consumers receive upstream dependency fixes
**only** through a new wallet.js release, never transitively. A dependency
bump that merges without releasing silently withholds that fix.

Note that `presetConfig.types` replaces the preset's default type list
outright rather than merging into it, so the full list is enumerated in
`.releaserc.json`. The scoped `chore(deps)` entry must stay ahead of the
generic hidden `chore` entry — the first matching entry wins.
