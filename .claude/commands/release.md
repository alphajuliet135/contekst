# Release Guide

Use this when you are ready to cut a new release of Contekst.

---

## How releases work

Contekst uses **Release Please** for automated versioning and changelog generation.

The flow is:
1. Work on `develop` using conventional commits
2. Open a PR from `develop` → `main` and merge it
3. Release Please automatically opens a release PR that bumps `package.json` and updates `CHANGELOG.md`
4. Review and merge the Release Please PR
5. GitHub publishes the release, which triggers the Docker build workflow
6. A multi-arch Docker image (`amd64` + `arm64`) is pushed to GHCR tagged `:latest` and `:<version>`

---

## Pre-release checklist

Before opening the PR from `develop` → `main`:

- [ ] On the `develop` branch: `git branch --show-current`
- [ ] All commits since last release follow conventional commit format (see below)
- [ ] `develop` is up to date with remote: `git pull origin develop`
- [ ] App builds without errors: `npm run build`
- [ ] No `.env` secrets or local-only files are staged

---

## Conventional commit format

```
<type>(<optional scope>): <short description>
```

| Type | Version bump | Use for |
|------|-------------|---------|
| `feat:` | minor (0.x.0) | New user-facing feature |
| `fix:` | patch (0.0.x) | Bug fix |
| `feat!:` or `BREAKING CHANGE:` | major (x.0.0) | Breaking change |
| `perf:` | patch | Performance improvement |
| `chore:` | none | Deps, tooling, config |
| `refactor:` | none | Code restructure, no behaviour change |
| `ci:` | none | CI/CD workflow changes |
| `docs:` | none | Documentation only |
| `test:` | none | Adding or fixing tests |
| `build:` | none | Build system or Docker changes |
| `style:` | none | Formatting, whitespace |

**Examples:**
```
feat: add due date input to todos widget
fix: prevent session invalidation on container update
feat!: change API response shape for /api/contexts
chore: bump next to 16.3.0
ci: switch to Release Please for automated versioning
```

---

## Step-by-step release process

### 1. Check commits since last release

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

Ensure all commits are in conventional format. To fix the most recent commit:
```bash
git commit --amend -m "fix: correct description here"
```

### 2. Push `develop` to remote

```bash
git push origin develop
```

### 3. Open a PR from `develop` → `main`

```bash
gh pr create --base main --head develop --title "chore: merge develop into main" --body "Regular develop → main sync to trigger Release Please."
```

### 4. Merge the PR to `main`

After review, merge it. Release Please will open its release PR within seconds.

### 5. Review and merge the Release Please PR

The Release Please PR will bump `package.json` version and update `CHANGELOG.md`. Review the changelog entries look correct, then merge.

### 6. Watch the Docker build

```bash
gh run list --workflow=docker.yml --limit 5
```

Both `amd64` and `arm64` builds run in parallel and merge into a multi-arch manifest.

---

## Troubleshooting

**Release Please PR didn't appear after merging to `main`**
- Check the workflow: `gh run list --workflow=release.yml`
- Release Please only opens a release PR when there are `feat:` or `fix:` commits — `chore:`/`ci:`/`docs:` commits alone will not trigger one

**Docker build failed**
- Check: `gh run list --workflow=docker.yml --limit 3`
- The `arm64` runner can be slow; re-run individual failed jobs from the Actions UI if needed

**Wrong version bump**
- Release Please determines the bump from all commits since the last release tag
- Any `feat:` present will trigger a minor bump even if most commits are `fix:`
- To override, edit the version field directly in the Release Please PR before merging
