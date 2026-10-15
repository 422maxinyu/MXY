# AGENTS.md

## What this repo is

Static, no-toolchain HTML/CSS coursework: 马欣宇's《高级网页设计》classroom exercises (folder name `网页`, Windows, Chinese-language content).

- **No build, no package manager, no test runner, no linter, no git, no CI.** There is nothing to install or compile — do not add tooling, `package.json`, CDNs, or frameworks unless explicitly asked.
- Open pages directly in a browser (`file://`) or serve the folder with any static server. Relative paths are used everywhere.

## Hard constraints (from the assignment text in `index.html`)

- 原生代码（原生 HTML + CSS），**不使用 CDN**。Only `2-2.html` has external links (exercise hyperlinks), which is intentional.
- `index.html` is the required entry point and must contain the assignment prompt verbatim inside its `.prompt-section` blockquote.

## Structure

- `index.html` — hub page. Its `.work-grid` nav lists every exercise page; **the header claims "13 pages", so adding or renaming an exercise page means updating both the nav cards and that count.** Currently linked: `1, 2, 2-2, 3, 4, 5-1, 5-2, 6-1, 6-2, 7-1, 7-2, 8-1, 9-1`.
- **Unlinked pages exist**: `10-1-animation.html`, `10-2.html`, `10-3.html`, `10-4.html`, `page1.html` (a 小米商城 clone). Do not assume every `*.html` in the root is reachable from the index; do not delete them.
- Numbered names map to class sessions (`N.html`, `N-M.html`). Keep that naming for new exercise pages.
- `css.css` — tiny shared stylesheet, **only referenced by `5-1.html`** (it is the 层叠/外部样式表 lesson). Every other page uses an inline `<style>` block. Do not "consolidate" styles into `css.css`; inline styles are part of the lesson.
- `img/` — local assets (`1.jpg`–`5.jpg`, `b*/c*/m*` sets, `neu.png`, `ic_launcher_background.png`). Referenced as `./img/...`. Keep image references relative.

## Conventions

- `<html lang="zh-CN">`, `charset UTF-8`, viewport meta on every page. Body copy is Simplified Chinese; keep it consistent when editing.
- Design tokens for `index.html` live in `:root` custom properties (`--ink`, `--paper`, `--coral`, `--teal`, `--gold`, ...). Reuse them instead of hardcoding colors on that page.
- `index.html` has a single `@media (max-width: 760px)` block covering its responsive behavior; edit inside it rather than adding parallel breakpoints.
- Card numbering in `index.html` (`01 / HTML`, `02 / CSS`, ...) is positional — `.work-card:nth-child(n)` styling depends on DOM order, so inserting a card mid-grid shifts colors.

## Verify manually

There is no automated check. After editing, open the touched page and `index.html` in a browser and confirm: images resolve, links navigate, and mobile width (~760px) still lays out correctly.
