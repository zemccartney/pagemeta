---
name: commit
description: Create a conventional commit following project standards
disable-model-invocation: false
allowed-tools: Bash(git:*), Read, Grep
argument-hint: "[optional message hint]"
---

# Conventional Commit Skill

Create commits following the conventional commit specification for this project.

## Workflow

1. **Review changes** - Run `git status` (without `-uall`) and `git diff` to understand staged and unstaged changes
2. **Check recent commits** - Run `git log --oneline -10` to see the project's commit style
3. **Stage files** - Add relevant files by name (avoid `git add -A` or `git add .` to prevent accidentally staging sensitive files like `.env`)
4. **Construct commit message** - Follow conventional commit format
5. **Commit** - Use `git commit -m` with a HEREDOC for proper formatting
6. **Verify** - Run `git status` to confirm the commit succeeded

## Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Conventional Commit Types

| Type | Use for |
|------|---------|
| `feat` | New features |
| `fix` | Bug fixes |
| `test` | Test additions or changes |
| `chore` | Dependencies, build config, maintenance |
| `docs` | Documentation only |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration |
| `style` | Formatting, whitespace (no code change) |

## Message Guidelines

- **Imperative mood**: "add feature" not "added feature" or "adds feature"
- **No period** at end of subject line
- **Under 100 characters** for subject line
- **Include scope** when changes are localized (e.g., `feat(middleware): add caching`)
- **Add body** for complex changes that need explanation

## Important Notes

- This project uses lefthook with commitlint on the `commit-msg` hook - your message will be validated
- Bypass the interactive commitizen by using `git commit -m` directly
- Never skip hooks (`--no-verify`) unless explicitly requested
- Never amend previous commits unless explicitly requested
- Always use HEREDOC format for commit messages:

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line

Optional body explaining the change.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Examples from This Project

Recent commits follow this style:
- `chore: bump deps`
- `test: improve virtual imports with aik-mod`
- `test: expand basic tests, complicated metadata and overriding behavior`

Note: Scopes are optional in this project and used sparingly.
