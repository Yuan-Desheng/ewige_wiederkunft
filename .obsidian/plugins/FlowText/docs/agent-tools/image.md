# image / image_gen — 文生图（FlowText 默认图片模型）

## 格式

- `[Action] image: 画面描述`
- `[Action] image: prompt="详细描述"`

## 说明

使用插件设置里配置的**默认图片生成模型**与保存路径；成功后 [Observation] 会给出 `![[...]]` 嵌入语法，可按需再用 `edit` 写入笔记。

## 失败常见原因

- 未配置图片模型或 API Key。
- `prompt` 为空。
- 提供商限流或超时。
