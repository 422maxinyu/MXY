---
name: github-publish-project
description: 'Use when asked to commit a workspace project and push it to GitHub, including configuring a GitHub remote, checking authentication, resolving push rejections safely, and verifying the published branch.'
---

# Publish a Project to GitHub

Use this workflow when the user explicitly asks to commit and push the current project to a GitHub repository.

## Procedure

1. Inspect the repository root, current branch, `git status --short --untracked-files=all`, recent commits, remotes, and the exact changes to be included.
2. Review tracked diffs and untracked files before staging. Do not include credentials, tokens, `.env` files, dependencies, caches, or unrelated generated content. Ask the user if it is unclear whether an existing change should be included.
3. Confirm the requested GitHub URL and target branch. Preserve existing remotes unless the user explicitly requests replacing one; add a separate remote when needed.
4. Check connectivity and authentication without exposing credentials. Prefer the configured SSH key; if SSH port 22 is unavailable, test GitHub SSH over port 443. HTTPS may be used when its credential helper is already configured. Never request, print, or store private keys or access tokens.
5. Stage only reviewed files, inspect the staged diff, and create a concise commit message describing the changes. Include the required co-author trailer when the environment specifies one.
6. Fetch or inspect the requested remote branch before pushing. If histories diverge or the push is rejected, stop and inspect the situation; do not force-push, reset, or rewrite history without explicit authorization.
7. Push the requested branch, then verify the remote commit and the local worktree status.

## Safety

- Never use `git push --force`, `git reset --hard`, or discard user changes without explicit permission.
- Do not change global Git configuration.
- Do not silently switch a repository's existing origin to another host.
- Report authentication, network, branch, or conflict blockers clearly instead of claiming a successful push.
