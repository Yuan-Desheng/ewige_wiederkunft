# Qwen Code 安装与配置

## 📖 基本信息

**Qwen Code** 是阿里云通义千问推出的 AI 编码助手，类似 Claude Code 的功能。

## 🚀 安装方式

### 独立安装（推荐）
```powershell
irm https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.ps1 | iex
```

### 环境要求
- ❌ **不需要 Node.js**（独立安装包已包含私有 Node.js 运行时）
- ✅ 开箱即用，无需额外依赖
- 只有 npm 安装方式才需要 Node.js 22+

## 🔧 详细配置过程

### 第一步：启动 Qwen Code
```bash
# 在你自己的终端里运行:
qwen
```

### 第二步：进入认证界面
**操作路径**：
- 输入 `/auth` 命令
- 选择 **Third-party Providers**（第三方服务商）
- 选择 **DeepSeek**
- 选择 **Key**（API Key 方式）

### 第三步：盯住一件事 - BaseURL
⚠️ **重要观察点**：注意它**有没有让你填 BaseURL**
- 如果提示要求 BaseURL，需要填写正确的地址
- 如果没有提示 BaseURL，则跳过此步骤

### 第四步：处理 model not found 问题
如果在配置过程中遇到 **model not found** 错误：
- 检查是否有类似"文心加酒投"的配置
- 去掉相关配置后再试
- 确保使用正确的模型名称

### 第五步：选择模型
在模型配置界面：
- 勾选 **deepseek-v4-pro**（推荐用于复杂任务）
- 按空格键切换选择
- 按 Enter 确认提交

### 第六步：配置完成确认
配置完成后回复：**「配好了」**

### 第七步：验证步骤
配好后继续以下验证步骤：
1. **`/doctor`** - 检查系统健康状态
2. **装技能** - 测试自动刷新功能
3. **改名** - 测试加载功能
4. **开环境变量看** `/workflows` - 查看工作流程

---

## 📋 会话管理命令
- `qwen --continue` 或 `qwen --resume`：继续之前的会话
- 退出方式：`Shift+Tab` 或 `/approval-mode default`

## 🌐 服务商连接选项
支持多种 AI 服务商：
- **Alibaba ModelStudio**（官方推荐）
- **第三方服务商**（DeepSeek、OpenAI 等）
- **自定义服务商**（本地服务器、代理）

## 🛡️ 自动模式说明

**已启用自动模式** - LLM 分类器会评估每次工具调用：
- **安全操作**：自动批准（读取文件、搜索代码等）
- **有风险的操作**：阻止并等待确认（删除文件、系统配置等）

## 🗑️ 完全卸载

### Windows 卸载步骤
```powershell
# 删除程序文件
Remove-Item -Path "C:\Users\YourName\AppData\Local\qwen-code" -Recurse -Force

# 删除配置文件
Remove-Item -Path "C:\Users\YourName\.qwen" -Recurse -Force
```

### 卸载位置
- **程序文件**：`C:\Users\{用户名}\AppData\Local\qwen-code`
- **配置文件**：`C:\Users\{用户名}\.qwen`
- **命令文件**：`C:\Users\{用户名}\AppData\Local\qwen-code\bin\qwen.cmd`

## 📚 相关资源

- **GitHub**: https://github.com/QwenLM/qwen-code
- **服务条款**: https://qwenlm.github.io/qwen-code-docs/en/users/support/tos-privacy/
- **官方文档**: https://qwenlm.github.io/qwen-code-docs/

## 🎯 使用建议

1. **新手推荐**：使用独立安装包，零依赖开箱即用
2. **模型选择**：根据任务复杂度选择合适的模型
3. **会话管理**：利用 `--continue` 恢复中断的对话
4. **安全模式**：注意自动模式的权限控制
5. **配置要点**：特别关注 BaseURL 配置要求
6. **故障排除**：遇到 model not found 时检查配置项
7. **验证流程**：按步骤进行 /doctor 和技能测试

## ⚠️ 注意事项

- 安装后需要重启终端使环境变量生效
- API Key 需要从对应服务商获取
- 配置文件存储在用户目录下的 `.qwen` 文件夹中
- 完全卸载需要同时删除程序文件和配置文件
- **BaseURL 配置很关键**：不同服务商可能有不同的要求
- **模型名称要准确**：使用官方推荐的模型名称
- **配置验证重要**：完成后一定要运行 /doctor 验证
- **技能加载测试**：确认自动刷新和改名功能正常
- **工作流程检查**：使用 /workflows 查看完整流程

## 🔍 常见问题解决

### model not found 错误
- 检查是否有多余配置项（如"文心加酒投"类配置）
- 确认模型名称拼写正确
- 验证 API Key 是否有效

### BaseURL 相关问题
- 不同服务商的 BaseURL 要求不同
- DeepSeek 通常不需要手动配置 BaseURL
- 如果遇到连接问题，检查网络和代理设置

### 配置验证步骤
1. **第一步**：运行 `/auth` 完成基础配置
2. **第二步**：运行 `/doctor` 检查系统状态  
3. **第三步**：测试技能自动刷新功能
4. **第四步**：测试改名加载功能
5. **第五步**：检查环境变量和 `/workflows`

---

**学习时间**：2026-08-10  
**来源**：实际安装配置经验 + 具体操作指令  
**笔记类型**：详细配置过程记录  
**状态**：已验证可用配置流程