# Study Log CLI：SSH 上传与版本发布手册

这份手册专门为 PowerShell 和 GitHub SSH 上传编写。请复制代码块中的命令，一行一行执行。

不要复制 PowerShell 提示符，例如：

```text
PS C:\Users\EDY>
```

也不要把 GitHub 页面上的 Markdown 链接，例如 [文字](地址)，复制进 PowerShell。远程地址必须是代码块中的纯 SSH 地址。

---

## 1. 先确认项目目录

项目目录：

```text
C:\Users\EDY\.codex\visualizations\2026\09\18\01a0b25d-ab86-7083-9a52-92862d1f13a8\study-log-cli
```

每次打开 PowerShell 后，先执行：

```powershell
cd "C:\Users\EDY\.codex\visualizations\2026\09\18\01a0b25d-ab86-7083-9a52-92862d1f13a8\study-log-cli"
Get-Location
Get-ChildItem -Force
```

正确结果必须以 study-log-cli 结尾，并且能看到 package.json、src、test 和 README.md。

如果提示符是 PS C:\Users\EDY>，说明还没有进入项目目录。此时不要执行 git init 或 git add .。

---

## 2. 处理 Codex 创建目录的 Git 安全检查

因为项目文件由 Codex 创建，Windows 文件所有者可能和你的 PowerShell 用户不同。第一次使用这个目录时，先执行：

```powershell
git config --global --add safe.directory "C:/Users/EDY/.codex/visualizations/2026/09/18/01a0b25d-ab86-7083-9a52-92862d1f13a8/study-log-cli"
```

这条命令只信任这个项目目录，不要使用 safe.directory "*"。

---

## 3. 检查 SSH

执行：

```powershell
ssh -T git@github.com
```

如果看到：

```text
Hi haijunlia! You've successfully authenticated, but GitHub does not provide shell access.
```

说明 SSH 已经成功，不需要启动 ssh-agent。

如果看到 key 找不到，检查密钥：

```powershell
Test-Path "$env:USERPROFILE\.ssh\id_ed25519"
```

如果返回 True，可以直接测试：

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" -T git@github.com
```

如果返回 False，创建密钥：

```powershell
ssh-keygen -t ed25519 -C "3491210165@qq.com"
```

然后复制公钥：

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
```

在 GitHub 的 Settings → SSH and GPG keys → New SSH key 中粘贴并保存。

---

## 4. 创建 GitHub 空仓库

在 GitHub 创建一个新仓库，名称必须是：

```text
study-log-cli
```

创建时不要自动添加 README、.gitignore 或 License，因为这些文件已经在本地项目中。

---

## 4.1 GitHub 网页端配合清单

本地命令和 GitHub 网页需要配合完成，不能只做其中一边。

### A. 创建仓库

创建仓库时检查：

- Repository name：study-log-cli
- 选择 Public 或 Private
- 不要自动添加 README
- 不要自动添加 .gitignore
- 不要自动添加 License

创建后，进入 Code 页面，确认 SSH 地址：

```text
git@github.com:haijunlia/study-log-cli.git
```

不要复制网页地址栏里的 Markdown 格式，也不要把带方括号和圆括号的文字粘贴进 PowerShell。

### B. 添加 SSH 公钥

SSH 公钥在 GitHub 账号设置中添加：

头像 → Settings → SSH and GPG keys → New SSH key

Title 可以写：

```text
EDY Windows
```

Key type 选择 Authentication Key。Key 输入本机文件 id_ed25519.pub 的全部内容。

只上传 .pub 公钥。不要上传 id_ed25519 私钥，也不要把私钥放进项目目录。

### C. 检查仓库 Actions 设置

第一次上传后，打开仓库：

Settings → Actions → General

确认：

1. Actions 允许运行。
2. Workflow permissions 选择 Read and write permissions。
3. 点击 Save 保存。

CI 只需要读取代码，但 Release 工作流需要写入仓库内容，因此需要 contents: write 权限。

### D. Push 成功后查看代码

Push 成功后回到仓库的 Code 页面：

1. 分支下拉框选择 main。
2. 确认能看到 README.md。
3. 确认能看到 src、test 和 .github。
4. 点击 Commits 查看提交历史。
5. 点击 Actions 查看自动测试。

如果 Code 页面没有新文件，先不要创建 Release，回到 PowerShell 检查 git remote -v 和 git push 输出。

### E. Pull Request 页面

后续开发分支 Push 后，GitHub 通常会显示 Compare & pull request。

创建 Pull Request 时：

1. base repository 选择你的 study-log-cli。
2. base branch 选择 main。
3. compare branch 选择你刚 Push 的功能分支。
4. 点击 Create pull request。
5. 在 Files changed 中检查改动。
6. 在 Checks 中等待 CI。
7. CI 通过后点击 Merge pull request。
8. 点击 Confirm merge。
9. 合并后可以点击 Delete branch。

### F. Release 页面

本项目通过 Tag 自动创建 Release。

本地 Push Tag 后：

1. 打开 Actions。
2. 找到名为 Release 的工作流。
3. 打开本次运行。
4. 确认 Verify tests 成功。
5. 确认 Build package 成功。
6. 确认 Create GitHub Release 成功。
7. 打开 Releases 页面。
8. 检查 v0.1.0 和 study-log-cli-0.1.0.tgz 附件。

不要在 Release 工作流已经成功后，再手动创建同一个 Tag 的 Release。想修改说明时，进入已有 Release 页面点击 Edit release。


## 5. 初始化、提交和上传

确认已经回到项目目录，然后逐行执行：

```powershell
git init -b main
git status
git add .
git status
git commit -m "feat: create study log CLI"
```

第一次 git status 应该显示项目文件；git add 后应该只显示 study-log-cli 内的文件。

如果 Commit 提示没有用户名和邮箱：

```powershell
git config --global user.name "haijunlia"
git config --global user.email "3491210165@qq.com"
git commit -m "feat: create study log CLI"
```

然后添加 SSH 远程地址：

```powershell
git remote add origin git@github.com:haijunlia/study-log-cli.git
git remote -v
```

正确输出必须包含：

```text
origin  git@github.com:haijunlia/study-log-cli.git (fetch)
origin  git@github.com:haijunlia/study-log-cli.git (push)
```

最后上传：

```powershell
git push -u origin main
```

成功时可能看到：

```text
[new branch] main -> main
branch 'main' set up to track 'origin/main'
```

或者：

```text
Everything up-to-date
```

---

## 6. 如果远程 origin 已经存在

看到 remote origin already exists 时，不要再次 add，改用：

```powershell
git remote set-url origin git@github.com:haijunlia/study-log-cli.git
git remote -v
git push -u origin main
```

如果 git remote -v 中的地址前后出现方括号和圆括号，说明地址格式错误。

正确形式不能有方括号和圆括号：

```text
git@github.com:haijunlia/study-log-cli.git
```

---

## 7. 上传后检查

在本地执行：

```powershell
git status
git log --oneline -1
git remote -v
```

正常的工作区会显示：

```text
nothing to commit, working tree clean
```

然后刷新 GitHub 仓库页面，应该能看到 README.md、src、test 和 .github。

---

## 8. 创建第一个 Release

先确保主分支是最新的：

```powershell
git switch main
git pull
npm test
npm run pack:check
git status
```

确认工作区干净后创建 Tag：

```powershell
git tag -a v0.1.0 -m "Release v0.1.0"
git show v0.1.0 --stat
git push origin v0.1.0
```

打开 GitHub 的 Actions 页面，等待 Release 工作流完成。

然后打开 Releases 页面，应该看到 v0.1.0 和一个 study-log-cli-0.1.0.tgz 附件。

---

## 9. 修改功能并通过 Pull Request 发布

创建开发分支：

```powershell
git switch main
git pull
git switch -c docs/my-first-change
```

修改 README.md 后测试：

```powershell
npm test
git diff
git add README.md
git commit -m "docs: improve project guide"
git push -u origin docs/my-first-change
```

在 GitHub 页面创建 Pull Request，目标分支选择 main。等待 CI 通过后合并。

合并完成后同步本地：

```powershell
git switch main
git pull
git branch -d docs/my-first-change
```

---

## 10. 常见错误

### dubious ownership

执行：

```powershell
git config --global --add safe.directory "C:/Users/EDY/.codex/visualizations/2026/09/18/01a0b25d-ab86-7083-9a52-92862d1f13a8/study-log-cli"
```

### remote origin already exists

执行：

```powershell
git remote set-url origin git@github.com:haijunlia/study-log-cli.git
```

### Author identity unknown

执行：

```powershell
git config --global user.name "haijunlia"
git config --global user.email "3491210165@qq.com"
```

然后重新执行 Commit。

### src refspec main does not match any

说明还没有 Commit：

```powershell
git add .
git commit -m "feat: create study log CLI"
git push -u origin main
```

### SSH 连接失败

先测试：

```powershell
ssh -T git@github.com
```

如果 SSH 测试成功，但 Push 失败，检查远程地址是否是：

```text
git@github.com:haijunlia/study-log-cli.git
```

不要使用 HTTPS 地址，也不要使用带方括号和圆括号的 Markdown 链接。
