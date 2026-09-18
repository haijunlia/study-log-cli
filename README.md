# Study Log CLI

一个简单的 Node.js 学习打卡命令行工具，也是一份可以直接照做的 GitHub SSH 上传与 Release 练习项目。

## 功能

- 添加学习记录
- 查看学习记录
- 删除学习记录
- 自动化测试
- GitHub Actions CI
- 推送版本 Tag 后自动创建 Release

## 本地运行

要求 Node.js 20 或更高版本。

```powershell
npm ci
npm test

npm start -- add 学习 GitHub SSH
npm start -- add 学习 GitHub Actions
npm start -- list
npm start -- remove 1
```

学习记录会保存在当前目录的 .study-log.json。这个文件已经被 .gitignore 忽略，不会上传到 GitHub。

## 用 SSH 上传到你的 GitHub

本项目默认使用你的账号 haijunlia 和仓库 study-log-cli。

### 1. 在 GitHub 创建空仓库

在 GitHub 创建新仓库：

- Repository name：study-log-cli
- 可见性：按你的需要选择
- 不要勾选 README、.gitignore 或 License

### 2. 在项目目录执行下面命令

重要：每一行单独执行，不要复制 PowerShell 前面的 PS C:\...>。

```powershell
cd "C:\Users\EDY\.codex\visualizations\2026\09\18\01a0b25d-ab86-7083-9a52-92862d1f13a8\study-log-cli"
git config --global --add safe.directory "C:/Users/EDY/.codex/visualizations/2026/09/18/01a0b25d-ab86-7083-9a52-92862d1f13a8/study-log-cli"
ssh -T git@github.com
git init -b main
git add .
git commit -m "feat: create study log CLI"
git remote add origin git@github.com:haijunlia/study-log-cli.git
git push -u origin main
```

SSH 测试成功时会看到：

```text
Hi haijunlia! You've successfully authenticated, but GitHub does not provide shell access.
```

检查远程地址：

```powershell
git remote -v
```

正确的地址必须是下面这一行，不要带方括号或圆括号：

```text
git@github.com:haijunlia/study-log-cli.git
```

### 3. 发布第一个版本

第一次上传成功后，可以发布 v0.2.0：

```powershell
npm test
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

GitHub Actions 会自动测试项目并创建 v0.2.0 Release。

完整的“新增功能 → Pull Request → 发布 v0.2.0”流程，请阅读 UPLOAD-GUIDE.md 中的“本次项目的 v0.2.0 实操流程”。

## 如果 origin 已经存在

不要再次使用 git remote add origin。改用：

```powershell
git remote set-url origin git@github.com:haijunlia/study-log-cli.git
git remote -v
git push -u origin main
```

## GitHub 网页端如何配合

本项目不是只在 PowerShell 中操作。完整流程需要本地 Git 和 GitHub 网页端配合。

### 第一次创建仓库

在 GitHub 网页中：

1. 点击右上角的加号。
2. 选择 New repository。
3. Repository name 填写 study-log-cli。
4. 选择 Public 或 Private。
5. 不要勾选 README、.gitignore 或 License。
6. 点击 Create repository。

仓库创建后，进入仓库的 Code 页面。SSH 地址应该是：

```text
git@github.com:haijunlia/study-log-cli.git
```

### 添加 SSH 公钥

SSH 公钥是账号级别的设置，不是在项目代码里设置。

在 GitHub 网页中打开：

头像 → Settings → SSH and GPG keys → New SSH key

填写：

- Title：EDY Windows
- Key type：Authentication Key
- Key：粘贴 id_ed25519.pub 的内容

私钥 id_ed25519 只能留在自己的电脑上，绝对不要上传到 GitHub。

### 检查 Actions 权限

第一次 Push 后进入仓库的 Actions 页面。如果看到工作流被禁止或 Release 无法创建，打开：

Settings → Actions → General

检查：

1. Actions permissions 允许工作流运行。
2. Workflow permissions 选择 Read and write permissions。
3. 保存设置。

本项目的 Release 工作流需要 contents: write 权限，用来创建 GitHub Release 和上传 .tgz 文件。

### Push 后在哪里看代码

Push 成功后：

1. 打开仓库的 Code 页面。
2. 分支选择 main。
3. 检查 README.md、src、test 和 .github 是否存在。
4. 点击 Actions，查看 CI 工作流。
5. 点击 Commits，可以查看每一次提交。

### Pull Request 如何配合

开发新功能时：

1. 本地从 main 创建新分支。
2. 修改文件并运行 npm test。
3. Push 新分支。
4. GitHub 页面会出现 Compare & pull request。
5. 创建 Pull Request，目标分支选择 main。
6. 查看 Files changed，确认改动。
7. 等待 CI 变成绿色。
8. 点击 Merge pull request。
9. 合并后可以点击 Delete branch 删除远程临时分支。

Pull Request 页面中的 Checks 是 GitHub Actions 的检查结果。CI 失败时，先点击失败的检查，再阅读具体日志，不要直接合并。

### Release 如何配合

本项目使用自动发布：

1. 本地更新 package.json、package-lock.json 和 CHANGELOG.md。
2. 本地创建版本 Tag，例如 v0.2.0。
3. 将 Tag Push 到 GitHub。
4. GitHub Actions 自动测试并打包。
5. GitHub Actions 自动创建 Release。
6. 在仓库的 Releases 页面查看版本和 .tgz 附件。

因此，推送版本 Tag 后要去两个地方检查：

- Actions：确认 Release 工作流成功。
- Releases：确认版本页面和附件已经生成。

不要在 GitHub 网页中重复创建同一个 Tag 的 Release，否则可能和自动工作流冲突。

## 文件说明

- src/checkin-store.js：学习记录的数据逻辑
- src/cli.js：命令行入口
- test/checkin-store.test.js：自动化测试
- .github/workflows/ci.yml：Push 或 Pull Request 时运行测试
- .github/workflows/release.yml：推送 v*.*.* Tag 时创建 Release
- UPLOAD-GUIDE.md：详细上传手册
- COLLABORATION-GUIDE.md：两人协作、Pull Request、合并冲突和发布版本手册

## 许可证

MIT，见 LICENSE。
