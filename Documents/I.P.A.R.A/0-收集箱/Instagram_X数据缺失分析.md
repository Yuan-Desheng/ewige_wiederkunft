---
createTime: 2026-05-30 14:45
笔记ID: 20260530144500
multiFile:
multiMedia:
description: Instagram 和 X 平台数据缺失分析与修改计划
笔记类型: 任务规划
阐述日期: 2026-05-30
tags:
  - 数据采集
  - Instagram
  - X
  - TikHub
  - 优化方案
aliases:
cssclasses:
卡片盒笔记主题:
---

## Instagram 和 X 平台数据缺失分析

### 当前数据状况

#### Instagram

| 指标 | 总数 | 有数据 | 覆盖率 | 状态 |
|------|------|--------|--------|------|
| 观看数 | 407 | 162 (仅视频) | 39.8% | ✅ 正常 |
| 转发数 | 407 | 0 | 0% | ✅ 正常（Instagram无转发） |
| 点赞数 | 407 | 343 | 84.3% | ⚠️ 15.7%缺失 |
| 评论数 | 407 | 406 | 99.8% | ✅ 正常 |
| 人物ID | 407 | 359 | 88.2% | ⚠️ 11.8%缺失 |
| 语种 | 407 | 0 | 0% | ❌ 全缺失 |

**说明**：
- 观看数：仅视频有观看数，162个视频100%覆盖，图片无观看数是正常的
- 转发数：Instagram没有转发功能（Repost是较新功能且API不返回）
- 点赞数：84.3%覆盖，缺失的可能需要重新爬取

#### X (Twitter)

| 指标 | 总数 | 有数据 | 覆盖率 | 状态 |
|------|------|--------|--------|------|
| 观看数 | 505 | 447 | 88.5% | ✅ 正常 |
| 转发数 | 505 | 485 | 96.0% | ✅ 正常 |
| 点赞数 | 505 | 102 | 20.2% | ❌ 79.8%缺失 |
| 评论数 | 505 | 96 | 19.0% | ❌ 81.0%缺失 |

**说明**：
- 观看数：88.5%覆盖，无观看数的是老推文（Twitter 2014年后才有观看数统计）
- 转发数：96%覆盖，4%无转发是正常的
- **点赞数和评论数覆盖率极低**，需要分析原因

---

### 问题分析

#### Instagram 问题

##### 1. 语种全为0

**根源**：`instagram_profile_spider.py:108` 硬编码 `language = None`

**原因**：TikHub Instagram API 不返回用户语言字段

**解决方案**：
- **方案A**：通过用户简介分析语言（使用语言检测库，如 `langdetect`）
- **方案B**：通过帖子内容分析语言（更准确）
- **方案C**：从用户资料的 `biography` 字段推断

**推荐**：方案B（通过帖子内容检测）

##### 2. 人物ID部分为空（11.8%）

**原因**：用户不在 `tkh_social_media_users` 表中

**解决方案**：
- 检查 `instagram_profile_spider` 是否正确写入 `tkh_social_media_users`
- 确认帖子 `owner_id` 与用户表 `user_id` 的映射关系

##### 3. 点赞数部分为0（15.7%）

**原因**：API 可能未返回或爬取失败

**解决方案**：
- 检查 `raw_json` 中是否有 `like_count` 字段
- 可能需要重新爬取缺失的帖子

#### X 问题

##### 1. 点赞数和评论数覆盖率极低

**源表统计**：
```
favorites: 102/505 (20.2%)
replies: 96/505 (19.0%)
```

**可能原因**：
1. **API 限制**：TikHub X API 对老推文可能不返回互动数据
2. **隐私设置**：部分用户设置限制了互动数据可见性
3. **数据字段映射问题**：爬虫可能未正确解析字段

**需要验证**：
- 检查 `x_user_post_spider.py` 的字段映射
- 查看 `raw_json` 中是否包含互动数据
- 对比有/无互动数据的推文特征

---

### TikHub API 端点分析

#### Instagram 可用端点

| 端点 | 当前使用 | 返回字段 | 备注 |
|------|---------|---------|------|
| `get_user_info` | ✅ 使用 | 用户基本信息 | 无语言字段 |
| `get_user_posts` | ✅ 使用 | 帖子列表 | 包含 like_count, comment_count |
| `get_user_posts_by_user_id` | ✅ 使用 | 按用户ID获取帖子 | 同上 |
| `get_tagged_posts` | ✅ 使用 | 标记用户的帖子 | 同上 |
| `get_post_detail` | ❌ 未使用 | 单个帖子详情 | 可能包含更完整数据 |
| `get_media_info` | ❌ 未使用 | 媒体信息 | 可能包含额外互动数据 |

#### X 可用端点

| 端点 | 当前使用 | 返回字段 | 备注 |
|------|---------|---------|------|
| `get_user_info` | ✅ 使用 | 用户基本信息 | - |
| `get_user_tweets` | ✅ 使用 | 用户推文列表 | 包含 views, retweets, replies, favorites |
| `get_tweet_detail` | ❌ 未使用 | 单条推文详情 | **可能包含更完整互动数据** |
| `get_search_tweets` | ❌ 未使用 | 搜索推文 | 可用于扩展数据源 |

---

### 修改计划

#### 阶段一：代码审查与问题诊断（低优先级）

**任务**：
1. 检查 `x_user_post_spider.py` 字段映射是否正确
2. 随机抽取10条无互动数据的推文，检查 `raw_json` 是否包含互动字段
3. 检查 Instagram 帖子的 `raw_json` 中 `like_count` 情况

**预期结果**：
- 确认是否是 API 限制或代码问题
- 如果是代码问题，修复爬虫
- 如果是 API 限制，评估替代方案

#### 阶段二：Instagram 语种补充（中优先级）

**方案**：通过帖子内容检测语言

**实施步骤**：
1. 安装语言检测库 `langdetect`
2. 修改 `convert_posts.py`，对 Instagram 帖子检测语言
3. 优先使用用户表语言，回退到内容检测

**代码修改**：
```python
# scripts/convert_posts.py

from langdetect import detect, LangDetectException

def _detect_language(text):
    """检测文本语言"""
    if not text or len(text.strip()) < 10:
        return None
    try:
        lang = detect(text)
        # 映射到我们的语言代码
        lang_map = {
            'en': 'en', 'zh': 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh',
            'id': 'id', 'ja': 'ja', 'ko': 'ko', 'th': 'th',
            'vi': 'vi', 'ms': 'ms', 'tl': 'tl'
        }
        return lang_map.get(lang, lang)
    except LangDetectException:
        return None

# Instagram 转换部分
for post_id, caption, ...:
    info = platform_user_map.get(("Instagram", owner_id))
    person_id, username, user_country, user_language = info if info else (None, "", "", "")
    
    # 语言检测：优先用户表，回退到内容检测
    detected_lang = _detect_language(caption)
    final_language = user_language or detected_lang or ""
```

#### 阶段三：X 数据补充（低优先级，需先诊断）

**前提**：阶段一确认问题根源

**可能的方案**：
1. **如果是代码问题**：修复 `x_user_post_spider.py` 字段映射
2. **如果是 API 限制**：考虑调用 `get_tweet_detail` 端点补充数据
3. **如果是隐私限制**：无法解决，接受数据现状

#### 阶段四：数据质量监控（低优先级）

**建立监控指标**：
- 各平台数据覆盖率
- 各字段缺失率
- 爬虫成功率

**定期报告**：
- 每周生成数据质量报告
- 识别数据异常及时修复

---

### 实施优先级

| 阶段 | 优先级 | 预计工作量 | 预期收益 |
|------|--------|-----------|---------|
| 阶段一：问题诊断 | P1 | 2小时 | 明确问题根源 |
| 阶段二：Instagram 语种 | P2 | 4小时 | 语种覆盖率 0% → 70%+ |
| 阶段三：X 数据补充 | P3 | 取决于诊断 | 待评估 |
| 阶段四：监控体系 | P3 | 8小时 | 长期数据质量保障 |

---

### 结论

#### Instagram
- ✅ 观看数、转发数、评论数现状正常（平台特性）
- ⚠️ 点赞数 84.3% 覆盖率可接受
- ❌ 语种全缺失需解决
- ⚠️ 人物ID 11.8% 缺失需检查

#### X (Twitter)
- ✅ 观看数、转发数现状正常
- ❌ 点赞数、评论数覆盖率极低（20% / 19%）
- **需先诊断问题根源**：是 API 限制还是代码问题

#### 下一步行动
1. **立即执行**：阶段一问题诊断（2小时）
2. **优先执行**：阶段二 Instagram 语种补充（4小时）
3. **待评估**：阶段三根据诊断结果决定
