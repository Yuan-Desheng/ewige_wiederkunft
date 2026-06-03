# TikTok 平台 API 接口文档

## Spider 概览

| Spider | 用途 | 用户来源 | 目标表 |
|--------|------|----------|--------|
| `tiktok_profile` | 用户资料 | `leaders/tiktok.json` | `tkh_social_media_users` |
| `tiktok_posts` | 用户帖子 | DB `tkh_social_media_users` | `tkh_tiktok_user_posts` + `tkh_tiktok_post_cursors` |
| `tiktok_video` | 单视频详情 | 硬编码列表 | `tkh_tiktok_videos` |

## API 端点

所有端点基础 URL: `https://api.tikhub.io`

### 1. 用户资料 — App V3 API

- **Spider**: `tiktok_profile`
- **端点**: `GET /api/v1/tiktok/app/v3/handler_user_profile`
- **参数**:
  - `sec_user_id` — 用户 secUid
  - `unique_id` — 用户名
- **响应结构**: `data.data.user` 包含用户信息, `data.data.stats.statsV2` 包含统计

### 2. 用户帖子 — App V3 API

- **Spider**: `tiktok_posts`
- **端点**: `GET /api/v1/tiktok/app/v3/fetch_user_post_videos`
- **参数**:
  - `sec_user_id` — secUid
  - `unique_id` — 用户名
  - `max_cursor` — 分页游标（从 0 开始）
  - `count` — 每页数量（固定 20）
  - `sort_type` — 排序（固定 0）
- **响应**: `data.data.aweme_list` 帖子列表, `data.data.has_more`, `data.data.max_cursor`

### 3. 单视频详情 — App V3 API

- **Spider**: `tiktok_video`
- **端点**: `GET /api/v1/tiktok/app/v3/fetch_one_video`
- **参数**: `aweme_id` — 视频 ID
- **响应**: `data.data.itemInfo.itemStruct`

## 调用流程

### 用户资料爬取
```
leaders/tiktok.json → 逐用户 → handler_user_profile → SocialMediaUserItem → Pipeline(300)
```

### 用户帖子爬取
```
DB(TikTok用户) → 逐用户 → fetch_user_post_videos(max_cursor=0)
  → 逐页解析 → TikTokUserPostItem → Pipeline(400)
  → 保存 TikTokPostCursorItem → Pipeline(400)
  → has_more=true → 下一页(max_cursor=上页返回值)
  → createTime < start_date → 停止该用户
```

## 分页机制

- 游标类型: 整数偏移量（`max_cursor`）
- 停止条件: `has_more == false` 或触发日期过滤
- 游标持久化: `tkh_tiktok_post_cursors` 表
- 恢复爬取: `scrapy crawl tiktok_posts -a start_cursor_mode=resume`

## 日期过滤

- 环境变量: `CRAWL_START_DATE` / `CRAWL_END_DATE`（格式 `YYYY-MM-DD`）
- 比较方式: 帖子的 `createTime`（Unix 时间戳）与日期范围对比
- 智能停止: 从第 3 条记录开始，如果 `createTime < start_date`，停止该用户分页

## 费用

| 端点 | 单次费用 | 免费额度可用 |
|------|---------|-------------|
| `handler_user_profile` | $0.001 | 是 |
| `fetch_user_post_videos` | $0.001 | **否（返回 402）** |
| `fetch_one_video` | $0.001 | 未确认 |

> TikTok 帖子端点不支持免费额度，需充值后使用。

## 执行命令

```bash
source tikhub_scraper/venv311/bin/activate

# 1. 爬取用户资料（首次或用户变更时）
cd tikhub_scraper && scrapy crawl tiktok_profile

# 2. 爬取用户帖子
scrapy crawl tiktok_posts

# 3. 从断点恢复爬取
scrapy crawl tiktok_posts -a start_cursor_mode=resume

# 4. 爬取单个视频详情
scrapy crawl tiktok_video
```
