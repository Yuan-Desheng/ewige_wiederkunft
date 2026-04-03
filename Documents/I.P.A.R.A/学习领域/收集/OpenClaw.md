---
createTime: 2026-03-29 22:04
笔记ID: 20260329220401
multiFile:
multiMedia:
description:
笔记类型:
阐述日期:
tags:
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/OpenClaw.canvas|OpenClaw]]"
---

##  OpenClaw
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>
## 待办
- [ ] 

## 资料
[OpenClaw](https://docs.openclaw.ai/zh-CN)
[在Ubuntu24.04里面安装OpenClaw](https://jishubiji.com/p/771)
[安装、部署&使用教程](https://my.feishu.cn/wiki/LmRgwgGbDi58OBkLnfycpfNBnlf)
[# OpenClaw + 飞书机器人：如何让 AI 助手发送图片](https://apifox.com/apiskills/openclaw-fei-shu/)

## 笔记
[[OpenClaw安装、部署&使用教程]]
[[OpenClaw技能清单]]

## 提示词
[[openclaw提示词-04-01]]
[[openclaw提示词-04-02]]
[[openclaw提示词-04-03]]


## 飞书机器人
```
workspace

sgcc-vpp-expert

product-manager

frontend-dev
```

### 临时提示词
```
系统目录 /home/yuan/code/smart_vision/vpp/vpp-tov/src/pages 下，是"融合大模型智能体的虚拟电厂仿真系统"的前台页面代码。
请帮我优化可调能力预测用户级页面“/home/yuan/code/smart_vision/vpp/vpp-tov/src/pages/user_adjustable_prediction/index.vue”的模块布局和页面样式，页面样式需要注意与系统中实时符合预测的页面“/home/yuan/code/smart_vision/vpp/vpp-tov/src/pages/province_load/index.vue”样式风格保持一直。
```

```
我找到了在 Claude Code 中使用 MiniMax-M2.7 模型进行 AI 编程。的教程：https://platform.minimaxi.com/docs/token-plan/claude-code#%E6%89%8B%E5%8A%A8%E7%BC%96%E8%BE%91%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6

教程中配置需要的MiniMax API Key是：sk-api-b0J64l7inQvLBCSVH3sP4OnQrC9a7Flh_iYAhuP6uMSyKpiopgRKJ1q6hh5Wb_Hma9637_QEq8VFPSV1LyAE3YUJP7pk1ZiFBrHqAgLvBxv3e4eKeNrtStc

具体操作：
> ## Documentation Index
> Fetch the complete documentation index at: https://platform.minimaxi.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code

> 在 Claude Code 中使用 MiniMax-M2.7 模型进行 AI 编程。

## 安装 Claude Code

可参考 [Claude Code 文档](https://docs.claude.com/en/docs/claude-code/setup) 进行安装。

## 配置 MiniMax API

<Warning>
  **重要提示**：

  在配置前，请确保清除以下 Anthropic 相关的环境变量，以免影响 MiniMax API 的正常使用：

  * `ANTHROPIC_AUTH_TOKEN`
  * `ANTHROPIC_BASE_URL`
</Warning>

<Steps>
  <Step title="API 配置">
    <Tabs>
      <Tab title="使用 cc-switch（推荐）">
        [cc-switch](https://github.com/farion1231/cc-switch) 是一个便捷的工具，可以快速切换 Claude Code 的 API 配置。

        **1. 安装 cc-switch**

        <Tabs>
          <Tab title="macOS / Linux">
            ```bash  theme={null}
            brew tap farion1231/ccswitch
            brew install --cask cc-switch
            brew upgrade --cask cc-switch
            ```
          </Tab>

          <Tab title="Windows">
            前往 [cc-switch GitHub Releases](https://github.com/farion1231/cc-switch/releases) 页面下载最新版本的安装包。
          </Tab>
        </Tabs>

        **2. 添加 MiniMax 配置**

        启动 cc-switch，点击右上角 **"+"** ，选择预设的 MiniMax 供应商，并填写您的 MiniMax API Key。 <img src="https://filecdn.minimax.chat/public/0acbfee9-8871-4171-af19-e318476456a4.png" alt="choose" />

        **3. 配置模型名称**

        将模型名称全部改为 `MiniMax-M2.7`，完成后点击右下角的 **"添加"**。 <img src="https://filecdn.minimax.chat/public/1ceadee0-5488-44a1-82bb-94af0fc8d3b7.png" alt="add" />

        **4. 启用配置**

        回到首页，点击 **"启用"** <img src="https://filecdn.minimax.chat/public/0c5cbe27-1a6d-4583-9ad9-b48222055c3b.png" alt="start" />

        **5. 编辑配置文件**

        编辑或新增 `.claude.json` 文件，MacOS & Linux 为 `~/.claude.json`，Windows 为`用户目录/.claude.json`

        ```json  theme={null}
        # 新增 `hasCompletedOnboarding` 参数
        {
          "hasCompletedOnboarding": true
        }
        ```
      </Tab>

      <Tab title="手动编辑配置文件">
        ```json  theme={null}
        # Stpe1: 编辑或创建 Claude Code 的配置文件
        # MacOS & Linux 为 `~/.claude/settings.json`
        # Windows 为`用户目录/.claude/settings.json`
        # `MINIMAX_API_KEY` 需替换为您的 MiniMax API Key
        # 环境变量 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_BASE_URL` 优先级高于配置文件
        {
          "env": {
            "ANTHROPIC_BASE_URL": "https://api.minimaxi.com/anthropic",
            "ANTHROPIC_AUTH_TOKEN": "MINIMAX_API_KEY",
            "API_TIMEOUT_MS": "3000000",
            "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
            "ANTHROPIC_MODEL": "MiniMax-M2.7",
            "ANTHROPIC_SMALL_FAST_MODEL": "MiniMax-M2.7",
            "ANTHROPIC_DEFAULT_SONNET_MODEL": "MiniMax-M2.7",
            "ANTHROPIC_DEFAULT_OPUS_MODEL": "MiniMax-M2.7",
            "ANTHROPIC_DEFAULT_HAIKU_MODEL": "MiniMax-M2.7"
          }
        }
        # Step2: 编辑或新增 `.claude.json` 文件
        # MacOS & Linux 为 `~/.claude.json`
        # Windows 为`用户目录/.claude.json`
        # 新增 `hasCompletedOnboarding` 参数
        {
          "hasCompletedOnboarding": true
        }
        ```
      </Tab>
    </Tabs>
  </Step>

  <Step title="启动 Claude Code">
    配置完成后，进入工作目录，在终端中运行 `claude` 命令以启动 Claude Code
  </Step>

  <Step title="信任文件夹">
    启动后，选择 **信任此文件夹 (Trust This Folder)**，以允许 Claude Code 访问该文件夹中的文件，随后开始在 Claude Code 中使用 MiniMax-M2.7

    ![](https://filecdn.minimax.chat/public/7ca00f05-81bd-4058-a357-3bb79eabd738.jpg)
  </Step>
</Steps>

<Warning>
  **重要提示**：

  在配置完成后，如果您还想要使用 图片理解 & 网络搜索 能力，则需要根据 [此教程](https://platform.minimaxi.com/docs/token-plan/mcp-guide) 来配置图片理解 & 网络搜索 MCP
</Warning>

```

```
好的，frontend-dev已经改造好了。
接下来我想要安装一些与claude相关的skill
https://clawhub.ai/cheenu1092-oss/claude-code-mastery
https://clawhub.ai/yossiovadia/claude-code-wingman
https://clawhub.ai/johba37/claude-code-supervisor
https://clawhub.ai/enderfga/openclaw-claude-code
https://clawhub.ai/hw10181913/claude-code
https://clawhub.ai/paulrahul/claude-tmux
这些skill是不是有功能重复的地方，会不会有冲突，请帮我分析一下。
```