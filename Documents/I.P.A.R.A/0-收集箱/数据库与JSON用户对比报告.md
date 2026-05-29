# 数据库与JSON用户数据对比报告

## 检查时间
2026-05-29

## 检查范围
- 数据库表：tkh_social_media_users
- JSON文件：instagram.json, tiktok.json, x.json, youtube.json

## 数据统计

| 平台 | 数据库用户 | JSON用户 | 缺失用户 | 匹配率 |
|------|-----------|---------|---------|--------|
| Instagram | 55 | 59 | 4 | 100% |
| TikTok | 21 | 23 | 2 | 100% |
| X | 0 | 10 | 10 | N/A |
| YouTube | 27 | 33 | 6 | 92.6% |
| **总计** | **103** | **125** | **22** | - |

## 缺失用户详情

### Instagram（4个）

| userName | displayName | 说明 |
|----------|-------------|------|
| harrylu1704 | Harry Lu (吕晋宇) | 新加坡模特 |
| into1_patrick | 尹浩宇 | INTO1成员 |
| limshiyu_ | 林诗于 | 华裔马来西亚博主 |
| wilson_weiteng | Wilson 魏腾 | 马来西亚主持人 |

### TikTok（2个）

| userName | displayName | 说明 |
|----------|-------------|------|
| rosshanaz | Rosshanaz | 马来西亚网红 |
| sufiehzny | Sufiehzny | 马来西亚网红 |

### X（10个）

| userName | displayName | 说明 |
|----------|-------------|------|
| agnezmo | Agnez Mo | 印尼歌手 |
| basuki_btp | Basuki T Purnama | 雅加达省长 |
| grace_nat | Grace Natalie | 印尼政治人物 |
| Joe_Taslim | Joe Taslim (乔·塔斯林) | 印尼影星 |
| mrbrown | Lee Kin Mun (李健敏 / mrbrown) | 新加坡博主 |
| newwiee | New Thitipoom (郑明心) | 泰国演员 |
| peach_pachara | Peach Pachara (帕查拉·奇拉锡瓦特) | 泰国演员 |
| Tawan_V | Tay Tawan (林阳) | 泰国演员 |
| winmetawin | Win Metawin (林汉洲) | 泰国演员 |
| xiaxue | Wendy Cheng (郑彦彦 / Xiaxue) | 新加坡博主 |

### YouTube（6个）

| userName | displayName | 说明 |
|----------|-------------|------|
| BoyWilliam | Boy William | 印尼主持人 |
| FeliciaPutriTjiasaka | Felicia Putri Tjiasaka | 印尼金融博主 |
| giangoi | Trần Lê Thu Giang | 越南主持人 |
| HyKhiDuongDuong | Hỷ Khí Dương Dương (喜气洋洋) | 越南文化博主 |
| HưngVlog1992 | Hưng Vlog | 越南YouTuber |
| KhánhVyOFFICIAL | Trần Khánh Vy（陈庆薇） | 越南主持人 |

## 问题分析

### 1. X平台数据完全缺失

**问题**: 数据库中X平台用户数为0

**原因**: 
- 可能之前没有执行过x_profile爬虫
- 或者x_profile爬虫有bug导致数据未写入数据库

**影响**: 
- 无法获取X平台用户的帖子数据
- 需要尽快补充这10个X用户的基础信息

### 2. 数据库编码问题

**问题**: 发现2个编码异常的用户名
- giang%c6%a0i
- kh%c3%a1nhvyofficial

**原因**: 
- 可能是爬取时的编码转换问题
- 需要修复这2个用户的数据

## 执行建议

### 方案一：完整爬取（推荐）

执行以下spider补充缺失用户：

```bash
# 1. Instagram - 补充4个用户
cd tikhub_scraper
scrapy crawl instagram_profile -a account=harrylu1704
scrapy crawl instagram_profile -a account=into1_patrick
scrapy crawl instagram_profile -a account=limshiyu_
scrapy crawl instagram_profile - a account=wilson_weiteng

# 2. TikTok - 补充2个用户
cd tikhub_scraper
scrapy crawl tiktok_profile -a account=rosshanaz
scrapy crawl tiktok_profile -a account=sufiehzny

# 3. X平台 - 完整爬取10个用户
cd tikhub_scraper
scrapy crawl x_profile -a account=agnezmo
scrapy crawl x_profile -a account=basuki_btp
scrapy crawl x_profile -a account=grace_nat
scrapy crawl x_profile -a account=Joe_Taslim
scrapy crawl x_profile -a account=mrbrown
scrapy crawl x_profile -a account=newwiee
scrapy crawl x_profile -a account=peach_pachara
scrapy crawl x_profile -a account=Tawan_V
scrapy crawl x_profile -a account=winmetawin
scrapy crawl x_profile -a account=xiaxue

# 4. YouTube - 补充6个用户
cd tikhub_scraper
scrapy crawl youtube_profile -a account=BoyWilliam
scrapy crawl youtube_profile -a account=FeliciaPutriTjiasaka
scrapy crawl youtube_profile -a account=giangoi
scrapy crawl youtube_profile -a account=HyKhiDuongDuong
scrapy crawl youtube_profile -a account=HưngVlog1992
scrapy crawl youtube_profile -a account=KhánhVyOFFICIAL
scrapy crawl youtube_profile -a account=NaomiNeo
scrapy crawl youtube_profile -a account=PheiYong
```

### 方案二：批量快速补充

使用TikHub API批量获取用户信息，直接写入数据库：

```python
# 创建批量补充脚本
# scripts/补充用户数据.py
```

### 方案三：保持现状

如果这些用户的帖子数据不是紧急需求，可以：
1. 在下次定期爬取时自然补充
2. 优先爬取X平台用户（因为目前为0）

## 优先级建议

### P0（高优先级）
- **X平台**: 10个用户完全缺失，建议尽快爬取
- **Instagram**: 4个用户是重点用户，建议补充

### P1（中优先级）
- **TikTok**: 2个用户
- **YouTube**: 6个用户

### P2（低优先级）
- 修复数据库编码问题（2个异常用户名）

## 预期执行时间

- 完整爬取22个用户：约30-60分钟
- 批量API补充：约5-10分钟

## 结论

✓ **建议执行人物爬取程序**

原因：
1. 有22个JSON用户在数据库中不存在
2. X平台数据完全缺失
3. 需要补充这些用户的基础信息后才能爬取其帖子数据

推荐使用方案一（完整爬取），确保数据完整性。
