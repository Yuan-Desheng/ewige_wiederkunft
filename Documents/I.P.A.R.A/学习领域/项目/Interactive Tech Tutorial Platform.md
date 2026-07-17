---
createTime: 2026-07-17 13:20
description:
multiFile:
multiMedia:
笔记ID: 20260717132034
笔记类型: 项目笔记
阐述日期:
---

##  Interactive Tech Tutorial Platform
```meta-bind-embed
[[笔记抬头模块]]
```
<progress value="10" max="100" style="width: 100%;"></progress>
## 提示词
```
我正在搭建一个**交互式技术教程平台**，类似 Vue3 官方互动教程(https://cn.vuejs.org/tutorial)，但定位更通用——不仅用于 React，未来可扩展至 Vue、JavaScript、算法等多个技术主题。

请帮我制定一份详尽的开发计划，项目核心要求如下：

### 一、项目定位
- 名称：暂定 "Interactive Tech Tutorial Platform"
- 核心价值：内容与引擎分离，通过配置化方式驱动交互式教学
- 目标：基于我的 React 学习笔记 @Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-react.canvas 和react官方文档https://react.dev/learn ，又能作为通用教具支持多主题扩展

### 二、技术选型（参考自 CodeWithAntonio 频道的最佳实践）
- **框架**：Next.js 15 (App Router) + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS v4
- **UI 组件库**：shadcn/ui (基于 Radix UI，源码可控)
- **数据库**：PostgreSQL + Drizzle ORM（用于存储用户进度等）
- **认证**：Clerk（可选，未来扩展用户系统）
- **部署**：Vercel

### 三、核心功能需求
1. **内容展示**：按章节/步骤展示学习笔记，支持 Markdown 或 MDX
2. **步骤引导**：上一步/下一步导航，清晰的进度指示
3. **页面交互**：高亮定位特定 UI 元素（按钮、输入框等），引导学习者操作
4. **等待机制**：教程可暂停，等待用户完成特定操作（点击、输入等）后再继续
5. **聚光灯效果**：模糊背景，聚焦当前操作元素
6. **代码沙箱**：嵌入可交互的代码编辑器（如 Monaco Editor），支持动态切换语言模式
7. **响应式设计**：完美适配 Web 端和移动端
8. **多主题扩展**：数据结构设计支持未来添加 Vue、JS 等新主题
9. 样式主题和交互方式可以参考网站：https://system-builder.aura.build/docs 和 https://cn.vuejs.org/tutorial

### 四、数据结构设计（参考 Schema）
```typescript
interface TutorialPackage {
  id: 'react' | 'vue' | 'javascript';
  meta: {
    title: string;
    description: string;
    language: string;      // 代码编辑器语言模式
    defaultCode: string;   // 默认代码模板
  };
  chapters: {
    id: string;
    title: string;
    steps: {
      id: string;
      selector: string;     // CSS 选择器，定位高亮元素
      title: string;
      description: string;  // 支持 Markdown
      waitFor: 'click' | 'input' | 'timer' | 'none';
      codeSnippet?: string; // 当前步骤展示的代码
    }[];
  }[];
}
```
