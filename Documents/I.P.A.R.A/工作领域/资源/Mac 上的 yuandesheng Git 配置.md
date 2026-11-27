---
createTime: 2026-11-24 20:30
笔记ID: 20261124203016
multiFile:
multiMedia:
description: 记录共用 Mac 的 TK-SEA 工作目录、旧检出归档，以及 Git 署名、SSH 和 Obsidian 双账号配置。
笔记类型: AI整理
阐述日期:
tags:
  - AI幼儿园
  - Git
  - Gitea
aliases:
  - Mac Git 配置备忘
cssclasses:
  - ai-note
卡片盒笔记主题:
---

## Mac 上的 yuandesheng Git 配置
```meta-bind-embed
[[笔记抬头模块]]
```

关联：[[AI 幼儿园项目]]。最近核对日期：2026-11-25。

### 当前工作目录

- Mac 上的 TK-SEA 工作目录为 `/Users/yuandesheng/code/tk-sea-seller`，使用 macOS 的 `yuandesheng` 账号打开。该目录目前仅所有者可访问，`cuizhanwei` 无法进入。
- 原 `/Users/cuizhanwei/code/yuandesheng` 已于 2026-11-25 从原路径移出，归档在 `/Users/cuizhanwei/code/.archive/2026-11-25/yuandesheng`。归档包含幼儿园资料库、内层应用库和机器人库。移动后已核对幼儿园资料库仍在 `174e828`，机器人库仍在 `5d84ec6`。
- 机器人项目在 `/Users/yuandesheng/code/openRobotWholeMachine`，使用 macOS 的 `yuandesheng` 账号打开。它与 TK-SEA 是同级的独立仓库。2026-11-25 通过 Git bundle 对齐到 [Gitea](http://192.168.66.170:39979/yuandesheng/openRobotWholeMachine) 的 `master`（`5d84ec6`），工作区干净，`origin` 指向 Gitea，提交署名为 `yuandesheng <yuandesheng@jizhishida.com>`。该 macOS 账号直连此 Gitea 仓库时仍提示 `Permission denied (publickey)`，配置可用的 Gitea SSH 身份后才能直接拉取或推送。

### 幼儿园两个仓库的位置（2026-11-24 历史记录）

以下保留当时的检出位置及 Git 配置。表中的 `cuizhanwei` 路径已随旧目录归档。

| macOS 用户 | 资料仓库根目录 | 应用仓库位置 |
|---|---|---|
| `yuandesheng` | `/Users/yuandesheng/code/smart_vision/aiKindergartenSystem` | 根目录下的 `ai-kindergarden/` |
| `cuizhanwei` | `/Users/cuizhanwei/code/yuandesheng/aiKindergartenSystem` | 根目录下的 `ai-kindergarden/` |

两个仓库分别维护自己的 `.git`，`main` 都跟踪 `origin/main`。资料仓库的远端是 `yuandesheng/aiKindergartenSystem.git`，应用仓库的远端是 `zhanwei/ai-kindergarden.git`。SSH 使用 Gitea 的 `36731` 端口，具体内网地址以仓库里 `git remote get-url origin` 的输出为准。资料仓库忽略内层应用目录，六杯验证原始日志和其他本地归档也不随 Git 同步。

### 署名与推送身份

- **提交署名**由各仓库的 `.git/config` 决定。两种检出的配置都是 `user.name = yuandesheng`，`user.email` 使用 `yuandesheng` 的公司邮箱。这个过程只写了仓库内的配置。Mac 的 `yuandesheng` 账号原先已有同一署名的全局默认值。
- **Gitea 推送身份**由 SSH 密钥决定。`cuizhanwei` 的两个工作副本都在仓库内设置了 `core.sshCommand`，使用 `~/.ssh/id_ed25519_gitea_yuandesheng_mac` 并校验 Gitea 的 SSH 主机指纹。对应公钥已登记到 Gitea 的 `yuandesheng` 账号，名称为 `cuizhanwei-mac/gitea-yuandesheng`。
- `/Users/yuandesheng/` 下的两个副本是通过 Git bundle 对齐的。2026-11-24 再次实测时，以该 macOS 账号直连 Gitea 仍返回 `Permission denied (publickey)`。当时使用 `cuizhanwei` 桌面的副本拉取和推送。

### 幼儿园仓库原核对步骤（历史记录）

以下命令记录 2026-11-24 的核对方式。恢复或重新检出后，先将命令中的目录替换为有效路径。操作应用代码时应再进入 `ai-kindergarden/`。

```bash
cd /Users/cuizhanwei/code/yuandesheng/aiKindergartenSystem
git rev-parse --show-toplevel
git var GIT_AUTHOR_IDENT
git remote get-url origin
git status --short --branch
git fetch --prune origin
git rev-list --left-right --count main...origin/main
```

最后一行的两个数字分别表示本地领先和落后的提交数，`0 0` 表示提交一致。工作区干净、当前在 `main` 且本地只落后时，用 `git merge --ff-only origin/main` 安全更新。提交前先看 `git diff --cached`，推送前可用 `git push --dry-run origin HEAD` 检查。若重开终端后 SSH 公钥认证失败，可在 `cuizhanwei` 会话执行 `ssh-add ~/.ssh/id_ed25519_gitea_yuandesheng_mac`，按提示在当地终端输入私钥口令。

2026-11-24，两个 `cuizhanwei` 工作副本都成功以 `yuandesheng` 从 Gitea 克隆并通过 SSH 试推送。核对时资料仓库 `main` 为 `174e828`，应用仓库 `main` 为 `f9dc5c56`。这两个提交号是当日记录，查看现在是否一致时以 `git fetch` 和状态命令为准。

### Obsidian 笔记仓库的双账号读写

2026-11-24，Mac 上的 Codex 在 `/Users/yuandesheng/code/ewige_wiederkunft` 拉取时，提示无法写入 `.git/FETCH_HEAD`。桌面上的 ChatGPT 进程由 `cuizhanwei` 运行，仓库及 `.git` 由 `yuandesheng` 所有。用 `cuizhanwei` 直接执行 Git 还触发了 `detected dubious ownership`。这两个问题分别由 macOS 文件权限和 Git 的仓库信任配置处理。

先按幼儿园仓库的做法，在 `/Users/cuizhanwei/code/yuandesheng/ewige_wiederkunft` 建立桌面账号自己的副本，验证拉取成功。确认要让两个账号共用原目录后，再对原仓库配置以下权限。

1. 由仓库所有者 `yuandesheng` 给 `cuizhanwei` 增加原检出的读写 ACL，包括工作区、`.git` 和已有的所有者可写文件。
2. 在仓库目录上为两个账号设置目录和文件的继承 ACL。任一账号新建笔记、目录或 Git 元数据后，另一方也能继续写入。
3. 在 `cuizhanwei` 的 Git 用户配置中，仅把原仓库的绝对路径加入 `safe.directory`。这一步让 Git 信任该仓库的所有权关系，实际读写由 ACL 授权。

#### 核对当前账号和权限

```bash
repo=/Users/yuandesheng/code/ewige_wiederkunft
id -un
stat -f '%Su' /dev/console
ls -led "$repo" "$repo/.git" "$repo/.git/FETCH_HEAD"
git -C "$repo" status --short --branch
```

首次给 `cuizhanwei` 添加 Git 信任时，在该账号的终端执行以下命令。ACL 生效后，可用同一组命令核对拉取和提交署名。

```bash
repo=/Users/yuandesheng/code/ewige_wiederkunft
if ! git config --global --get-all safe.directory | grep -Fqx "$repo"; then
  git config --global --add safe.directory "$repo"
fi
git -C "$repo" var GIT_AUTHOR_IDENT
git -C "$repo" pull --ff-only origin master
git -C "$repo" status --short --branch
```

#### 验证结果

- `cuizhanwei` 在原目录成功执行 `git pull --ff-only`，并完成临时 Git 引用的创建和删除。
- 两个账号分别确认可以写入对方新建的文件，完成后清理了验证文件。
- 原目录的 `master` 与 `origin/master` 同步在 `77614ed`，工作区干净。Mac Codex 界面里的提交待下次实际编辑时验证。
