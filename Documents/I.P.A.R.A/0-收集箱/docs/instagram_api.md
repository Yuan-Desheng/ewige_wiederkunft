# Instagram 平台 API 接口文档

## Spider 概览

| Spider | 用途 | API 版本 | 用户来源 | 目标表 |
|--------|------|---------|----------|--------|
| `instagram_profile` | 用户资料 | V1 | `leaders/instagram.json` | `tkh_social_media_users` |
| `instagram` | 统一爬虫(V3) | V1+V3 | DB + `-a usernames=` | 多表（见下） |
| `instagram_user_posts_v2` | 用户帖子 | V1 | DB | `tkh_instagram_posts_v2_single` + `tkh_instagram_post_cursors` |

## API 端点

所有端点基础 URL: `https://api.tikhub.io`

### 1. 用户资料 — V1 API

- **Spider**: `instagram_profile`, `instagram`
- **端点**: `GET /api/v1/instagram/v1/fetch_user_info_by_username`
- **参数**: `username`
- **响应**: `data.data.data.user` 包含用户资料

### 2. 用户帖子 — V1 API (V2 端点)

- **Spider**: `instagram`, `instagram_user_posts_v2`
- **端点**: `GET /api/v1/instagram/v1/fetch_user_posts_v2`
- **参数**:
  - `user_id` — Instagram 数字用户 ID
  - `count` — 每页数量（默认 50，最大 50）
  - `end_cursor` — 分页游标（可选）
- **响应**: `data.data.data.user.edge_owner_to_timeline_media` 包含帖子列表和 `page_info`

### 3. 用户帖子 — V3 API

- **Spider**: `instagram`（crawl_type=posts 时使用）
- **端点**: `GET /api/v1/instagram/v3/get_user_posts`
- **参数**: `username`, 分页参数
- **目标表**: `tkh_instagram_v3_posts`

### 4. 用户 Reels — V3 API

- **Spider**: `instagram`（crawl_type=reels）
- **端点**: `GET /api/v1/instagram/v3/get_user_reels`
- **参数**: `username`, `first`(计数), `after`(游标, 可选)
- **目标表**: `tkh_instagram_v3_reels`

### 5. 账号详情 — V3 API

- **Spider**: `instagram`（crawl_type=about）
- **端点**: `GET /api/v1/instagram/v3/get_user_about`
- **参数**: `username`
- **目标表**: `tkh_instagram_v3_about`
- **数据**: 包含账号创建日期、曾用名、Facebook 关联等

## 调用流程

### instagram 统一爬虫（crawl_type=all, 默认）

```
DB(Instagram用户) → 逐用户
  ├─ V1: fetch_user_info_by_username → SocialMediaUserItem → Pipeline(300)
  ├─ V1: fetch_user_posts_v2 → InstagramV3PostsItem → Pipeline(920)
  ├─ V3: get_user_reels → InstagramV3ReelsItem → Pipeline(920)
  └─ V3: get_user_about → InstagramV3AboutItem → Pipeline(920)
```

### instagram_user_posts_v2 爬虫

```
DB(Instagram用户, user_id) → 逐用户 → fetch_user_posts_v2(count=50)
  → 逐页解析 → InstagramUserPostsV2Item → Pipeline(900)
  → 保存 InstagramPostCursorItem → Pipeline(900)
  → has_next_page=true → 下一页(end_cursor=上页返回值)
  → taken_at_timestamp < start_date → 停止
```

## 分页机制

| Spider | 游标字段 | 分页标志 | 游标表 |
|--------|---------|---------|--------|
| `instagram` (posts) | `end_cursor` | `has_next_page` | `tkh_instagram_post_cursors` |
| `instagram` (reels) | `after` | `has_next_page` | `tkh_instagram_post_cursors` |
| `instagram_user_posts_v2` | `end_cursor` | `has_next_page` | `tkh_instagram_post_cursors` |

## 日期过滤

- 环境变量: `INSTAGRAM_CRAWL_START_DATE` / `INSTAGRAM_CRAWL_END_DATE`（`YYYY-MM-DD`）
- 比较方式: `taken_at_timestamp`（Unix 时间戳）与日期范围对比
- 智能停止: `instagram_user_posts_v2` 从第 3 条开始判断
- `INSTAGRAM_CRAWL_ENABLED=false` 可跳过 Instagram 爬取

## 费用

| 端点 | 单次费用 | 免费额度可用 |
|------|---------|-------------|
| `fetch_user_info_by_username` | $0.001 | 是 |
| `fetch_user_posts_v2` | $0.001–0.003 | 是 |
| `get_user_posts` (V3) | $0.001 | 是 |
| `get_user_reels` (V3) | $0.001 | 是 |
| `get_user_about` (V3) | $0.001 | 是 |

> Instagram 所有端点均支持免费额度。

## 执行命令

```bash
source tikhub_scraper/venv311/bin/activate

# 1. 爬取用户资料（首次或用户变更时）
cd tikhub_scraper && scrapy crawl instagram_profile

# 2. V1 帖子爬虫
scrapy crawl instagram_user_posts_v2

# 3. V3 统一爬虫（全部类型）
scrapy crawl instagram

# 4. 仅爬取帖子
scrapy crawl instagram -a crawl_type=posts

# 5. 仅爬取 Reels
scrapy crawl instagram -a crawl_type=reels

# 6. 指定用户爬取
scrapy crawl instagram -a usernames=user1,user2
```
