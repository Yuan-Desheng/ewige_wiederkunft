# Unity Editor MCP + Claude Code 配置指南

> 知塘晓物数字孪生项目 — 通过 MCP 协议让 Claude Code 控制 Unity 编辑器

## 一、环境信息

| 项目 | 值 |
|------|-----|
| Unity 版本 | 2022.3.62f3 LTS |
| Unity 项目路径 | `03-unity/CrabTwin/` |
| MCP 包（Unity 侧） | `com.unity.editor-mcp` v1.3.1 (git tag) |
| MCP Server（Claude 侧） | `@akiojin/unity-editor-mcp@1.3.1` (npm) |
| TCP 连接 | `localhost:6400` |
| Node.js | v22.22.2 |
| Claude Code | 2.1.128 |

## 二、架构

```
Claude Code (MCP Client)
     │  stdio (JSON-RPC)
     ▼
npx @akiojin/unity-editor-mcp@1.3.1 (Node.js MCP Server)
     │  TCP localhost:6400
     ▼
Unity Editor (TCP Listener，由桥接包自动启动)
```

## 三、安装步骤

### 3.1 Unity 侧安装桥接包

在 Unity 编辑器中操作：

1. 打开 `Window → Package Manager`
2. 点击左上角 `+` → `Add package from git URL...`
3. 粘贴以下 URL（注意是 v1.3.1，不是 main 分支最新版）：

```
https://github.com/akiojin/unity-editor-mcp.git?path=unity-editor-mcp#v1.3.1
```

4. 点击 `Add`，等待安装和编译完成

**为什么用 v1.3.1：** main 分支最新版 (v2.14.x) 要求 Unity 6（"unity": "6000.0"），使用了 `Rigidbody.linearDamping` 等 Unity 6 新 API，在 Unity 2022.3 中会编译失败。v1.3.1 声明 "unity": "2020.3"，完全兼容。

安装成功后，Unity 编辑器会自动在 `localhost:6400` 启动 TCP 监听。验证：

```bash
ss -tlnp | grep 6400
# 应看到 LISTEN 状态
```

### 3.2 Claude Code 侧配置 MCP

```bash
claude mcp add -s user unity-editor-mcp -- npx @akiojin/unity-editor-mcp@1.3.1
```

写入 `~/.claude.json`（user scope，全局可用）。

验证配置：

```bash
claude mcp list
```

### 3.3 Unity 项目配置文件

文件位置：`03-unity/CrabTwin/.unity/config.json`

```json
{
  "project": {
    "root": "/home/yuan/code/smart_vision/zhitang-insight/digital-twin/03-unity/CrabTwin",
    "codeIndexRoot": "/home/yuan/code/smart_vision/zhitang-insight/digital-twin/03-unity/CrabTwin/Library/UnityMCP/CodeIndex"
  },
  "unity": {
    "host": "localhost",
    "port": 6400,
    "reconnectDelay": 1000,
    "maxReconnectDelay": 30000,
    "reconnectBackoffMultiplier": 2,
    "commandTimeout": 30000
  },
  "logging": {
    "level": "info"
  }
}
```

此文件告诉 MCP Server 去哪里找 Unity 项目。

## 四、使用方式

### 4.1 启动前提

- Unity 编辑器已打开 CrabTwin 项目（TCP 6400 在监听）
- 在 Unity 项目目录下启动 Claude Code（这样它会读取 `.unity/config.json`）

### 4.2 交互模式（推荐用于复杂任务）

```bash
cd ~/code/smart_vision/zhitang-insight/digital-twin/03-unity/CrabTwin
claude
```

进入交互式 REPL，可以多轮对话。

### 4.3 Print 模式（单次任务）

```bash
claude -p "列出当前场景中的所有 GameObject" --max-turns 5
```

适合 CI/脚本集成的非交互模式。

## 五、使用示例

以下示例均在 CrabTwin 项目目录下运行。

### 示例 1：场景探索 — 查看当前场景结构

```bash
claude -p "查看当前打开的场景，列出场景中所有 GameObject 的层级结构" --max-turns 5
```

预期结果：Claude 会调用 MCP 的场景工具，返回 Hierarchy 中所有对象的树形列表。

### 示例 2：创建 GameObject — 放一个立方体到场景中

```bash
claude -p "在场景原点位置创建一个名为 TestCube 的 Cube（立方体），然后保存场景" --max-turns 5
```

### 示例 3：修改属性 — 调整物体位置和材质

```bash
claude -p "找到 TestCube 这个物体，把它的位置改为 (2, 1, 0)，缩放改为 (2, 2, 2)" --max-turns 5
```

### 示例 4：批量操作 — 为场景添加灯光和相机

```bash
claude -p "在当前场景中添加一个 Directional Light（位置 5,10,5，旋转 50,-30,0）和一个 Camera（位置 0,5,-10，看向原点）" --max-turns 8
```

### 示例 5：截图 — 捕获场景视图

```bash
claude -p "截取当前 Game View 的截图，分辨率 1920x1080" --max-turns 5
```

### 示例 6：交互模式下的多轮开发

```bash
cd ~/code/smart_vision/zhitang-insight/digital-twin/03-unity/CrabTwin
claude
```

进入交互模式后可以逐步操作：

```
> 帮我查看当前场景里有什么物体
> （看到结果后）把 crab 的位置移到 (0, 0.5, 0)
> 给它加一个 MeshCollider 组件
> 保存场景
> 截一张场景图给我看看效果
```

### 示例 7：结合项目上下文做复杂操作

```bash
claude -p "读取 02-blender/ 目录下的模型信息，然后告诉我 CrabTwin 项目的 Assets/ 目录中有哪些 3D 模型资源，它们的导入设置是否正确" --max-turns 8 --add-dir ~/code/smart_vision/zhitang-insight/digital-twin/02-blender
```

### 示例 8：项目设置检查

```bash
claude -p "检查当前 Unity 项目的 Player Settings，告诉我目标平台是什么，渲染管线用的是什么" --max-turns 5
```

## 六、常见问题

### Q: 端口 6400 没有监听？

检查：
1. Unity 编辑器是否已打开 CrabTwin 项目
2. Package Manager 中 `Unity Editor MCP` 包是否安装成功
3. Unity Console 中是否有编译错误（红色错误会阻止 `[InitializeOnLoad]` 执行）

```bash
ss -tlnp | grep 6400
```

### Q: Claude Code 提示 MCP 连接失败？

确保在 Unity 项目目录下启动 Claude Code：
```bash
cd ~/code/smart_vision/zhitang-insight/digital-twin/03-unity/CrabTwin
claude
```

### Q: 升级 Unity 版本后能否用最新版 MCP？

如果项目升级到 Unity 6（6000.0），可以切换到最新版：
```bash
# Unity 侧：重新安装 git URL（去掉 #v1.3.1）
# https://github.com/akiojin/unity-editor-mcp.git?path=UnityEditorMCP/Packages/unity-editor-mcp

# Claude Code 侧：
claude mcp remove -s user unity-editor-mcp
claude mcp add -s user unity-editor-mcp -- npx @akiojin/unity-editor-mcp@latest
```

### Q: 不用 Claude Code，其他 MCP 客户端能用吗？

可以。配置方式参考各客户端文档，核心就是启动 `npx @akiojin/unity-editor-mcp@1.3.1` 作为 stdio MCP Server。支持 Claude Desktop、Cursor、VS Code Copilot 等。

## 七、相关文件

| 文件 | 用途 |
|------|------|
| `~/.claude.json` | Claude Code MCP 配置（user scope） |
| `03-unity/CrabTwin/.unity/config.json` | MCP Server 项目路径配置 |
| `03-unity/CrabTwin/Packages/manifest.json` | Unity 包依赖（含 editor-mcp） |

## 八、参考链接

- GitHub 仓库：https://github.com/akiojin/unity-editor-mcp
- npm 包：https://www.npmjs.com/package/@akiojin/unity-editor-mcp
- MCP 协议：https://modelcontextprotocol.io
