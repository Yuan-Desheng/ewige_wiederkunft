---
createTime: 2026-01-09 11:03
笔记ID: 20260109110347
multiFile:
multiMedia:
description:
笔记类型: 收集笔记
阐述日期:
tags:
  - Git
aliases:
cssclasses:
卡片盒笔记主题:
---

##  Git
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 参考资料
[常用 Git 命令清单 - 阮一峰的网络日志](https://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)

## 常用 Git 命令
![[Pasted image 20260109110446.png]]
- Workspace：工作区
- Index / Stage：暂存区
- Repository：仓库区（或本地仓库）
- Remote：远程仓库

### 1. Workspace → Index (add)
当你勾选“未进行版本管理的文件”或点击 `+` 号时：
- **命令：** 
```git
git add --ignore-errors -- <file_path>
```
- **参数逻辑：** `--ignore-errors` 确保即使某些文件因为权限或路径过长失败，其他文件也能成功加入暂存区；`--` 是为了防止文件名与分支名冲突

### 2. Index → Repository (commit)
当你点击 **Commit** 按钮时：
- **命令：** 
```git
git commit -m "你的提交信息" --as-is --no-verify
```
- **参数逻辑：** * `-m`: 指定提交日志。
    - `--as-is`: IDEA 内部有时用来指示保留换行符原始状态。
    - `--no-verify`: 如果你在 IDEA 界面勾选了“Skip tests”或类似检查，它会带上这个参数来跳过 Git Hook（如 pre-commit 钩子）。

### 3. Repository → Remote (push)
当你点击 **Push** 或 **Commit and Push** 中的推送部分时：
- **命令：** 
```git
git push --progress --porcelain origin refs/heads/master:master
```
- **参数逻辑：**
    - `--progress`: 让 IDEA 能在进度条显示百分比。
    - `--porcelain`: 以机器可读的格式输出结果，方便 IDEA 处理报错。
    - `refs/heads/...`: 明确指定本地分支推送到远程哪个分支。

### 4. Remote → Workspace/Repository (pull/fetch)
当你点击蓝色向下箭头（Update Project）时：
- **Fetch (获取更新):** 
```git
git fetch --progress --prune origin
```
`--prune`:顺便删掉远程已经不存在的本地分支引用。
- **Pull (拉取并合并):** 
```git
git merge origin/master
```
或者
```git
git rebase origin/master
```
IDEA 的 Pull 实际上是 `fetch` + `merge/rebase` 的组合。

### 5. Remote → Repository (clone)
当你从 URL 新建项目时：
- **命令：** 
```git
git clone --progress --recurse-submodules -v -- <url> <path>
```
`--recurse-submodules`: 自动初始化并克隆子模块。
`-v`: 详细模式（verbose）。

### 6. Repository → Workspace (checkout)
当你在右下角切换分支，或从 Log 中“Checkout Tag”时：
- **命令：** 
```git
git checkout -b <new_branch> --track origin/<branch>
```
- `-b`: 创建并切换。
- `--track`: 建立本地分支与远程分支的追踪关系。
