# Contributing

Thanks for your interest in contributing!

## Development Setup

```bash
cd mcp
npm install
npm test          # Run tests
npx tsc --noEmit  # Type-check
npm run dev       # Run with tsx
```

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with [Release Please](https://github.com/googleapis/release-please) for automated releases.

```
feat: add new feature        → minor version bump
fix: fix a bug               → patch version bump
feat!: breaking change       → major version bump (post-1.0)
chore: maintenance tasks     → no release
docs: documentation only     → no release
```

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass and types check
4. Use conventional commit messages
5. Open a PR against `main`

## Adding a New Tool

1. Create `mcp/src/tools/<name>.ts` with the tool function
2. Create `mcp/src/tools/<name>.test.ts` with tests
3. Register the tool in `mcp/src/tools/index.ts`
4. Update `skill/SKILL.md` with usage documentation
