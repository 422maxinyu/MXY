---
name: git-commit-push
description: Use when the user asks to 提交项目 / commit the project / push to Gitee — commits all changes in this 高级网页设计 coursework repo and pushes them to https://gitee.com/M-axinyu/KEY. Handles git init, remote setup, non-fast-forward rejections, and credential prompt hangs.
---

# git-commit-push（提交并推送本项目）

本仓库是纯静态 HTML/CSS 课程练习，无构建、无依赖、无测试。提交流程因此非常简单，但有几个必须注意的点。

## 标准流程

在项目根目录（`D:\网页`）依次执行：

```powershell
git status --short
git add -A
git commit -m "<提交信息>"
git remote add origin https://gitee.com/M-axinyu/KEY   # 仅首次
git push -u origin main
```

- 提交信息用简体中文，概括本次改动，例如 `初始提交：高级网页设计课程练习`、`修复 5-1 外部样式表示例`。
- 不要 `git add .` 以外的花哨写法，也不要 `git commit -a`（跳过未跟踪文件）。

## 关键约束

- **首次初始化用 `git init -b main`**，分支名固定为 `main`（远程仓库为空，直接建 main）。
- **不要提交**：`node_modules/`、`.env`、任何令牌/密码、编辑器备份文件（`*.bak`、`~*`）。本项目当前无 `.gitignore`，若出现上述文件，先补 `.gitignore` 再提交。
- `AGENTS.md` 记录了作业硬约束（原生 HTML/CSS、无 CDN、`index.html` 为入口），提交前的改动不要违反这些约束；`index.html` 的 `.prompt-section` 引用必须逐字保留。
- 未询问用户前，不要 `git push --force`、不要 `git reset --hard`、不要改动全局 git 配置。

## 常见问题处理

**1. push 被拒绝（non-fast-forward）**

远程有本地没有的提交（或分支名不一致）：

```powershell
git fetch origin
git rebase origin/main
git push -u origin main
```

若 rebase 产生冲突，停下把冲突文件交给用户决定，不要自行强推。

**2. push 卡住等待输入用户名/密码**

Windows 上 `credential.helper=manager`，正常情况凭据已存在 Windows 凭据管理器里。若被交互式提示卡住：

```powershell
$env:GIT_TERMINAL_PROMPT='0'; git ls-remote https://gitee.com/M-axinyu/KEY
```

exit=0 且无输出 = 仓库可达且为空、凭据有效。若报 `could not read Username`，向用户索取 Gitee 用户名和**私人令牌（PASSWORD）**，不要猜、不要把令牌写进仓库。

**3. 验证推送成功**

```powershell
git status            # 应为 nothing to commit
git log --oneline -3
git ls-remote origin  # 应能看到 refs/heads/main
```

## 环境备注

- 平台 win32 / PowerShell 5.1：命令之间用 `; if ($?) { ... }` 连接，不要用 `&&`。
- 中文文件名在 GBK 控制台可能显示乱码，属正常，不影响 git 操作。
- 仓库无远程历史（首次推送），正常情况下一次 `push -u origin main` 即可完成。
