---
createTime: 2026-05-19 10:59
description: OpenCLI 安装配置与 Facebook 数据采集方案
multiFile:
multiMedia:
笔记ID: 20260519105943
笔记类型: 项目笔记
阐述日期:
---

## OpenCLI-Facebook 博主数据采集方案
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="50" max="100" style="width: 100%;"></progress>

### 基本信息

- 版本: v1.7.22
- 安装方式: `npm install -g @jackwener/opencli`
- 要求: Node.js >= 21（当前 v22.12.0）
- 文档仓库: `~/code/smart_vision/global-sentiment/open-cli/`（仅含 README）
- GitHub: https://github.com/jackwener/opencli

### 安装状态

| 步骤 | 状态 | 说明 |
|------|------|------|
| Node.js | ✅ | v22.12.0 |
| npm 全局安装 | ✅ | v1.7.22 |
| Daemon | ✅ | 运行在 19825 端口 |
| Chrome 扩展 | ✅ | v1.0.15，通过 Chrome Web Store 安装 |
| Browser Bridge 连接 | ✅ | Profile `hjvh3g58` 已连通，延迟 0.1s |

### 安装步骤（完整流程）

**1. 安装 OpenCLI CLI**
```bash
# 确认 Node.js >= 21
node --version

# 全局安装
npm install -g @jackwener/opencli

# 验证
opencli --version
```

**2. 安装 Browser Bridge Chrome 扩展**

二选一：
- **方式A（推荐）**：从 Chrome Web Store 安装
  https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk
- **方式B（离线/手动）**：从 GitHub Releases 下载 zip
  ```bash
  # 下载最新扩展包
  wget -O /tmp/opencli-extension.zip \
    "https://github.com/jackwener/OpenCLI/releases/latest/download/opencli-extension-*.zip"
  # 解压
  mkdir -p /tmp/opencli-extension && unzip /tmp/opencli-extension.zip -d /tmp/opencli-extension/
  # 然后在 Chrome 中：chrome://extensions → 开启开发者模式 → 加载已解压的扩展程序 → 选择解压目录
  # 安装完成后清理
  rm -rf /tmp/opencli-extension /tmp/opencli-extension.zip
  ```

**3. 验证连接**
```bash
opencli doctor
# 期望输出：
#   [OK] Daemon: running on port 19825
#   [OK] Extension: connected
#   [OK] Connectivity: connected in 0.1s
#   Everything looks good!
```

**4.（可选）配置多 Chrome Profile**
```bash
opencli profile list                          # 查看已连接的 profile
opencli profile rename <contextId> work       # 给 profile 起别名
opencli profile use work                      # 设为默认
```

**5. 在 Chrome 中登录目标网站**

所有 `[cookie]` 命令复用 Chrome 的登录状态，必须先在浏览器中手动登录（如 facebook.com）。

### 关键配置项

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OPENCLI_DAEMON_PORT` | 19825 | daemon 端口 |
| `OPENCLI_PROFILE` | — | 多 Chrome 配置文件时指定 |
| `OPENCLI_BROWSER_CONNECT_TIMEOUT` | 30s | 浏览器连接超时 |
| `OPENCLI_BROWSER_COMMAND_TIMEOUT` | 60s | 单命令超时 |
| `OPENCLI_CDP_ENDPOINT` | — | 远程浏览器 CDP 端点 |

### 输出格式

所有命令支持 `--format / -f`：`table`（默认）、`json`、`yaml`、`md`、`csv`

### 退出码

| 0 成功 | 1 通用错误 | 2 参数错误 | 66 空结果 | 69 服务不可用 | 77 需要认证 | 78 配置错误 | 130 中断 |

---

## Facebook 博主数据采集方案

### 内置 Facebook 命令

| 命令 | 认证 | 说明 |
|------|------|------|
| `opencli facebook search` | cookie | 搜索用户、主页、贴文 |
| `opencli facebook profile` | cookie | 获取用户/主页资料 |
| `opencli facebook feed` | cookie | 获取动态流 |
| `opencli facebook notifications` | cookie | 通知列表 |
| `opencli facebook groups` | cookie | 群组列表 |
| `opencli facebook events` | cookie | 活动分类 |
| `opencli facebook friends` | cookie | 好友建议 |

### 采集层次

**第一层 — 用户资料**
```bash
opencli facebook search "博主名" -f json
opencli facebook profile <username> -f json
```

**第二层 — 贴文内容**
```bash
# 方式A：内置 feed
opencli facebook feed -f json

# 方式B：browser 操作（更灵活）
opencli browser fb open "https://www.facebook.com/<username>"
opencli browser fb state
opencli browser fb scroll down
opencli browser fb extract --selector '[data-testid="post_message"]' -f json
opencli browser fb network --filter graphql
```

**第三层 — 图片/视频**
```bash
# 提取图片URL
opencli browser fb eval "document.querySelectorAll('img[src*=\"scontent\"]').map(i=>i.src)"

# 提取结构化图片数据
opencli browser fb extract --selector 'img' -f json

# 视频下载（需 yt-dlp）
yt-dlp "https://www.facebook.com/watch/?v=VIDEO_ID"
```

**第四层 — 批量自动化脚本**
```bash
#!/bin/bash
BLOGGER="target_username"
OUTDIR="./facebook_data/$BLOGGER"
mkdir -p "$OUTDIR"

# 1. 用户资料
opencli facebook profile "$BLOGGER" -f json > "$OUTDIR/profile.json"

# 2. browser 操作主页
SESSION="fb_$BLOGGER"
opencli browser $SESSION open "https://www.facebook.com/$BLOGGER"
opencli browser $SESSION state > "$OUTDIR/page_state.json"

# 3. 滚动加载更多贴文
for i in $(seq 1 5); do
  opencli browser $SESSION scroll down
  sleep 2
done

# 4. 提取贴文
opencli browser $SESSION extract --selector '[data-testid="post_message"]' -f json > "$OUTDIR/posts.json"

# 5. 提取图片
opencli browser $SESSION extract --selector 'img' -f json > "$OUTDIR/images.json"

# 6. 关闭
opencli browser $SESSION close
```

### 注意事项

- 必须在 Chrome 中登录 Facebook，opencli 复用浏览器登录状态
- Facebook 有反爬机制，操作间隔 2-5 秒
- 所有 Facebook 内置命令标记为 `[cookie]`，需要已登录的浏览器会话
- `opencli browser` 命令需要 `<session>` 参数，如 `opencli browser mysession open <url>`

---

## Facebook 账号防封与账号管理方案

### 当前环境诊断

| 项目 | 当前值 | 问题 |
|------|--------|------|
| 出口 IP | 185.248.187.31（新加坡 Akari Networks） | ⚠️ 数据中心 IP，非住宅 IP，Facebook 容易标记 |
| 代理类型 | VPN/代理（非原生） | ⚠️ 共享 IP 池，多人共用可能已被污染 |
| 时区 | Asia/Shanghai (CST +0800) | ❌ 与 IP 所在地（新加坡）不一致 |
| 系统 locale | zh_CN.UTF-8 | ⚠️ 与 IP 所在地不匹配 |
| 浏览器 | 原生 Chrome 147 | ❌ 原生指纹，Canvas/WebGL/AudioContext 可被追踪关联 |
| Tailscale | 已连接，跨设备组网 | — |
| Docker | 未安装 | — |

**核心问题：**
1. **数据中心 IP** — 新加坡 Akari Networks 是典型的 VPS/VPN 供应商，Facebook 对这类 IP 段风控极严，新注册账号几乎必封
2. **环境指纹不一致** — IP 在新加坡，时区在上海，语言是中文，Facebook 的反欺诈系统会立即标记
3. **无指纹隔离** — 两个注册账号共用同一浏览器指纹（Canvas、WebGL、字体列表等），第一个被封后第二个连带封禁

### 关于购买老号方案（58facebook.com）的评价

**部分可行，但单独使用远远不够：**

- ✅ 老号确实比新号抗封（有历史行为数据、好友网络、权重积累）
- ❌ 如果你的 **IP、浏览器指纹、时区/语言环境** 没有改变，老号一样会很快被封
- ❌ 购号平台存在回收风险（卖家可能通过原始邮箱/手机号找回）
- ❌ 批量操作时多个账号共享同一环境，容易导致全军覆没

**结论：老号可以买，但必须配合指纹浏览器 + 住宅代理才能真正生效。**

### 推荐方案：指纹浏览器 + 住宅代理 + 老号

#### 方案架构

```
                        +-----------------+
                        |  opencli CLI    |
                        +--------+--------+
                                 |
                     +-----------+-----------+
                     |                       |
              +------+------+         +------+------+
              | 指纹浏览器    |         | Chrome 原生  |
              | Profile A    |         | （个人账号） |
              | (FB 老号 A)  |         +-------------+
              +------+------+
                     |
              +------+------+         +------+------+
              | 指纹浏览器    |         | 指纹浏览器   |
              | Profile B    |         | Profile C   |
              | (FB 老号 B)  |         | (FB 老号 C) |
              +-------------+         +-------------+
                     |
              每个Profile独立：
              - 住宅代理 IP（与Profile地区匹配）
              - 独立 Canvas/WebGL 指纹
              - 匹配的时区/语言
```

#### 第一步：选择指纹浏览器

推荐按优先级选择：

| 指纹浏览器          | Linux 支持  | 免费版            | 价格      | 特点              |
| -------------- | --------- | -------------- | ------- | --------------- |
| **AdsPower**   | ✅ 有 deb 包 | 5 个 Profile 免费 | $5.4/月起 | 最主流，中文友好，API 完善 |
| **Multilogin** | ✅ Linux   | ❌              | €99/月起  | 业界标杆，指纹模拟最逼真    |
| **GoLogin**    | ✅ Linux   | 7 天试用          | $49/月起  | 界面友好，云同步        |

**推荐 AdsPower**：免费版 5 个 Profile 足够初期使用，Linux 支持好，社区最大。

安装方式：
```bash
# AdsPower Linux 安装
wget -O /tmp/adspower.deb "https://version.adspower.net/AdsPower-linux-x64.deb"
sudo dpkg -i /tmp/adspower.deb
# 或直接从官网下载：https://www.adspower.com/download
```

#### 第二步：购买住宅代理

| 服务商             | 类型   | 价格         | 推荐地区     |
| --------------- | ---- | ---------- | -------- |
| **IPRoyal**     | 住宅代理 | $1.75/GB 起 | 美国/台湾/香港 |
| **Smartproxy**  | 住宅代理 | $12.5/GB 起 | 全球覆盖好    |
| **Bright Data** | 住宅代理 | $8.4/GB 起  | 最大IP池    |
|                 |      |            |          |

**关键要求：**
- 必须是 **住宅 IP**（Residential Proxy），不能用数据中心 IP
- 每个指纹浏览器 Profile 绑定不同地区的代理 IP
- 代理地区 = Profile 设置的时区/语言（如用美国 IP → 时区 America/New_York → 语言 en_US）

#### 第三步：配置 Profile 规范

每个 Facebook 账号对应一个独立的指纹浏览器 Profile，配置必须一致：

| 配置项 | 美国号示例 | 台湾号示例 |
|--------|-----------|-----------|
| 代理 IP | 美国住宅 IP | 台湾住宅 IP |
| 时区 | America/New_York | Asia/Taipei |
| 语言 | en-US | zh-TW |
| Canvas 指纹 | 随机生成 | 随机生成 |
| WebGL 指纹 | 随机生成 | 随机生成 |
| 字体列表 | 英文系统字体 | 中文系统字体 |
| User-Agent | Chrome Windows | Chrome Windows |
| 屏幕分辨率 | 1920x1080 | 1920x1080 |

#### 第四步：OpenCLI 对接指纹浏览器

指纹浏览器（如 AdsPower）通过 CDP 接口暴露浏览器实例，OpenCLI 可以直接连接：

```bash
# 方式A：通过 AdsPower API 启动 Profile 获取 CDP 端点
# AdsPower 启动后会在本地暴露调试端口，例如：
# http://local.adspower.net:50325/api/v1/browser/start?user_id=PROFILE_ID

# 获取 CDP WebSocket URL 后，设置环境变量：
export OPENCLI_CDP_ENDPOINT="ws://127.0.0.1:CDP_PORT"
opencli facebook profile <username> -f json

# 方式B：使用 --profile 指定不同的浏览器实例
opencli --profile fb_account_a facebook profile <username> -f json
```

#### 第五步：批量采集时的账号轮换策略

```bash
#!/bin/bash
# 账号轮换采集脚本
# 每个 Profile 使用不同的 Facebook 老号 + 不同的住宅代理

PROFILES=("fb_us_01" "fb_tw_01" "fb_hk_01")
BLOGGERS=("target_a" "target_b" "target_c")

for i in "${!BLOGGERS[@]}"; do
  PROFILE=${PROFILES[$((i % ${#PROFILES[@]}))]}
  BLOGGER=${BLOGGERS[$i]}

  # 启动对应的指纹浏览器 Profile（通过 AdsPower API）
  RESP=$(curl -s "http://local.adspower.net:50325/api/v1/browser/start?user_id=${PROFILE}")
  WS_ENDPOINT=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['ws']['puppeteer'])")

  # 设置 OpenCLI 使用该 Profile 的 CDP 端点
  export OPENCLI_CDP_ENDPOINT="$WS_ENDPOINT"

  # 执行采集
  opencli facebook profile "$BLOGGER" -f json > "./data/${BLOGGER}_profile.json"
  opencli facebook search "$BLOGGER" -f json --limit 20 > "./data/${BLOGGER}_search.json"

  # 关闭 Profile
  curl -s "http://local.adspower.net:50325/api/v1/browser/stop?user_id=${PROFILE}"

  # 间隔 3-5 分钟切换下一个，避免频率过高
  sleep $((RANDOM % 120 + 180))
done
```

### 风险控制清单

- [ ] 指纹浏览器已安装，每个 FB 账号独立 Profile
- [ ] 住宅代理已购买，每个 Profile 绑定匹配地区的 IP
- [ ] Profile 的时区/语言与代理 IP 地区一致
- [ ] 不在多个 Profile 之间复制粘贴内容（FB 可检测剪贴板）
- [ ] 每个 Profile 的操作间隔 > 2 分钟
- [ ] 新老号到手后先养号 3-7 天（浏览、点赞、评论正常内容）
- [ ] 批量采集不超过每账号每小时 30 次操作
- [ ] 定期检查账号状态，被封立即切换备用号
- [ ] 被封账号的 Profile 不再复用，创建新 Profile + 新代理 IP

### 成本估算

| 项目 | 方案 | 预估月成本 |
|------|------|-----------|
| 指纹浏览器 | AdsPower 免费版（5 Profile） | ¥0 |
| 住宅代理 | IPRoyal 住宅 IP（3-5 个地区） | ¥50-150/月 |
| Facebook 老号 | 58facebook.com 等平台（2-3 个） | ¥50-200（一次性） |
| **合计** | | **¥100-350/月** |

### 相关命令速查

```bash
opencli doctor                    # 检查连接状态
opencli list                      # 列出所有命令
opencli profile list              # 列出 Chrome 配置文件
opencli browser <s> open <url>    # 打开URL
opencli browser <s> state         # 页面快照
opencli browser <s> click <sel>   # 点击元素
opencli browser <s> scroll down   # 向下滚动
opencli browser <s> extract       # 提取数据
opencli browser <s> network       # 拦截网络请求
opencli browser <s> eval <js>     # 执行JS
opencli browser <s> close         # 关闭会话
```

---

### 数据补全进展（2026-05-25 更新）

#### 已完成工作

| 任务 | 状态 | 说明 |
|------|------|------|
| XLSX 字段同步到 JSON | ✅ 完成 | 补全 gender/education/occupation，共 10 条 |
| facebook.json 整理 | ✅ 完成 | 从 32 条增至 38 条，补全 Nasdaily、越南区 6 条 |
| XLSX 补全文件 | ✅ 完成 | 生成 `意见领袖列表_补全.xlsx`（6 Sheet + 新增条目 Sheet） |

#### 待完成（需要网络查询）

| 姓名           | 国籍  | 缺少字段             | 建议方式                                              |
| ------------ | --- | ---------------- | ------------------------------------------------- |
| Jennifer Kim | 泰国  | 账号名、主页地址         | `opencli facebook search "Jennifer Kim Thailand"` |
| 越南区 6 条新账号   | 越南  | subscriberNumber | 逐一查询                                              |

#### 补全后数据统计

| 平台 | JSON条目数 | 说明 |
|------|-----------|------|
| Instagram | 59 | |
| TikTok | 23 | |
| X (Twitter) | 10 | |
| YouTube | 33 | |
| Facebook | 38 | 更新后 |
| **合计** | **163** | |

### 文件路径

```
/home/yuan/code/smart_vision/global-sentiment/tik-hub/tikhub_tiktok_scraper/tikhub_scraper/tikhub_scraper/leaders/
  instagram.json          # 已更新
  tiktok.json            # 已更新
  x.json                 # 已更新
  youtube.json           # 已更新
  facebook.json          # 已重构（38条）
  意见领袖列表 更新.xlsx   # 原始
  意见领袖列表_补全.xlsx  # 新建
  数据整理报告.md         # 本次执行记录
```
