# 爬虫执行命令文档

## 环境准备

```bash
cd /home/yuan/code/smart_vision/global-sentiment/tik-hub/tikhub_tiktok_scraper

# 激活 Python 虚拟环境（必须，不能用系统 conda 的 scrapy）
source tikhub_scraper/venv311/bin/activate

# 进入 Scrapy 项目目录
cd tikhub_scraper
```

## 各平台执行顺序

> **原则**: 先跑 profile 爬虫（写入用户表），再跑 posts 爬虫（从用户表读取）

### TikTok

```bash
# Step 1: 爬取用户资料
scrapy crawl tiktok_profile

# Step 2: 爬取用户帖子
scrapy crawl tiktok_posts

# 从断点恢复
scrapy crawl tiktok_posts -a start_cursor_mode=resume

# 爬取单视频详情（需修改 spider 中的硬编码列表）
scrapy crawl tiktok_video
```

### Instagram

```bash
# Step 1: 爬取用户资料
scrapy crawl instagram_profile

# Step 2a: V1 帖子爬虫
scrapy crawl instagram_user_posts_v2

# Step 2b: 或使用 V3 统一爬虫（推荐）
scrapy crawl instagram                          # 全部（profile+posts+reels+about）
scrapy crawl instagram -a crawl_type=posts      # 仅帖子
scrapy crawl instagram -a crawl_type=reels      # 仅 Reels
scrapy crawl instagram -a crawl_type=about      # 仅账号详情

# 指定用户
scrapy crawl instagram -a usernames=user1,user2
```

### X (Twitter)

```bash
# Step 1: 爬取用户资料
scrapy crawl x_profile

# Step 2: 爬取用户推文
scrapy crawl x_user_post
```

### YouTube

```bash
# Step 1: 爬取频道资料
scrapy crawl youtube_profile

# Step 2: 爬取频道视频列表
scrapy crawl youtube_channel_videos

# 从断点恢复
scrapy crawl youtube_channel_videos -a start_cursor_mode=resume

# Step 3: 补充视频详情（4步链式 API 调用）
scrapy crawl youtube_video_detail              # 默认处理 500 个视频
scrapy crawl youtube_video_detail -a limit=100 # 限制数量
scrapy crawl youtube_video_detail -a video_id=VIDEO_ID  # 单个视频
scrapy crawl youtube_video_detail -a skip_v1=true       # 跳过评论/点赞获取
```

## 批量执行

```bash
# 回到项目根目录
cd ..

# 一键执行 TikTok → Instagram → X
bash run_crawlers.sh
```

`run_crawlers.sh` 依次执行: `tiktok_posts` → `instagram_user_posts_v2` → `x_user_post`，完成后输出数据统计。

## 定时调度

```bash
# APScheduler 定时执行（默认每24小时跑一次 tiktok_profile）
python scheduler.py
```

可通过 `.env` 中 `CRAWL_INTERVAL_HOURS` 调整间隔。

## 诊断命令

```bash
# 查看各平台用户数、帖子数、最新数据时间
python check_project_status.py

# 初始化数据库表（首次部署）
python init_db.py
```

## 日期范围配置

编辑 `.env` 文件设置爬取日期范围：

```bash
# TikTok
CRAWL_START_DATE=2026-05-15
CRAWL_END_DATE=2026-05-31

# X (Twitter)
X_CRAWL_START_DATE=2026-05-15
X_CRAWL_END_DATE=2026-05-31

# Instagram
INSTAGRAM_CRAWL_START_DATE=2026-05-15
INSTAGRAM_CRAWL_END_DATE=2026-05-31
INSTAGRAM_CRAWL_ENABLED=true

# YouTube
YOUTUBE_CRAWL_START_DATE=2026-05-15
YOUTUBE_CRAWL_END_DATE=2026-05-31
```
