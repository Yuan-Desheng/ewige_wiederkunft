# 数据库表结构文档

数据库: MySQL 8.0 (`ruoyi-vue-pro` schema)，通过 SQLAlchemy ORM 管理。

## 表关系概览

```
yuqing_person (业务表)
  ↑ person_id
tkh_social_media_users (统一用户表，原始)
  ↓ platform + user_id
  ├─ tkh_tiktok_user_posts        (TikTok 帖子)
  ├─ tkh_tiktok_videos            (TikTok 视频详情)
  ├─ tkh_x_user_tweets            (X 推文)
  ├─ tkh_instagram_posts_v2_single (Instagram V2 帖子)
  ├─ tkh_instagram_v3_posts       (Instagram V3 帖子)
  ├─ tkh_instagram_v3_reels       (Instagram V3 Reels)
  ├─ tkh_instagram_v3_about       (Instagram V3 账号详情)
  └─ tkh_youtube_channel_videos   (YouTube 视频)
      ↓ video_id
      tkh_youtube_video_streams    (YouTube 视频流)

游标表（分页恢复用）:
  tkh_tiktok_post_cursors / tkh_x_user_cursors / tkh_instagram_post_cursors / tkh_youtube_video_cursors

聚合表（业务系统）:
  yuqing_leader_info → person_id → yuqing_person
```

---

## 一、原始表（Scrapy Pipeline 直接写入）

### 1.1 统一用户表

#### `tkh_social_media_users`

- **ORM 类**: `SocialMediaUser`
- **唯一键**: `(platform, user_id)` — 复合唯一约束 `uk_platform_user_id`
- **Pipeline**: `SocialMediaUserPipeline` (优先级 300)
- **用途**: 所有平台统一的用户资料表，存储用户身份、头像、统计等信息

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT AUTO_INCREMENT | 主键 |
| person_id | BIGINT, 索引 | 关联 yuqing_person.id |
| platform | VARCHAR(50) | 平台名：TikTok/Instagram/X (Twitter)/YouTube |
| user_id | VARCHAR(100) | 平台用户 ID |
| username | VARCHAR(150) | 用户名/句柄 |
| nickname | VARCHAR(200) | 显示名 |
| sec_uid | VARCHAR(200) | TikTok secUid |
| bio | TEXT | 个人简介 |
| avatar_url | VARCHAR(500) | 头像 URL |
| header_url | VARCHAR(500) | 封面图 URL |
| external_url | VARCHAR(500) | 外部链接 |
| location | VARCHAR(200) | 所在地 |
| language | VARCHAR(50) | 语言 |
| country | VARCHAR(100) | 国家 |
| follower_count | BIGINT | 粉丝数 |
| following_count | BIGINT | 关注数 |
| friend_count | BIGINT | 好友数 |
| post_count | BIGINT | 帖子数 |
| like_count | BIGINT | 获赞数 |
| is_verified | BOOLEAN | 是否认证 |
| is_private | BOOLEAN | 是否私密 |
| is_business | BOOLEAN | 是否商业账号 |
| account_creation_date | DATETIME | 账号创建日期 |
| raw_data | JSON | 原始 API 响应 |
| crawl_time | DATETIME | 爬取时间 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### 1.2 TikTok 帖子表

#### `tkh_tiktok_user_posts`

- **ORM 类**: `TikTokUserPost`
- **唯一键**: `aweme_id`
- **Pipeline**: `TikTokUserPostPipeline` (优先级 400)

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT AUTO_INCREMENT | 主键 |
| aweme_id | VARCHAR(64), 唯一 | 帖子 ID |
| sec_uid | VARCHAR(128), 索引 | 作者 secUid |
| desc | TEXT | 帖子描述 |
| create_time | DATETIME, 索引 | 发布时间 |
| video_url | VARCHAR(500) | 视频播放地址 |
| video_download_url | VARCHAR(500) | 视频下载地址 |
| cover_url | VARCHAR(500) | 封面图 |
| duration | INT | 视频时长(秒) |
| width/height | INT | 视频尺寸 |
| play_count | BIGINT | 播放数 |
| digg_count | BIGINT | 点赞数 |
| comment_count | BIGINT | 评论数 |
| share_count | BIGINT | 分享数 |
| collect_count | BIGINT | 收藏数 |
| author_nickname | VARCHAR(200) | 作者昵称 |
| challenges | JSON | 话题标签 |
| hashtags | JSON | 标签 |
| raw_data | JSON | 原始 API 响应 |

#### `tkh_tiktok_post_cursors` (游标表)

- **ORM 类**: `TikTokPostCursor`
- **复合索引**: `idx_user_sec_uid_time(user_sec_uid, last_post_create_time)`

| 列名 | 类型 | 说明 |
|------|------|------|
| user_sec_uid | VARCHAR(128) | 用户 secUid |
| page_cursor | VARCHAR(64) | 分页游标 |
| last_post_create_time | DATETIME | 最后一条帖子时间 |
| has_more | BOOLEAN | 是否有更多 |
| scraped_at | DATETIME | 记录时间 |

#### `tkh_tiktok_videos`

- **ORM 类**: `TikTokVideo`
- **唯一键**: `video_id`
- **Pipeline**: `TikTokVideoPipeline` (优先级 500)
- **用途**: 单视频详情 API 返回的更丰富数据（比 posts 表多：字幕、AIGC 信息、多个播放地址等）

---

### 1.3 X (Twitter) 推文表

#### `tkh_x_user_tweets`

- **ORM 类**: `XUserTweet`
- **唯一键**: `tweet_id`
- **Pipeline**: `XUserPipeline` (优先级 600)

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT AUTO_INCREMENT | 主键 |
| rest_id | VARCHAR(50), 索引 | 用户数字 ID |
| tweet_id | VARCHAR(50), 唯一 | 推文 ID |
| conversation_id | VARCHAR(50), 索引 | 对话 ID |
| text | TEXT | 推文内容 |
| lang | VARCHAR(10) | 语言 |
| bookmarks | BIGINT | 书签数 |
| favorites | BIGINT | 点赞数 |
| views | BIGINT | 浏览数 |
| quotes | BIGINT | 引用数 |
| replies | BIGINT | 回复数 |
| retweets | BIGINT | 转发数 |
| is_retweet | BOOLEAN, 索引 | 是否转发 |
| entities | JSON | 实体（标签、提及等） |
| media | JSON | 媒体 |
| created_at | DATETIME, 索引 | 发布时间 |
| raw_data | JSON | 原始 API 响应 |

#### `tkh_x_user_cursors` (游标表)

- **ORM 类**: `XUserCursor`
- **复合索引**: `idx_user_rest_id_time(user_rest_id, last_post_create_time)`

---

### 1.4 Instagram 表

#### `tkh_instagram_posts_v2_single` (V2 API 帖子)

- **ORM 类**: `InstagramPostsV2Single`
- **唯一键**: `post_id`
- **Pipeline**: `InstagramUserPostsV2Pipeline` (优先级 900)

| 列名 | 类型 | 说明 |
|------|------|------|
| post_id | VARCHAR(50), 唯一 | 帖子 ID |
| shortcode | VARCHAR(50) | 短链接码 |
| caption | TEXT | 标题 |
| owner_id | VARCHAR(50) | 作者 ID |
| owner_username | VARCHAR(100) | 作者用户名 |
| taken_at_timestamp | INT | 发布时间戳 |
| like_count | INT | 点赞数 |
| comment_count | INT | 评论数 |
| display_url | VARCHAR(500) | 图片 URL |
| video_url | VARCHAR(500) | 视频 URL |
| is_video | BOOLEAN | 是否视频 |
| raw_json | JSON | 原始响应 |

#### `tkh_instagram_v3_posts` (V3 API 帖子)

- **ORM 类**: `InstagramV3Posts`
- **唯一键**: `post_id`
- **Pipeline**: `InstagramV3Pipeline` (优先级 920)

#### `tkh_instagram_v3_reels` (V3 API Reels)

- **ORM 类**: `InstagramV3Reels`
- **唯一键**: `pk`
- **Pipeline**: `InstagramV3Pipeline` (优先级 920)

| 列名 | 类型 | 说明 |
|------|------|------|
| pk | VARCHAR(50), 唯一 | Reel ID |
| media_type | VARCHAR(20) | 媒体类型 |
| caption_text | TEXT | 标题 |
| like_count | INT | 点赞数 |
| play_count | INT | 播放数 |
| video_url | VARCHAR(500) | 视频 URL |
| video_duration | FLOAT | 视频时长 |
| taken_at | INT | 发布时间戳 |

#### `tkh_instagram_v3_about` (V3 API 账号详情)

- **ORM 类**: `InstagramV3About`
- **唯一键**: `user_id`
- **Pipeline**: `InstagramV3Pipeline` (优先级 920)

| 列名 | 类型 | 说明 |
|------|------|------|
| user_id | VARCHAR(50), 唯一 | 用户 ID |
| username | VARCHAR(100), 索引 | 用户名 |
| account_creation_date | VARCHAR(50) | 账号创建日期 |
| former_usernames | JSON | 曾用名 |
| is_private/is_verified/is_business | BOOLEAN | 账号属性 |
| follower_count/following_count | INT | 粉丝/关注数 |

#### `tkh_instagram_post_cursors` (共享游标表)

- **ORM 类**: `InstagramPostCursor`
- **复合索引**: `idx_user_id_time(user_id, last_post_create_time)`
- **用途**: V2 和 V3 爬虫共用此游标表

---

### 1.5 YouTube 表

#### `tkh_youtube_channel_videos`

- **ORM 类**: `YouTubeChannelVideo`
- **唯一键**: `video_id`
- **Pipeline**: `YouTubeVideoPipeline` (优先级 950)
- **两阶段写入**: 先写入基本数据（列表 API），后通过 detail 爬虫补充详情字段

| 列名 | 类型 | 说明 |
|------|------|------|
| video_id | VARCHAR(64), 唯一 | 视频 ID |
| channel_id | VARCHAR(128), 索引 | 频道 ID |
| title | VARCHAR(500) | 标题 |
| description | TEXT | 描述 |
| thumbnail | VARCHAR(500) | 缩略图 |
| duration | VARCHAR(50) | 时长字符串 |
| view_count | VARCHAR(50) | 观看数（原始字符串） |
| view_count_exact | BIGINT | 精确观看数（详情补充） |
| published_time | VARCHAR(100) | 发布时间（相对时间） |
| publish_date | DATETIME | 精确发布日期（详情补充） |
| keywords | JSON | 关键词（详情补充） |
| like_count | BIGINT | 点赞数（详情补充） |
| comment_count | BIGINT | 评论数（详情补充） |
| detail_fetched | BOOLEAN, 索引 | 详情是否已获取 |
| raw_data | JSON | 原始 API 响应 |

#### `tkh_youtube_video_streams`

- **ORM 类**: `YouTubeVideoStream`
- **唯一键**: `video_id`
- **用途**: 存储视频流格式信息（标准格式 + 自适应格式）

| 列名 | 类型 | 说明 |
|------|------|------|
| video_id | VARCHAR(64), 唯一 | 视频 ID |
| formats | JSON | 标准格式列表 |
| adaptive_formats | JSON | 自适应格式列表 |
| raw_data | JSON | 完整流信息 |

#### `tkh_youtube_video_cursors` (游标表)

- **ORM 类**: `YouTubeVideoCursor`
- **索引**: `idx_channel_id`
- **注意**: Pipeline 插入前删除该频道旧游标，每频道只保留最新

---

## 二、业务表（上游系统管理，无 ORM/Spider）

### `yuqing_person`

- **用途**: 人物主数据，存储人口统计信息（姓名、性别、年龄、职业等）
- **关系**: `tkh_social_media_users.person_id` → `yuqing_person.id`
- **SQL**: `SQL/yuqing_person.sql`

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT AUTO_INCREMENT | 主键 |
| name | VARCHAR(100) | 姓名 |
| gender | VARCHAR(10) | 性别 |
| age | INT | 年龄 |
| birthday | VARCHAR(50) | 生日 |
| occupation | VARCHAR(200) | 职业 |
| birth_place | VARCHAR(200) | 出生地 |
| subject | VARCHAR(200) | 主题 |
| domain | VARCHAR(200) | 领域 |
| living_place | VARCHAR(200) | 现居地 |
| education | VARCHAR(200) | 教育背景 |
| introduction | TEXT | 简介 |
| country | VARCHAR(100) | 国家 |
| deleted | TINYINT | 逻辑删除 |
| tenant_id | BIGINT | 租户 ID |

### `yuqing_leader_info`

- **用途**: 每个社交媒体账户的聚合统计（7天/30天帖子数、订阅数、粉丝数等）
- **关系**: `person_id` → `yuqing_person.id`
- **SQL**: `SQL/yuqing_leader_info.sql`

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT AUTO_INCREMENT | 主键 |
| platform | VARCHAR(50) | 平台 |
| subscribe_count | BIGINT | 订阅数 |
| post_count | BIGINT | 帖子数 |
| like_and_collect_count | BIGINT | 点赞收藏数 |
| seven_day_post_count | INT | 7天帖子数 |
| thirty_day_post_count | INT | 30天帖子数 |
| account | VARCHAR(200) | 账号名 |
| homepage | VARCHAR(500) | 主页 URL |
| person_id | BIGINT | 关联人物 ID |
| fans_count | BIGINT | 粉丝数 |
| follow_count | BIGINT | 关注数 |
| deleted | TINYINT | 逻辑删除 |
| tenant_id | BIGINT | 租户 ID |
