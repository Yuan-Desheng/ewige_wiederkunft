---
createTime: 2026-07-07 14:40
description:
multiFile:
multiMedia:
笔记ID: 20260707144057
笔记类型: 项目笔记
阐述日期:
---

##  xhs-setup-notes
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>

## 飞书提示词（直接复制用）

**A. 只出文案（日常活跃度，最快）**
```
来一篇小红书
```
或指定主题：
```
写一篇小红书，主题：vibe coding
```

**B. 文案 + 3 张配图（一次出齐）**
```
写一篇小红书，主题：AI Agent 给独立开发者提效。写完用 MiniMax image-01 把 3 张配图（3:4 竖图）也生成出来，一起发我
```
> 配图走 AI 插画（MiniMax image-01）。想要"标题文字卡"那种干净风格另有 HTML 出图方案，需要再说。
> 主题池（已锁进 skill）：软件开发、互联网行业、AI Agent、vibe coding、定制开发、低代码、SaaS、独立开发、MCP、大模型落地、数字化转型、技术出海。

---

## 复现笔记

> 生成日期 2026-07-07。软件公司小红书号「保持活跃度」用途。
> 核心：**飞书对话 → hermes 出稿（+可选配图）→ 回飞书对话框 → 人工发布**。

### 一、架构（全在 hermes 这台 Mac 上）

- **机器**：Intel Mac，`ssh apple@100.98.66.122 -p 22`（Tailscale）。
- **hermes** = OpenClaw 2026.4.22（`/Users/apple/.npm-global/bin/openclaw`）。
- **飞书**：OpenClaw 的 feishu channel 已打通（配置在 `~/.openclaw/openclaw.json` → `channels.feishu`）。飞书对话直接进 hermes。
- **LLM**：MiniMax。文本 `MiniMax-M2.7`、图片 `image-01`，都已 `configured:true`（`openclaw infer model providers` / `openclaw infer image providers` 可查）。
- **核心 skill**：`~/.openclaw/workspace/skills/xhs-writer/SKILL.md` —— 锁死主号「定制开发」风格 + 主题范围（软件/AI Agent/vibe coding 等）。

### 二、日常使用（飞书里直接发）

| 想要 | 飞书发送 |
|---|---|
| 只出文案（快） | `来一篇小红书` 或 `写一篇小红书，主题：vibe coding` |
| 文案 + 3 张配图 | `写一篇小红书，主题：XX。写完用 MiniMax image-01 把 3 张配图（3:4）也生成出来一起发我` |
| 换主题/换角度 | 再发一条 `来一篇小红书`（skill 会自动轮换主题池） |

hermes 会按主号风格出稿（🔥 标题 + 新闻钩子 + 客户故事 + 定制方案 + 效果 + 反思，~750 字 + 3 图说明），**直接回飞书对话框，不自动发布**。

### 三、改 skill（调风格/主题/字数）

- 文件：`~/.openclaw/workspace/skills/xhs-writer/SKILL.md`
- 改完**即时生效**（下次对话就用新的）。确认可见：`openclaw skills list | grep xhs-writer`。
- 可调：主题池、6 段结构、字数、语气、标题样式、是否默认出图，都在这个文件里。
- 直接命令行测（不走飞书）：`openclaw agent --agent main -m "来一篇小红书" --json --timeout 180`

### 四、复现最小步骤（重装/换机器时）

1. 装好 OpenClaw，配好 feishu channel 和 MiniMax provider（`openclaw configure`）。
2. 修 node PATH（见下方坑）：确保非交互 shell 能找到 `node`（`/usr/local/bin`）。
3. 把 `xhs-writer/SKILL.md` 放到 `~/.openclaw/workspace/skills/xhs-writer/`。
4. `openclaw skills list` 应显示 `xhs-writer ✓ ready`。
5. 飞书发"来一篇小红书"验证。

### 五、踩过的坑（重要）

1. **node PATH**：这台 Mac 的非交互 shell（SSH/cron/gateway 拉起的进程）PATH 没含 `/usr/local/bin`（node 所在），openclaw（node 脚本）会报 `env: node: No such file`。已在 `~/.bashrc` 追加 `export PATH="/usr/local/bin:$PATH"`。
2. **gateway 设备 scope**：CLI 操作 gateway/cron/agent 要先批准设备 scope。看 pending：`openclaw devices list`；批准：`openclaw devices approve <requestId>`（或 `--latest`）。
3. **小红书「发布」按钮反自动化**：creator.xiaohongshu.com 的发布按钮 `.publish-page-publish-btn button.bg-red` 会被小红书隐藏——只要浏览器被 CDP/DevTools 附着（包括 Playwright-over-CDP）就看不到、点不了；登录/上传/填正文/存草稿不受影响。**只有 rod 这种"干净浏览器"才看得到发布按钮**。这是当时 agent 和盲 CDP 都发不出去的根因。
4. **hermes 生图必须明说"用内置 image 工具"**：MiniMax image-01 凭证 OpenClaw 已内置配好（`configured:true`）。但若 skill/提示词只说"用 MiniMax image-01 生图"，agent 会跑去环境变量 / `~/.config` 找 API key（找不到就卡住问你要）。必须在 skill 里写死"**用你内置的图片生成工具（OpenClaw image capability），不要去找环境变量 / API key**"，agent 才会正确调内置能力生图（产物落 `~/.openclaw/workspace/*.png`，回复里以 `mediaUrls` 数组返回，注意是复数）。

### 六、（可选，已建好未启用）全自动发布到小红书

哪天想"飞书一句话直接发出去"，这套是现成的：

- **工具**：`xpzouying/xiaohongshu-mcp`（rod 干净浏览器，绕过上条坑）。
- **二进制**：`~/xiaohongshu-mcp/bin/xiaohongshu-mcp-darwin-amd64`（用 ghfast.top 镜像从 GitHub releases 下的；源码可 `git -c http.version=HTTP/1.1 clone`，Go 1.26 在手能自建）。
- **启动**：
  ```
  cd ~/xiaohongshu-mcp
  ./bin/xiaohongshu-mcp-darwin-amd64 -headless \
    -bin "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" -port :18060
  ```
- **cookie**：从一个已登录小红书的 Chrome（开 `--remote-debugging-port=9222`）用 CDP `Network.getAllCookies` 提取（含 `web_session`），**写到 MCP 的 CWD `~/xiaohongshu-mcp/cookies.json`**（注意 macOS `os.TempDir()` 是 `$TMPDIR` 不是 `/tmp`）。验证：`curl -s http://127.0.0.1:18060/api/v1/login/status` → `is_logged_in:true`。
- **发布**：`POST http://127.0.0.1:18060/api/v1/publish`，body `{"title":,"content":,"images":[URL],"tags":[],"visibility":"公开可见|仅自己可见|仅互关好友可见"}`。**图片只能传 URL**（先 `python3 -m http.server <port> --directory <imgdir>` 喂图）。
- **接进飞书**：把"调这个 publish API"做成 hermes 能调的 skill/工具，飞书说"写并发布"即端到端。**先在测试号(2237258774)跑，别直接上主号(49755699915)。**
- **注意**：`web_session` 会过期，过期要重提 cookie；MCP 是进程，Mac 重启会没（要做成自启服务）。

### 七、文件清单（Mac 上）

- `~/.openclaw/workspace/skills/xhs-writer/SKILL.md` —— 写手 skill（核心）
- `~/.openclaw/workspace/skills/xhs-writer/_meta.json`
- `~/xiaohongshu-mcp/` —— MCP 发布服务（可选）
- `~/xiaohongshu-mcp-src/` —— MCP 源码（可选，HTTP/1.1 clone；可能没下全）
- `~/xhs-images/` —— 配图临时目录
- `~/xhs-setup-notes.md` —— 同份笔记的纯文本副本（hermes 可读）
- `~/.openclaw/workspace/cookies.json`、`/tmp/xhs_cookies.json` —— 测试号 cookie（敏感）
- `~/.bashrc` —— 已加 `/usr/local/bin` 到 PATH

### 八、主号风格基线（来自用户提供的 3 篇真实样稿）

货运 AI 管家 / 异算方舟国产 AI 硬件 / 成都 AI 创业系统。共性：🔥 标题、科技/财经新闻钩子 → 一个具体小老板客户故事（场景化痛点）→ 简单定制诉求 → 精简方案 → 带数字的效果 → 反对唯新唯大的反思。~750 字、3 图。人设：务实、接地气的定制开发创业者。这套已锁进 skill。


