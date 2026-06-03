# YouTube 平台 API 接口文档

## Spider 概览

| Spider | 用途 | 用户来源 | 目标表 |
|--------|------|----------|--------|
| `youtube_profile` | 频道资料 | DB + `leaders/youtube.json` | `tkh_social_media_users` |
| `youtube_channel_videos` | 频道视频列表 | DB | `tkh_youtube_channel_videos` + `tkh_youtube_video_cursors` |
| `youtube_video_detail` | 视频详情(4步链) | DB | `tkh_youtube_channel_videos`(更新) + `tkh_youtube_video_streams` |

## API 端点

所有端点基础 URL: `https://api.tikhub.io`

### 1. 获取频道 ID

- **Spider**: `youtube_profile`（第1步）
- **端点**: `GET /api/v1/youtube/web_v2/get_channel_id`
- **参数**: `channel_url` — 频道 URL（URL 编码）
- **响应**: 返回 `channel_id`

### 2. 获取频道描述

- **Spider**: `youtube_profile`（第2步）
- **端点**: `GET /api/v1/youtube/web_v2/get_channel_description`
- **参数**: `channel_id`, `need_format=true`
- **响应**: 频道详细信息（标题、描述、订阅数等）

### 3. 获取频道视频列表

- **Spider**: `youtube_channel_videos`
- **端点**: `GET /api/v1/youtube/web_v2/get_channel_videos`
- **参数**:
  - `channel_id` — 频道 ID
  - `need_format=true`
  - `continuation_token` — 分页 token（可选）
- **响应**: 视频列表 + `continuation_token` + `has_more`

### 4. 视频详情 V2

- **Spider**: `youtube_video_detail`（第1步）
- **端点**: `GET /api/v1/youtube/web_v2/get_video_info_v2`
- **参数**: `video_id`, `need_format=true`
- **数据**: 精确发布日期、观看数、关键词、时长、章节、评分

### 5. 视频流信息

- **Spider**: `youtube_video_detail`（第2步）
- **端点**: `GET /api/v1/youtube/web_v2/get_video_streams_v2`
- **参数**: `video_id`
- **数据**: 标准格式 + 自适应格式的视频流 URL
- **目标表**: `tkh_youtube_video_streams`

### 6. 视频原始信息

- **Spider**: `youtube_video_detail`（第3步）
- **端点**: `GET /api/v1/youtube/web_v2/get_video_info`
- **参数**: `video_id`（不带 `need_format`）
- **数据**: 评论计数

### 7. 视频 V1 格式化信息

- **Spider**: `youtube_video_detail`（第4步）
- **端点**: `GET /api/v1/youtube/web_v2/get_video_info`
- **参数**: `video_id`, `need_format=true`
- **数据**: 点赞计数

## 调用流程

### 频道资料爬取（两步）

```
DB + leaders/youtube.json → 逐频道
  ├─ /c/ 格式 URL → get_channel_id → channel_id
  │   └─ 失败则尝试 /@ 格式 → get_channel_id → channel_id
  └─ get_channel_description(channel_id) → SocialMediaUserItem → Pipeline(300)
```

### 频道视频列表爬取

```
DB(YouTube用户) → 逐频道 → get_channel_videos(channel_id)
  → 逐视频解析 → YouTubeChannelVideoItem → Pipeline(950)
  → 保存 YouTubeVideoCursorItem → Pipeline(950)
  → has_more=true → 下一页(continuation_token)
  → 估算发布时间 < start_date → 停止
```

### 视频详情爬取（4 步链式调用，每个视频）

```
DB(未获取详情的视频) → 逐视频
  ├─ Step 1: get_video_info_v2 → 精确日期、关键词、时长
  ├─ Step 2: get_video_streams_v2 → 视频流 URL → YouTubeVideoStreamItem
  ├─ Step 3: get_video_info(无format) → 评论数
  └─ Step 4: get_video_info(有format) → 点赞数
  → 更新 tkh_youtube_channel_videos 记录（detail_fetched=true）
```

> 可用 `-a skip_v1=true` 跳过第 3、4 步（不获取评论数和点赞数）。

## 分页机制

| Spider | 游标类型 | 游标字段 | 游标表 | 恢复模式 |
|--------|---------|---------|--------|---------|
| `youtube_channel_videos` | 字符串 token | `continuation_token` | `tkh_youtube_video_cursors` | `-a start_cursor_mode=resume` |
| `youtube_video_detail` | 无分页 | — | — | — |

注意: Pipeline 插入游标前会删除该频道旧游标，每频道只保留最新游标。

## 日期过滤

- 环境变量: `YOUTUBE_CRAWL_START_DATE` / `YOUTUBE_CRAWL_END_DATE`（`YYYY-MM-DD`）
- **特殊**: YouTube API 返回相对时间（如 "3 months ago"、"2天前"）
- 解析函数 `_parse_relative_time()` 处理中文和英文相对时间格式
- 日期比较为近似值，非精确

## 费用

| 端点 | 单次费用 | 免费额度可用 |
|------|---------|-------------|
| `get_channel_id` | $0.001 | **否（返回 402）** |
| `get_channel_description` | $0.001–0.003 | **否（返回 402）** |
| `get_channel_videos` | $0.001 | **否（返回 402）** |
| `get_video_info_v2` | $0.001 | **否（返回 402）** |
| `get_video_streams_v2` | $0.003 | **否（返回 402）** |
| `get_video_info` | $0.001 | **否（返回 402）** |

> **YouTube 所有端点均不支持免费额度**，必须充值后使用。详情爬取每个视频需要 3-4 次 API 调用。

## 执行命令

```bash
source tikhub_scraper/venv311/bin/activate

# 1. 爬取频道资料（首次或频道变更时）
cd tikhub_scraper && scrapy crawl youtube_profile

# 2. 爬取频道视频列表
scrapy crawl youtube_channel_videos

# 3. 从断点恢复爬取
scrapy crawl youtube_channel_videos -a start_cursor_mode=resume

# 4. 爬取视频详情（4步链式）
scrapy crawl youtube_video_detail

# 5. 限制处理数量
scrapy crawl youtube_video_detail -a limit=100

# 6. 单个视频详情
scrapy crawl youtube_video_detail -a video_id=dQw4w9WgXcQ

# 7. 跳过评论和点赞
scrapy crawl youtube_video_detail -a skip_v1=true
```
