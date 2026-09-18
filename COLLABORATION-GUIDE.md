# Study Log CLI：两人协作、合并与发布版本指南

这份文档用于练习真实团队开发流程：

> 同事 A 和同事 B 各自开发一部分功能 → 分支 Push → GitHub Pull Request → Code Review → 合并到 main → 创建 Tag → 自动发布 Release。

本项目仓库：

`https://github.com/haijunlia/study-log-cli`

SSH 远程地址：

`git@github.com:haijunlia/study-log-cli.git`

以下命令均按 PowerShell 编写。代码块中的每一行单独执行，不要复制前面的 `PS C:\...>` 提示符。

---

## 1. 先理解几个角色

- `main`：稳定主分支，合并后的代码才进入这里。
- 功能分支：每个人自己的工作分支，例如 `feat/add-search`、`docs/improve-guide`。
- Commit：一次有明确目的的本地保存。
- Push：把本地分支和 Commit 上传到 GitHub。
- Pull Request（PR）：请求把一个分支的修改合并到另一个分支，通常是合并到 `main`。
- Tag：给某个 Commit 起版本名字，例如 `v0.3.0`。
- Release：GitHub 上对某个 Tag 的正式版本页面，可以附带安装包和更新说明。

核心原则：两个人不要直接同时修改并 Push `main`。每个人先使用自己的功能分支，再通过 PR 合并。

---

## 2. GitHub 仓库管理员的准备工作

如果仓库是你创建的，你需要先邀请同事。

### 2.1 邀请同事加入仓库

在 GitHub 打开仓库：

`Settings → Collaborators → Add people`

输入同事的 GitHub 用户名或邮箱，发送邀请。同事接受邀请后，通常就能克隆仓库、Push 自己的分支和创建 PR。

### 2.2 检查 Actions 权限

打开：

`Settings → Actions → General`

确认：

1. 允许 Actions 运行。
2. Workflow permissions 选择 `Read and write permissions`。
3. 保存设置。

本项目的 CI 工作流负责测试；Release 工作流需要 `contents: write` 权限来创建 GitHub Release。

### 2.3 分支保护建议

学习时可以暂不设置。熟悉流程后，建议保护 `main`，要求必须经过 PR、CI 和 Review 才能合并，并禁止直接 Push 到 `main`。

---

## 3. 每个人单独配置自己的 SSH

每个人都应该使用自己的 GitHub 账号和自己的 SSH 密钥。

### 3.1 检查 SSH 连接

```powershell
ssh -T git@github.com
```

如果看到下面的内容，说明 SSH 已经成功：

```text
Hi haijunlia! You've successfully authenticated, but GitHub does not provide shell access.
```

同事执行时，欢迎语应该显示同事自己的 GitHub 用户名。

如果密钥文件存在，也可以直接测试：

```powershell
Test-Path "$env:USERPROFILE\.ssh\id_ed25519"
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" -T git@github.com
```

### 3.2 没有密钥时创建

```powershell
ssh-keygen -t ed25519 -C "你的 GitHub 邮箱"
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
```

然后在 GitHub 打开：

`头像 → Settings → SSH and GPG keys → New SSH key`

只上传 `id_ed25519.pub` 公钥。`id_ed25519` 是私钥，只能留在自己的电脑上，绝对不能上传到 GitHub、发给同事或提交到项目。

---

## 4. 每个人克隆同一个项目

同事第一次下载项目时，在 PowerShell 执行：

```powershell
cd "你准备保存项目的父目录"
git clone git@github.com:haijunlia/study-log-cli.git
cd study-log-cli
git remote -v
npm ci
npm test
```

正确的远程地址应该是：

```text
origin  git@github.com:haijunlia/study-log-cli.git (fetch)
origin  git@github.com:haijunlia/study-log-cli.git (push)
```

如果本机已经有这个项目，不要再次 `git clone`，进入原来的项目目录即可。

---

## 5. 两个人分别创建自己的功能分支

开始工作前，先同步 `main`：

```powershell
git switch main
git pull origin main
git status
```

同事 A 创建功能分支：

```powershell
git switch -c feat/add-search
```

同事 B 创建文档或测试分支：

```powershell
git switch -c docs/improve-guide
```

检查当前分支：

```powershell
git branch --show-current
```

两个人应该看到不同的分支名称。不要在 `main` 上直接开发。

分支命名建议：

- 新功能：`feat/功能名`
- 修复问题：`fix/问题名`
- 文档：`docs/文档名`
- 测试：`test/测试名`

---

## 6. 各自修改、测试、提交和 Push

修改前先看状态：

```powershell
git status
git diff
```

运行项目检查：

```powershell
npm test
npm run pack:check
```

测试失败时先修复问题，不要把失败的代码提交给同事合并。

同事 A 修改源码和测试时：

```powershell
git add src test package.json package-lock.json
git diff --cached
git commit -m "feat: add study search"
git push -u origin feat/add-search
```

同事 B 修改文档时：

```powershell
git add README.md COLLABORATION-GUIDE.md
git diff --cached
git commit -m "docs: improve project guide"
git push -u origin docs/improve-guide
```

`git diff --cached` 是检查即将提交的内容。确认无误后再 Commit。`-u` 会建立本地分支和远程分支的跟踪关系，之后同一分支再次上传通常只需要 `git push`。

---

## 7. 在 GitHub 创建 Pull Request

Push 分支后，打开 GitHub 仓库页面，点击 `Compare & pull request`。

创建 PR 时检查：

1. `base repository` 是 `haijunlia/study-log-cli`。
2. `base branch` 是 `main`。
3. `compare branch` 是你自己的功能分支。
4. 标题说明这次改动，例如 `feat: add study search`。
5. 描述写清楚改了什么、如何测试、是否有注意事项。
6. 在 `Files changed` 中检查差异。
7. 点击 `Create pull request`。

PR 的方向很重要：目标是 `main`，来源是你的功能分支，不要选反。

一个好的 PR 描述可以写：

```text
## 改动
- 增加学习记录搜索功能
- 增加对应测试

## 验证
- npm test
- npm run pack:check
```

---

## 8. CI 检查和 Code Review

PR 创建后，GitHub Actions 会自动运行 `.github/workflows/ci.yml`。等待 CI 变成绿色，并等待同事 Review 通过。

如果 CI 失败：

1. 点击失败的检查并打开日志。
2. 找到第一个真正的错误。
3. 在本地修复并运行 `npm test`。
4. Commit 并 Push 到同一个功能分支。
5. PR 会自动更新，不需要重新创建。

如果 Review 要求修改：

```powershell
# 仍然在自己的功能分支上
git add .
git commit -m "fix: address review feedback"
git push
```

不要为了绕过检查直接合并失败的 PR。

---

## 9. 两个 PR 的推荐合并顺序

假设 A 的分支是 `feat/add-search`，B 的分支是 `docs/improve-guide`。

如果两个分支互不依赖，两个 PR 都可以指向 `main`，按 Review 完成顺序合并。

推荐顺序：

1. 先合并功能和测试已经通过的 PR。
2. 再合并另一个 PR。
3. 每合并一个 PR，都观察 CI 是否成功。
4. 最后由版本负责人在最新的 `main` 上创建 Tag。

如果 B 的代码依赖 A 的代码，先合并 A。A 合并后，B 必须同步最新的 `main`，解决冲突，再等待 CI 通过后合并 B。

合并 PR 后，GitHub 会把已合并的提交放入 `main`。PR 分支不会自动成为 `main`。

---

## 10. 第二个人如何同步最新 main

假设 A 已经先合并了 PR，B 的 PR 还没有合并。B 在自己的分支上执行：

```powershell
git switch docs/improve-guide
git fetch origin
git merge origin/main
```

如果没有冲突，运行：

```powershell
npm test
git push
```

初学时建议使用 `merge`，因为更容易理解。同步前必须确认当前在自己的功能分支。

---

## 11. 合并冲突怎么处理

冲突通常发生在两个人修改了同一个文件的同一段内容。

执行合并后：

```powershell
git status
```

冲突文件中通常会看到下面这样的区块。示例中的每行前面故意增加了两个空格，避免本指南被 Git 误判为尚未解决的冲突：

```text
  <<<<<<< HEAD
你的分支内容
  =======
main 分支内容
  >>>>>>> origin/main
```

处理步骤：

1. 保留正确内容，删除冲突标记。
2. 保存文件。
3. 运行测试。
4. 标记冲突已解决并上传：

```powershell
git add 冲突文件名
git commit -m "merge: resolve main branch conflict"
git push
```

如果还没有判断清楚应该保留哪一部分，不要随意删除，先和同事确认。

如果想取消这次尚未完成的合并：

```powershell
git merge --abort
```

---

## 12. PR 全部合并后准备新版本

版本负责人先同步最新 `main`：

```powershell
git switch main
git pull origin main
git status
```

更新版本相关文件：

- `package.json` 中的 version。
- `package-lock.json` 中的 version。
- `CHANGELOG.md` 中的新版本说明。

例如从 `0.2.0` 发布到 `0.3.0`，版本号必须统一为 `0.3.0`。

运行检查：

```powershell
npm test
npm run pack:check
git status
```

确认生成的安装包名字类似 `study-log-cli-0.3.0.tgz`。

提交版本变更：

```powershell
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: prepare release v0.3.0"
git push origin main
```

注意：版本 Commit 必须先 Push 到 `main`，再创建 Tag。

---

## 13. 创建 Tag 并发布 v0.3.0

确认版本 Commit 已经进入 `main` 后执行：

```powershell
git switch main
git pull origin main
git tag -a v0.3.0 -m "Release v0.3.0"
git show v0.3.0 --stat
git push origin v0.3.0
```

推送 Tag 后，GitHub Actions 会自动运行 Release 工作流：

1. Checkout 代码。
2. 安装 Node.js 和依赖。
3. 运行 `npm test`。
4. 生成 `dist/study-log-cli-0.3.0.tgz`。
5. 创建 `v0.3.0` Release。
6. 上传 `study-log-cli-0.3.0.tgz` 附件。

---

## 14. 在 GitHub 检查新 Release

打开仓库的 `Actions` 页面：

1. 找到 `Release` 工作流。
2. 打开本次 v0.3.0 运行记录。
3. 确认 `Verify tests`、`Build package` 和 `Create GitHub Release` 都成功。

再打开仓库首页的 `Releases` 页面，检查：

- 是否有 `v0.3.0`。
- Tag 是否指向最新合并后的 Commit。
- Release Notes 是否生成。
- 是否有 `study-log-cli-0.3.0.tgz` 附件。

如果 Actions 成功但 Releases 没有更新，先检查是否打开了正确的仓库和 Tag，并确认 Release 工作流最后一步成功。

---

## 15. 把本指南本身上传到 GitHub

本文件和 README 的入口属于文档修改，也应该通过一次正常的 Commit 上传。

直接合并到 main 的练习方式：

```powershell
cd "C:\Users\EDY\.codex\visualizations\2026\09\18\01a0b25d-ab86-7083-9a52-92862d1f13a8\study-log-cli"
git switch main
git pull origin main
git status
git add COLLABORATION-GUIDE.md README.md
git diff --cached
git commit -m "docs: add team collaboration guide"
git push origin main
```

如果想练习 PR，推荐使用下面流程：

```powershell
git switch main
git pull origin main
git switch -c docs/add-collaboration-guide
git add COLLABORATION-GUIDE.md README.md
git commit -m "docs: add team collaboration guide"
git push -u origin docs/add-collaboration-guide
```

然后在 GitHub 创建 PR，目标分支选择 `main`，等待 CI 通过后合并。

---

## 16. 一页速查

同事 A：

```powershell
git switch main
git pull origin main
git switch -c feat/my-part
# 修改代码
npm test
git add .
git commit -m "feat: finish my part"
git push -u origin feat/my-part
```

同事 B：

```powershell
git switch main
git pull origin main
git switch -c feat/my-other-part
# 修改代码
npm test
git add .
git commit -m "feat: finish my other part"
git push -u origin feat/my-other-part
```

GitHub：

```text
A 分支 → PR → CI → Review → 合并到 main
B 分支 → PR → CI → Review → 合并到 main
```

版本负责人：

```powershell
git switch main
git pull origin main
# 更新 package.json、package-lock.json、CHANGELOG.md
npm test
npm run pack:check
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: prepare release v0.3.0"
git push origin main
git tag -a v0.3.0 -m "Release v0.3.0"
git push origin v0.3.0
```

最后在 GitHub 的 Actions 和 Releases 页面检查结果。

---

## 17. 常见问题

### 为什么不能两个人都直接 Push main？

因为后 Push 的人可能遇到冲突，也无法让同事先 Review。功能分支和 PR 能让每次修改独立、可检查、可回退。

### PR 合并后，为什么我的本地 main 没变化？

GitHub 上的合并不会自动改变本地文件，需要执行：

```powershell
git switch main
git pull origin main
```

### 为什么第二个 PR 显示冲突？

通常是两个人修改了同一个文件的同一部分。先在第二个人的功能分支执行：

```powershell
git fetch origin
git merge origin/main
```

解决冲突、测试、Commit、Push，PR 会更新。

### Tag 和 Release 有什么区别？

Tag 是 Git 中指向某个 Commit 的版本标记；Release 是 GitHub 网页上的版本展示和附件。这个项目通过 Push Tag 触发 Actions，再自动创建 Release。

### v0.2.0 已经有 Tag，还能重新发布吗？

同一个 Tag 不建议重复 Push。若旧 Tag 的 Release 工作流失败，可以在 GitHub Releases 页面基于已有 Tag 手动创建 Release。以后修复工作流后使用新的版本号，例如 `v0.3.0`。

### 远程地址为什么不能带方括号？

`[https://...]` 是 Markdown 链接显示格式，不是 Git 远程地址。PowerShell 中使用纯 SSH 地址：

`git@github.com:haijunlia/study-log-cli.git`

完成一次协作练习后，建议保留合并后的 PR 页面、Actions 的 CI 和 Release 运行记录、Releases 页面中的版本和附件，以及本地 `git log --oneline --graph --all` 输出。

这些内容能帮助你理解“分支 → PR → main → Tag → Release”的完整链路。
