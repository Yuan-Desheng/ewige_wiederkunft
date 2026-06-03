# X (Twitter) 平台 API 接口文档

## Spider 概览

| Spider | 用途 | 用户来源 | 目标表 |
|--------|------|----------|--------|
| `x_profile` | 用户资料 | `leaders/x.json` | `tkh_social_media_users` |
| `x_user_post` | 用户推文 | DB `tkh_social_media_users` | `tkh_x_user_tweets` + `tkh_x_user_cursors` |

## API 端点

所有端点基础 URL: `https://api.tikhub.io`

### 1. 用户资料

- **Spider**: `x_profile`
- **端点**: `GET /api/v1/twitter/web/fetch_user_profile`
- **参数**: `screen_name` — X/Twitter 用户名
- **响应**: `data.data` 包含用户资料和统计

### 2. 用户推文

- **Spider**: `x_user_post`
- **端点**: `GET /api/v1/twitter/web/fetch_user_post_tweet`
- **参数**:
  - `screen_name` — 用户名
  - `rest_id` — 用户数字 ID（可选，首次可不传）
  - `cursor` — 分页游标（可选，分页时传入）
- **响应**: `data.data.tweets` 推文列表, `data.data.next_cursor` 下一页游标

## 调用流程

### 用户资料爬取
```
leaders/x.json → 逐用户 → fetch_user_profile → SocialMediaUserItem → Pipeline(300)
```

### 用户推文爬取
```
DB(X用户) → 逐用户 → fetch_user_post_tweet(screen_name)
  → 逐条解析推文 → XUserTweetItem → Pipeline(600)
  → 保存 XUserCursorItem → Pipeline(600)
  → next_cursor 不为空 → 下一页
  → created_at < start_date → 停止该用户
```

## 分页机制

- 游标类型: 字符串游标（`next_cursor`）
- 停止条件: `next_cursor` 为 `None` 或 `'null'`
- 游标持久化: `tkh_x_user_cursors` 表（复合索引 `user_rest_id + last_post_create_time`）
- 暂不支持 `start_cursor_mode=resume` 恢复模式

## 日期过滤

- 环境变量: `X_CRAWL_START_DATE` / `X_CRAWL_END_DATE`（`YYYY-MM-DD`）
- 比较方式: 解析推文 `created_at` 字符串（格式 `"Wed Jan 21 06:12:20 +0000 2026"`）为 `date` 对象
- 停止条件: `tweet_date < start_date` 时停止该用户分页
- 范围外推文跳过不存储

## 费用

| 端点 | 单次费用 | 免费额度可用 |
|------|---------|-------------|
| `fetch_user_profile` | $0.001 | 是 |
| `fetch_user_post_tweet` | $0.001–0.002 | 是 |

> X 平台所有端点均支持免费额度。

## 执行命令

```bash
source tikhub_scraper/venv311/bin/activate

# 1. 爬取用户资料（首次或用户变更时）
cd tikhub_scraper && scrapy crawl x_profile

# 2. 爬取用户推文
scrapy crawl x_user_post
```
