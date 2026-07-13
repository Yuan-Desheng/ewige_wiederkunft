---
createTime: 2026-07-13 18:00
笔记ID: 20260713180000
multiFile:
multiMedia:
description: 用 Meilisearch 重建海外舆情系统「检索库」——多字段全文检索 + 人物/帖子/事件聚合 + 左侧 facet 筛选；含 yudao 后端接入、Vue3 前端、docker-compose 部署与三大踩坑
笔记类型: 收集笔记
阐述日期:
tags:
  - Meilisearch
  - 全文检索
  - SpringBoot
  - Vue3
  - docker
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/工作领域/归档/卡片盒笔记主题索引卡/海媒传播分析系统.canvas|海媒传播分析系统]]"
---

## 海外舆情检索库-Meilisearch重构

```meta-bind-embed
[[笔记抬头模块]]
```

> 定位：把海外舆情系统原来「多个 `LIKE %kw%` 分页接口在前端硬拼」的检索库，重建为 Meilisearch 驱动的真检索——单框全字段全文匹配 + 人物/帖子/事件三类聚合 + 左侧 facet 筛选。来源项目：`overseas-sentiment`（后端 yudao/芋道 SpringBoot3 + 前端 Vite+Vue3+ElementPlus）。用于复现到其它「yudao + Vue 需要聚合检索」的项目。凭据已【已脱敏】。

## 〇、功能介绍（对客户描述）

「检索库」是海外舆情系统的**全局检索入口**——用户只需在一个搜索框里输入关键词，即可跨**人物、帖子、事件**三类数据一次性检索，并通过左侧筛选面板快速收敛结果。相比旧版「只能按单一字段模糊查」，本次重构引入专业检索引擎（Meilisearch），检索更准、更全、更快。

**核心能力**

1. **全字段全文检索**：搜索框对**标题、名称、正文、简介、标签、关键词**（含各字段的中文翻译）统一模糊匹配，不再局限单一字段；一个词打全库。
2. **三类实体聚合展示**：搜索结果同时呈现**人物 / 帖子 / 事件**，混排在同一结果流中，按相关性排序，命中关键词自动**高亮**。
3. **左侧筛选面板（facet）**：可按**实体类型、平台（TikTok/Instagram/X/YouTube/Facebook）、国家/地区、时间范围、标签/关键词**逐项过滤，每个筛选项**实时显示命中数量**，点选即缩小范围。
4. **多语言 & 拼写容错**：面向海外多语种内容，支持中英等多语言分词，输入有拼写差异也能命中。
5. **真实分页与详情直达**：结果支持传统翻页、显示真实总条数；点击任一结果卡片可直接跳转到对应的人物库/帖子库/事件库详情页。

**一句话价值**：把原来「搜不准、搜不全、要在多个页面来回找」的体验，升级为「一个框搜全库、左侧一键筛选、结果聚合直达」的统一检索体验。

> 当前线上已灌入数据规模（示例）：人物约 100+、帖子约 1 万+、事件约 1000+，检索毫秒级响应。

## 一、原理

**要解决的问题**：原检索库无检索引擎，`LIKE '%kw%'` 单表单字段、前导通配全表扫描、无相关性排序、无聚合、无筛选面板。客户要「全字段模糊匹配 + 三类实体聚合 + 左侧筛选」。

**选型**：Meilisearch（对比 MySQL fulltext / ES）。万级数据、单台 ECS、多语言、要 facet 的甜区——运维最轻、开箱带多语言分词/拼写容错/相关性排序/高亮/facet 聚合。

**数据流**：

```text
yuqing_person / yuqing_post_info / yuqing_event_info (+ tag 关联表)   ← MySQL 真源
        │  全量重建（手动 rebuild 端点；本期不做增量同步）
        ▼
   Meilisearch  ── 3 个 typed index：yuqing_persons / yuqing_posts / yuqing_events
        │  后端对被选中的 index 各查一页 + facetDistribution，合并
        ▼
后端 SearchController  GET /admin-api/system/search/portal（@PermitAll）
        │  REST（入参 facet 过滤；出参 facet 计数 + 真实 total）
        ▼
前端 global-sentiment-web  searchLibraryList 页面（搜索框 + 左侧 facet + 聚合结果 + 传统分页）
```

**索引设计**（三个 typed index，异构实体分开、相关性更干净；`tags` 字段既 searchable 又 filterable）：

| index | searchable（全文） | filterable（facet/过滤） | sortable |
|---|---|---|---|
| `yuqing_persons` | name, introduction, subject, domain, interestTopic, occupation | type, country | （无） |
| `yuqing_posts` | postTitle(+译), postContent(+译), postKeywords(+译), postTopic, postTheme, postAuthor, postPersonName, **tags** | type, platform, country, postTimeTs, tags | postHeat, postTimeTs |
| `yuqing_events` | title, detail, subject, field, **tags** | type, platform, country, beginTimeTs, tags | beginTimeTs |

- 时间过滤需数值：帖子/事件时间存 epoch 秒（`postTimeTs`/`beginTimeTs`）；**人物无时间字段，时间筛选对人物不生效**。
- `total` 是被查 index 的 `estimatedTotalHits` 之和（真实总数，非当前页三类 size 相加）。
- 标签来自 tag 关联表 + `postKeywords` 拆分。

## 二、代码

### 后端 backend-server（yudao-module-system）

**依赖**：`yudao-dependencies/pom.xml` 的 `<properties>` 加 `<meilisearch-java.version>0.14.4</meilisearch-java.version>`（并在 dependencyManagement 声明 `com.meilisearch.sdk:meilisearch-java`）；`yudao-module-system/pom.xml` 引依赖不写 version。踩坑见「五、踩坑记录」okhttp 一节。

**MeilisearchProperties.java**（`framework/search/config/`）

```java
@ConfigurationProperties(prefix = "yudao.meilisearch")
@Validated
@Data
public class MeilisearchProperties {
    @NotEmpty(message = "Meilisearch host 不能为空")
    private String host;
    /** Master / API Key（生产从环境变量注入，勿明文提交） */
    private String apiKey;
    /** 是否启用（false 时不建 index、检索走空结果，便于本地未部署 Meili 时不报错） */
    private Boolean enabled = true;
}
```

**YudaoMeilisearchConfiguration.java**（`framework/search/config/`）

```java
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(MeilisearchProperties.class)
public class YudaoMeilisearchConfiguration {
    @Bean
    public Client meilisearchClient(MeilisearchProperties properties) {
        return new Client(new Config(properties.getHost(), properties.getApiKey()));
    }
}
```

**MeiliIndexConst.java**（`framework/search/core/`）

```java
public interface MeiliIndexConst {
    String PERSONS = "yuqing_persons";
    String POSTS = "yuqing_posts";
    String EVENTS = "yuqing_events";
    String PRIMARY_KEY = "id";
    String F_TYPE = "type";
    String F_TAGS = "tags";
    String F_COUNTRY = "country";
    String F_PLATFORM = "platform";

    String[] PERSON_SEARCHABLE = {"name", "introduction", "subject", "domain", "interestTopic", "occupation"};
    String[] PERSON_FILTERABLE = {F_TYPE, F_COUNTRY};
    String[] PERSON_SORTABLE = {};

    // tags 既 searchable 又 filterable，满足"对标签模糊匹配"
    String[] POST_SEARCHABLE = {"postTitle", "postTitleTranslation", "postContent", "postTranslation",
            "postKeywords", "postKeywordsTranslation", "postTopic", "postTheme", "postAuthor", "postPersonName", "tags"};
    String[] POST_FILTERABLE = {F_TYPE, F_PLATFORM, F_COUNTRY, "postTimeTs", F_TAGS};
    String[] POST_SORTABLE = {"postHeat", "postTimeTs"};

    String[] EVENT_SEARCHABLE = {"title", "detail", "subject", "field", "tags"};
    String[] EVENT_FILTERABLE = {F_TYPE, F_PLATFORM, F_COUNTRY, "beginTimeTs", F_TAGS};
    String[] EVENT_SORTABLE = {"beginTimeTs"};
}
```

**MeiliErrors.java**（`framework/search/core/`）——⭐ 防崩关键，见踩坑②

```java
public final class MeiliErrors {
    private MeiliErrors() {}

    /** 安全地取异常文本；即使 getMessage() 抛异常也只返回类名，绝不向上抛。 */
    public static String safeMessage(Throwable e) {
        if (e == null) {
            return "null";
        }
        try {
            String m = e.getMessage();
            return e.getClass().getSimpleName() + ": " + (m == null ? "(no message)" : m);
        } catch (Throwable inner) {
            return e.getClass().getName() + " (getMessage 抛异常)";
        }
    }
}
```

**MeiliIndexInitializer.java**（`framework/search/core/`）——启动幂等建 index + 下发 settings，任何异常只降级不阻断启动

```java
@Slf4j
@Component
public class MeiliIndexInitializer implements ApplicationRunner {

    @Resource
    private Client client;
    @Resource
    private MeilisearchProperties properties;

    @Override
    public void run(ApplicationArguments args) {
        if (Boolean.FALSE.equals(properties.getEnabled())) {
            log.info("[MeiliIndexInitializer] meilisearch 未启用，跳过 index 初始化");
            return;
        }
        // 每个 index 独立初始化：单个失败不影响其它，且任何异常（含 SDK 自身 getMessage NPE）都只降级、绝不阻断启动
        boolean ok = safeInit(MeiliIndexConst.PERSONS, MeiliIndexConst.PERSON_SEARCHABLE,
                MeiliIndexConst.PERSON_FILTERABLE, MeiliIndexConst.PERSON_SORTABLE);
        ok = safeInit(MeiliIndexConst.POSTS, MeiliIndexConst.POST_SEARCHABLE,
                MeiliIndexConst.POST_FILTERABLE, MeiliIndexConst.POST_SORTABLE) && ok;
        ok = safeInit(MeiliIndexConst.EVENTS, MeiliIndexConst.EVENT_SEARCHABLE,
                MeiliIndexConst.EVENT_FILTERABLE, MeiliIndexConst.EVENT_SORTABLE) && ok;
        if (ok) {
            log.info("[MeiliIndexInitializer] 三个检索 index 初始化完成");
        } else {
            log.warn("[MeiliIndexInitializer] 部分或全部 index 初始化失败，检索能力可能不可用（不阻断启动）");
        }
    }

    private boolean safeInit(String uid, String[] searchable, String[] filterable, String[] sortable) {
        try {
            initIndex(uid, searchable, filterable, sortable);
            return true;
        } catch (Throwable e) {
            log.error("[MeiliIndexInitializer] index={} 初始化失败（不阻断启动）：{}", uid, MeiliErrors.safeMessage(e));
            return false;
        }
    }

    private void initIndex(String uid, String[] searchable, String[] filterable, String[] sortable) throws Exception {
        try {
            client.createIndex(uid, MeiliIndexConst.PRIMARY_KEY); // 幂等：已存在会抛，忽略
        } catch (Exception ignore) {
        }
        Index index = client.index(uid);
        index.updateSearchableAttributesSettings(searchable);
        index.updateFilterableAttributesSettings(filterable);
        if (sortable.length > 0) {
            index.updateSortableAttributesSettings(sortable);
        }
    }
}
```

**SearchDocMapper.java**（`service/search/dochelper/`）——DO → Meili 文档，纯逻辑

```java
public class SearchDocMapper {

    private static Long toEpoch(LocalDateTime t) {
        return t == null ? null : t.toEpochSecond(ZoneOffset.UTC);
    }

    public static Map<String, Object> toPersonDoc(PersonDO p) {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("id", p.getId());
        doc.put("type", "person");
        doc.put("name", p.getName());
        doc.put("introduction", p.getIntroduction());
        doc.put("subject", p.getSubject());
        doc.put("domain", p.getDomain());
        doc.put("interestTopic", p.getInterestTopic());
        doc.put("occupation", p.getOccupation());
        doc.put("country", p.getCountry());
        doc.put("avatar", p.getAvatar());
        return doc;
    }

    public static Map<String, Object> toPostDoc(PostInfoDO post, List<String> tags) {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("id", post.getId());
        doc.put("type", "post");
        doc.put("postTitle", post.getPostTitle());
        doc.put("postTitleTranslation", post.getPostTitleTranslation());
        doc.put("postContent", post.getPostContent());
        doc.put("postTranslation", post.getPostTranslation());
        doc.put("postKeywords", post.getPostKeywords());
        doc.put("postKeywordsTranslation", post.getPostKeywordsTranslation());
        doc.put("postTopic", post.getPostTopic());
        doc.put("postTheme", post.getPostTheme());
        doc.put("postAuthor", post.getPostAuthor());
        doc.put("postPersonName", post.getPostPersonName());
        doc.put("platform", post.getPostPlatform());
        doc.put("country", post.getPostCountry());
        doc.put("postTimeTs", toEpoch(post.getPostTime()));
        doc.put("postTime", post.getPostTime() != null ? post.getPostTime().toString() : null);
        doc.put("postHeat", post.getPostHeat());
        List<String> merged = new ArrayList<>();
        if (tags != null) {
            merged.addAll(tags);
        }
        merged.addAll(splitKeywords(post.getPostKeywords()));
        doc.put("tags", merged.stream().distinct().collect(Collectors.toList()));
        return doc;
    }

    public static Map<String, Object> toEventDoc(EventInfoDO e, List<String> tags) {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("id", e.getId());
        doc.put("type", "event");
        doc.put("title", e.getTitle());
        doc.put("detail", e.getDetail());
        doc.put("subject", e.getSubject());
        doc.put("field", e.getField());
        doc.put("platform", e.getPlatform());
        doc.put("country", e.getCountry());
        doc.put("beginTimeTs", toEpoch(e.getBeginTime()));
        doc.put("beginTime", e.getBeginTime() != null ? e.getBeginTime().toString() : null);
        doc.put("tags", tags == null ? List.of() : tags.stream().distinct().collect(Collectors.toList()));
        return doc;
    }

    /** 把 "AI,科技; 芯片" 拆成列表（支持逗号/分号/中文逗号/中文分号，去空） */
    public static List<String> splitKeywords(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(raw.split("[,;，；]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
```

**SearchIndexServiceImpl.java**（`service/search/`）——全量重建：读全表 + 两步查标签 + push

```java
@Slf4j
@Service
public class SearchIndexServiceImpl implements SearchIndexService {

    private static final Gson GSON = new Gson();

    @Resource private Client client;
    @Resource private PersonMapper personMapper;
    @Resource private PostInfoMapper postInfoMapper;
    @Resource private EventInfoMapper eventInfoMapper;
    @Resource private PostTagMapper postTagMapper;
    @Resource private EventTagMapper eventTagMapper;
    @Resource private TagInfoMapper tagInfoMapper;

    @Override
    public void rebuildAll() {
        rebuildPersons();
        rebuildPosts();
        rebuildEvents();
        log.info("[rebuildAll] 检索索引全量重建完成");
    }

    private void push(String uid, List<Map<String, Object>> docs) throws Exception {
        com.meilisearch.sdk.Index index = client.index(uid);
        index.deleteAllDocuments();
        if (!docs.isEmpty()) {
            index.addDocuments(GSON.toJson(docs), MeiliIndexConst.PRIMARY_KEY);
        }
    }

    private void rebuildPersons() {
        try {
            List<PersonDO> list = personMapper.selectList();
            List<Map<String, Object>> docs = list.stream()
                    .map(SearchDocMapper::toPersonDoc).collect(Collectors.toList());
            push(MeiliIndexConst.PERSONS, docs);
        } catch (Exception e) {
            log.error("[rebuildPersons] 失败", e);
        }
    }

    private void rebuildPosts() {
        try {
            List<PostInfoDO> list = postInfoMapper.selectList();
            List<Long> ids = list.stream().map(PostInfoDO::getId).collect(Collectors.toList());
            Map<Long, List<String>> tagMap = buildPostTagMap(ids);
            List<Map<String, Object>> docs = list.stream()
                    .map(p -> SearchDocMapper.toPostDoc(p, tagMap.getOrDefault(p.getId(), Collections.emptyList())))
                    .collect(Collectors.toList());
            push(MeiliIndexConst.POSTS, docs);
        } catch (Exception e) {
            log.error("[rebuildPosts] 失败", e);
        }
    }

    private void rebuildEvents() {
        try {
            List<EventInfoDO> list = eventInfoMapper.selectList();
            List<Long> ids = list.stream().map(EventInfoDO::getId).collect(Collectors.toList());
            Map<Long, List<String>> tagMap = buildEventTagMap(ids);
            List<Map<String, Object>> docs = list.stream()
                    .map(e -> SearchDocMapper.toEventDoc(e, tagMap.getOrDefault(e.getId(), Collections.emptyList())))
                    .collect(Collectors.toList());
            push(MeiliIndexConst.EVENTS, docs);
        } catch (Exception e) {
            log.error("[rebuildEvents] 失败", e);
        }
    }

    /** postId -> [tagName...]，两步查：relation → tag_info */
    private Map<Long, List<String>> buildPostTagMap(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<PostTagDO> relations = postTagMapper.selectListByPostIds(postIds);
        Map<Long, String> tagNameById = loadTagNames(
                relations.stream().map(PostTagDO::getTagId).distinct().collect(Collectors.toList()));
        return relations.stream()
                .filter(r -> tagNameById.containsKey(r.getTagId()))
                .collect(Collectors.groupingBy(PostTagDO::getPostId,
                        Collectors.mapping(r -> tagNameById.get(r.getTagId()), Collectors.toList())));
    }

    private Map<Long, List<String>> buildEventTagMap(List<Long> eventIds) {
        if (eventIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<EventTagDO> relations = eventTagMapper.selectListByEventIds(eventIds);
        Map<Long, String> tagNameById = loadTagNames(
                relations.stream().map(EventTagDO::getTagId).distinct().collect(Collectors.toList()));
        return relations.stream()
                .filter(r -> tagNameById.containsKey(r.getTagId()))
                .collect(Collectors.groupingBy(EventTagDO::getEventId,
                        Collectors.mapping(r -> tagNameById.get(r.getTagId()), Collectors.toList())));
    }

    private Map<Long, String> loadTagNames(List<Long> tagIds) {
        if (tagIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return tagInfoMapper.selectBatchIds(tagIds).stream()
                .collect(Collectors.toMap(TagInfoDO::getId, TagInfoDO::getTagName, (a, b) -> a));
    }
}
```

**SearchServiceImpl.java**（`service/search/`）——聚合检索。注意 SDK 0.14.4 的适配（见踩坑③）

```java
@Slf4j
@Service
public class SearchServiceImpl implements SearchService {

    @Resource
    private Client client;

    @Override
    public PortalSearchResultVO search(SearchReq req) {
        String kw = req.keyword();
        if (kw == null || kw.trim().isEmpty()) {
            return PortalSearchResultVO.builder().total(0L)
                    .persons(List.of()).posts(List.of()).events(List.of())
                    .facets(Facets.builder().type(Map.of()).platform(Map.of()).country(Map.of()).tag(Map.of()).build())
                    .build();
        }
        int pageNo = req.pageNo() == null || req.pageNo() < 1 ? 1 : req.pageNo();
        int pageSize = req.pageSize() == null || req.pageSize() < 1 ? 10 : req.pageSize();
        int offset = (pageNo - 1) * pageSize;

        String type = req.type() == null ? "all" : req.type();
        boolean all = "all".equals(type);
        boolean wantPerson = all || "person".equals(type);
        boolean wantPost = all || "post".equals(type);
        boolean wantEvent = all || "event".equals(type);

        long total = 0;
        Map<String, Integer> typeFacet = new HashMap<>();
        List<Map<String, Map<String, Integer>>> dists = new ArrayList<>();

        List<PortalSearchResultVO.SearchPersonItem> persons = List.of();
        List<PortalSearchResultVO.SearchPostItem> posts = List.of();
        List<PortalSearchResultVO.SearchEventItem> events = List.of();

        if (wantPerson) {
            QueryResult r = query(MeiliIndexConst.PERSONS, kw, req, offset, pageSize, new String[]{"country"});
            persons = new ArrayList<>();
            for (Map<String, Object> h : r.hits) {
                persons.add(SearchResultAssembler.toPersonItem(h));
            }
            total += r.estimatedTotalHits;
            typeFacet.put("person", r.estimatedTotalHits);
            dists.add(r.facetDistribution);
        }
        if (wantPost) {
            QueryResult r = query(MeiliIndexConst.POSTS, kw, req, offset, pageSize,
                    new String[]{"platform", "country", "tags"});
            posts = new ArrayList<>();
            for (Map<String, Object> h : r.hits) {
                posts.add(SearchResultAssembler.toPostItem(h));
            }
            total += r.estimatedTotalHits;
            typeFacet.put("post", r.estimatedTotalHits);
            dists.add(r.facetDistribution);
        }
        if (wantEvent) {
            QueryResult r = query(MeiliIndexConst.EVENTS, kw, req, offset, pageSize,
                    new String[]{"platform", "country", "tags"});
            events = new ArrayList<>();
            for (Map<String, Object> h : r.hits) {
                events.add(SearchResultAssembler.toEventItem(h));
            }
            total += r.estimatedTotalHits;
            typeFacet.put("event", r.estimatedTotalHits);
            dists.add(r.facetDistribution);
        }

        Facets facets = Facets.builder()
                .type(typeFacet)
                .platform(SearchResultAssembler.mergeFacet(dists, "platform"))
                .country(SearchResultAssembler.mergeFacet(dists, "country"))
                .tag(SearchResultAssembler.mergeFacet(dists, "tags"))
                .build();

        return PortalSearchResultVO.builder()
                .total(total).persons(persons).posts(posts).events(events).facets(facets).build();
    }

    // index.search(SearchRequest) 在 0.14.4 声明返回 Searchable（兼容 page/hitsPerPage 分页形态）；
    // 只用 offset/limit 时服务端返回非分页形态，可安全强转 SearchResult。SearchResult 只有 getter、
    // 无 setter，失败时改用内部 QueryResult 承载空结果，保持"失败返回空、不抛异常"。
    private QueryResult query(String uid, String kw, SearchReq req, int offset, int limit, String[] facets) {
        try {
            String[] filters = SearchFilterBuilder.build(uid, req.platform(), req.country(),
                    req.timeFromTs(), req.tags());
            SearchRequest sr = SearchRequest.builder()
                    .q(kw).offset(offset).limit(limit)
                    .filter(filters.length == 0 ? null : filters)
                    .facets(facets)
                    .attributesToHighlight(new String[]{"*"})
                    .highlightPreTag("<mark>").highlightPostTag("</mark>")
                    .build();
            Index index = client.index(uid);
            SearchResult r = (SearchResult) index.search(sr);
            List<Map<String, Object>> hits = new ArrayList<>(r.getHits());
            return new QueryResult(hits, r.getEstimatedTotalHits(), toFacetMap(r.getFacetDistribution()));
        } catch (Throwable e) {
            log.error("[query] index={} 检索失败（降级为空结果）：{}", uid, MeiliErrors.safeMessage(e));
            return new QueryResult(List.of(), 0, Collections.emptyMap());
        }
    }

    // getFacetDistribution() 声明返回 Object：SDK 用 Gson 无类型反序列化，数值会变 Double；
    // 这里用 Number.intValue() 收窄，避免直接 (Integer) 强转导致 ClassCastException。
    @SuppressWarnings("unchecked")
    private static Map<String, Map<String, Integer>> toFacetMap(Object raw) {
        if (!(raw instanceof Map)) {
            return Collections.emptyMap();
        }
        Map<String, Map<String, Integer>> result = new HashMap<>();
        ((Map<String, Object>) raw).forEach((facetName, val) -> {
            if (!(val instanceof Map)) {
                return;
            }
            Map<String, Integer> inner = new HashMap<>();
            ((Map<String, Object>) val).forEach((k, v) -> {
                if (v instanceof Number) {
                    inner.put(k, ((Number) v).intValue());
                }
            });
            result.put(facetName, inner);
        });
        return result;
    }

    private static class QueryResult {
        final List<Map<String, Object>> hits;
        final int estimatedTotalHits;
        final Map<String, Map<String, Integer>> facetDistribution;
        QueryResult(List<Map<String, Object>> hits, int estimatedTotalHits,
                    Map<String, Map<String, Integer>> facetDistribution) {
            this.hits = hits;
            this.estimatedTotalHits = estimatedTotalHits;
            this.facetDistribution = facetDistribution;
        }
    }
}
```

**SearchController.java**（`controller/admin/postinfo/`）——保留 `/portal` URL + `@PermitAll`，加 facet 入参 + rebuild 端点

```java
@GetMapping("/portal")
@Operation(summary = "全局搜索 (前台门户)")
@jakarta.annotation.security.PermitAll
public CommonResult<PortalSearchResultVO> globalSearch(
        @RequestParam("keyword") String keyword,
        @RequestParam(value = "type", required = false, defaultValue = "all") String type,
        @RequestParam(value = "platform", required = false) String platform,
        @RequestParam(value = "country", required = false) String country,
        @RequestParam(value = "timeFromTs", required = false) Long timeFromTs,
        @RequestParam(value = "tags", required = false) String tags,
        @RequestParam(value = "pageNo", required = false, defaultValue = "1") Integer pageNo,
        @RequestParam(value = "pageSize", required = false, defaultValue = "10") Integer pageSize) {
    List<String> tagList = (tags == null || tags.trim().isEmpty()) ? null
            : java.util.Arrays.stream(tags.split(",")).map(String::trim)
                    .filter(s -> !s.isEmpty()).collect(java.util.stream.Collectors.toList());
    return success(searchService.search(new SearchService.SearchReq(
            keyword, type, platform, country, timeFromTs, tagList, pageNo, pageSize)));
}

@GetMapping("/rebuild-index")
@Operation(summary = "重建全局检索索引（管理员）")
@PreAuthorize("@ss.hasPermission('system:search:rebuild')")
public CommonResult<Boolean> rebuildIndex() {
    searchIndexService.rebuildAll();
    return success(true);
}
```

> `SearchService.SearchReq` 是一个 record：`(String keyword, String type, String platform, String country, Long timeFromTs, List<String> tags, Integer pageNo, Integer pageSize)`。

### 前端 global-sentiment-web（src/pages/searchLibraryList/）

**api/postinfo/index.ts — getSearchPortal**（注意 facets 的 key 是单数 `tag`，与后端 VO 一致）

```ts
export interface SearchPortalResult {
	total: number
	persons: any[]
	posts: any[]
	events: any[]
	facets: {
		type: Record<string, number>
		platform: Record<string, number>
		country: Record<string, number>
		tag: Record<string, number>
	}
}

export function getSearchPortal(params: {
	keyword: string
	type?: string
	platform?: string
	country?: string
	timeFromTs?: number
	tags?: string
	pageNo?: number
	pageSize?: number
}) {
	return request.get<SearchPortalResult>({
		url: PORT1 + '/system/search/portal',
		params,
	})
}
```

**searchParams.ts**

```ts
export interface SearchUiState {
	keyword: string
	type: 'all' | 'person' | 'post' | 'event'
	platform: string
	country: string
	timeFromTs: number | null
	tags: string[]
	pageNo: number
	pageSize: number
}

/** UI 状态 → 后端请求参数：数组标签转逗号串，空值省略 */
export function buildSearchParams(s: SearchUiState) {
	return {
		keyword: s.keyword,
		type: s.type,
		pageNo: s.pageNo,
		pageSize: s.pageSize,
		...(s.platform ? { platform: s.platform } : {}),
		...(s.country ? { country: s.country } : {}),
		...(s.timeFromTs != null ? { timeFromTs: s.timeFromTs } : {}),
		...(s.tags && s.tags.length ? { tags: s.tags.join(',') } : {}),
	}
}
```

**index.vue**（搜索框 + 左侧 facet + 聚合结果，facet 改动回第 1 页重搜、翻页重搜）

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getSearchPortal, type SearchPortalResult } from '@/api/postinfo'
import { buildSearchParams, type SearchUiState } from './searchParams'
import SearchFilterPanel from './components/SearchFilterPanel.vue'
import SearchResultList from './components/SearchResultList.vue'

const state = reactive<SearchUiState>({
	keyword: '', type: 'all', platform: '', country: '',
	timeFromTs: null, tags: [], pageNo: 1, pageSize: 10,
})
const loading = ref(false)
const result = ref<SearchPortalResult | null>(null)
const hasSearched = ref(false)

async function doSearch() {
	if (!state.keyword.trim()) return
	loading.value = true
	hasSearched.value = true
	try {
		result.value = await getSearchPortal(buildSearchParams(state))
	} catch {
		result.value = null
	} finally {
		loading.value = false
	}
}
function onFilterChange(patch: Partial<SearchUiState>) {
	Object.assign(state, patch)
	state.pageNo = 1
	doSearch()
}
function onPageChange(p: number) {
	state.pageNo = p
	doSearch()
}
</script>

<template>
	<main class="bg-gradient-main min-h-screen">
		<div class="relative z-10 mx-auto max-w-[1200px] px-4 py-6">
			<div class="mb-6 flex gap-2">
				<el-input v-model="state.keyword" placeholder="搜索标题、名称、正文、标签、关键词…"
					size="large" clearable @keyup.enter="onFilterChange({})" />
				<el-button type="primary" size="large" @click="onFilterChange({})">搜索</el-button>
			</div>
			<div v-if="hasSearched" class="flex flex-col gap-4 lg:flex-row">
				<SearchFilterPanel :facets="result?.facets || null" :type="state.type"
					:platform="state.platform" :country="state.country"
					:time-from-ts="state.timeFromTs" :tags="state.tags"
					@update:type="(v) => onFilterChange({ type: v as SearchUiState['type'] })"
					@update:platform="(v) => onFilterChange({ platform: v })"
					@update:country="(v) => onFilterChange({ country: v })"
					@update:time-from-ts="(v) => onFilterChange({ timeFromTs: v })"
					@update:tags="(v) => onFilterChange({ tags: v })" />
				<SearchResultList :result="result" :loading="loading" :type="state.type"
					:page-no="state.pageNo" :page-size="state.pageSize"
					:total="result?.total || 0" @page-change="onPageChange" />
			</div>
			<div v-else class="py-24 text-center text-muted-foreground">
				<p class="text-lg">请输入关键词开始检索</p>
			</div>
		</div>
	</main>
</template>
```

**components/SearchFilterPanel.vue**（自绘 button 单选高亮 + 时间预设 + 标签多选，计数取自 facets）

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { SearchPortalResult } from '@/api/postinfo'

const props = defineProps<{
	facets: SearchPortalResult['facets'] | null
	type: string
	platform: string
	country: string
	timeFromTs: number | null
	tags: string[]
}>()
const emit = defineEmits<{
	'update:type': [string]
	'update:platform': [string]
	'update:country': [string]
	'update:timeFromTs': [number | null]
	'update:tags': [string[]]
}>()

const typeOptions = computed(() => {
	const t = props.facets?.type || {}
	return [
		{ value: 'all', label: '全部', count: (t.person || 0) + (t.post || 0) + (t.event || 0) },
		{ value: 'person', label: '人物', count: t.person || 0 },
		{ value: 'post', label: '帖子', count: t.post || 0 },
		{ value: 'event', label: '事件', count: t.event || 0 },
	]
})
const platformOptions = computed(() => toOptions(props.facets?.platform))
const countryOptions = computed(() => toOptions(props.facets?.country))
const tagOptions = computed(() => Object.keys(props.facets?.tag || {}).slice(0, 30))
function toOptions(m?: Record<string, number>) {
	return Object.entries(m || {}).map(([value, count]) => ({ value, count }))
}
const timePresets = [
	{ label: '全部时间', days: 0 },
	{ label: '近 7 天', days: 7 },
	{ label: '近 30 天', days: 30 },
	{ label: '近 90 天', days: 90 },
]
function pickTime(days: number) {
	emit('update:timeFromTs', days === 0 ? null : Math.floor(Date.now() / 1000) - days * 86400)
}
function selectSingle(field: 'type' | 'platform' | 'country', value: string) {
	if (field === 'type') emit('update:type', value)
	else if (field === 'platform') emit('update:platform', props.platform === value ? '' : value)
	else emit('update:country', props.country === value ? '' : value)
}
</script>

<template>
	<div class="w-full lg:max-w-60 lg:min-w-60 lg:w-60 lg:flex-shrink-0">
		<div class="border border-border/50 rounded-xl bg-card p-4 space-y-5">
			<div>
				<p class="mb-2 text-sm font-semibold">类型</p>
				<button v-for="o in typeOptions" :key="o.value"
					class="mb-1 w-full flex items-center justify-between rounded px-2 py-1 text-sm"
					:class="type === o.value ? 'bg-primary text-white' : 'hover:bg-muted'"
					@click="selectSingle('type', o.value)">
					<span>{{ o.label }}</span><span class="text-xs opacity-70">{{ o.count }}</span>
				</button>
			</div>
			<div v-if="platformOptions.length">
				<p class="mb-2 text-sm font-semibold">平台</p>
				<button v-for="o in platformOptions" :key="o.value"
					class="mb-1 w-full flex items-center justify-between rounded px-2 py-1 text-sm"
					:class="platform === o.value ? 'bg-primary text-white' : 'hover:bg-muted'"
					@click="selectSingle('platform', o.value)">
					<span>{{ o.value }}</span><span class="text-xs opacity-70">{{ o.count }}</span>
				</button>
			</div>
			<div v-if="countryOptions.length">
				<p class="mb-2 text-sm font-semibold">国家/地区</p>
				<button v-for="o in countryOptions" :key="o.value"
					class="mb-1 w-full flex items-center justify-between rounded px-2 py-1 text-sm"
					:class="country === o.value ? 'bg-primary text-white' : 'hover:bg-muted'"
					@click="selectSingle('country', o.value)">
					<span>{{ o.value }}</span><span class="text-xs opacity-70">{{ o.count }}</span>
				</button>
			</div>
			<div>
				<p class="mb-2 text-sm font-semibold">时间范围</p>
				<button v-for="t in timePresets" :key="t.label"
					class="mb-1 mr-1 rounded px-2 py-1 text-xs hover:bg-muted"
					@click="pickTime(t.days)">{{ t.label }}</button>
				<p class="mt-1 text-xs text-muted-foreground">时间筛选不作用于人物</p>
			</div>
			<div v-if="tagOptions.length">
				<p class="mb-2 text-sm font-semibold">标签/关键词</p>
				<el-checkbox-group :model-value="tags" @update:model-value="(v: any) => emit('update:tags', v)">
					<el-checkbox v-for="tag in tagOptions" :key="tag" :value="tag" :label="tag" />
				</el-checkbox-group>
			</div>
		</div>
	</div>
</template>
```

**components/SearchResultList.vue**（混排/单类 + 传统分页 + 空安全兜底）

```vue
<script setup lang="ts">
import { computed } from 'vue'
import ResultItemCard from './ResultItemCard.vue'
import type { SearchPortalResult } from '@/api/postinfo'

const props = defineProps<{
	result: SearchPortalResult | null
	loading: boolean
	type: string
	pageNo: number
	pageSize: number
	total: number
}>()
const emit = defineEmits<{ 'page-change': [number] }>()

const items = computed(() => {
	if (!props.result) return []
	const r = props.result
	if (props.type === 'person') return (r.persons || []).map((i) => ({ i, k: 'person' as const }))
	if (props.type === 'post') return (r.posts || []).map((i) => ({ i, k: 'post' as const }))
	if (props.type === 'event') return (r.events || []).map((i) => ({ i, k: 'event' as const }))
	return [
		...(r.persons || []).map((i) => ({ i, k: 'person' as const })),
		...(r.posts || []).map((i) => ({ i, k: 'post' as const })),
		...(r.events || []).map((i) => ({ i, k: 'event' as const })),
	]
})
function onPage(p: number) {
	emit('page-change', p)
}
</script>

<template>
	<div class="min-w-0 flex-1">
		<el-skeleton v-if="loading" :rows="8" animated />
		<template v-else-if="result">
			<p class="mb-3 text-sm text-muted-foreground">共查询到 {{ total }} 条结果</p>
			<div class="space-y-3">
				<ResultItemCard v-for="(it, idx) in items" :key="it.k + idx" :item="it.i" :kind="it.k" />
			</div>
			<div v-if="items.length === 0" class="py-16 text-center text-muted-foreground">无匹配结果</div>
			<div class="mt-5 flex justify-center">
				<el-pagination :current-page="pageNo" :page-size="pageSize" :total="total"
					layout="total, prev, pager, next, jumper" background @current-change="onPage" />
			</div>
		</template>
	</div>
</template>
```

**components/ResultItemCard.vue**（标题用 v-html 渲染后端 `<mark>` 高亮；摘要用文本插值，见踩坑④XSS）

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{ item: any; kind: 'person' | 'post' | 'event' }>()
const router = useRouter()

const pathMap: Record<string, string> = {
	person: '/personLibraryDetail',
	post: '/postLibraryDetail',
	event: '/eventLibraryDetail',
}
function goDetail() {
	const routeData = router.resolve({ path: pathMap[props.kind], query: { id: props.item.id } })
	window.open(routeData.href, '_blank')
}
const title = () =>
	props.kind === 'post'
		? props.item.highlightTitle || props.item.postTitle
		: props.item.highlightName || props.item.name || props.item.eventName
const summary = () =>
	props.kind === 'post'
		? props.item.postContent
		: props.kind === 'event'
			? props.item.summary
			: props.item.introduction || ''
</script>

<template>
	<div class="cursor-pointer border border-border/50 rounded-xl bg-card p-4 transition hover:shadow" @click="goDetail">
		<div class="mb-1 flex items-center gap-2">
			<span class="rounded bg-muted px-1.5 py-0.5 text-xs">
				{{ kind === 'person' ? '人物' : kind === 'post' ? '帖子' : '事件' }}
			</span>
			<h3 class="text-base font-semibold" v-html="title()" />
		</div>
		<p class="line-clamp-2 text-sm text-muted-foreground">{{ summary() }}</p>
		<div class="mt-2 flex flex-wrap gap-1">
			<span v-for="t in (item.tags || []).slice(0, 5)" :key="t"
				class="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{{ t }}</span>
		</div>
	</div>
</template>
```

> 遗留优化：标签 chip 遇到「一整串逗号拼接的长关键词」会超出模块宽度，需给 chip 加 `max-w-full truncate` / 容器 `min-w-0`（本次未完成，见待办）。

## 三、配置 / 命令

### 后端配置（application-prod.yaml）

```yaml
yudao:
  meilisearch:
    host: http://127.0.0.1:7700     # 容器化部署时改用服务名，见踩坑①
    api-key: ${MEILI_MASTER_KEY}    # 生产用环境变量，勿明文
    enabled: true
```

> Spring 宽松绑定：可用环境变量 `YUDAO_MEILISEARCH_HOST` / `YUDAO_MEILISEARCH_ENABLED` 覆盖，无需改 yaml/重出镜像。

### docker-compose 部署（用 override 叠加，不动原 compose）

后端跑在 docker-compose 里时，用一个 `docker-compose.override.yml` 叠加 Meilisearch 服务 + 给 backend 注入环境变量（override 会自动被 `docker compose up` 合并）：

```yaml
services:
  meilisearch:
    image: hub.rat.dev/getmeili/meilisearch:v1.10   # 见踩坑⑤：默认源拉不到 v1.x
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
    volumes:
      - meili-prod:/meili_data
  backend:
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      YUDAO_MEILISEARCH_HOST: http://meilisearch:7700   # 服务名，不是 127.0.0.1
volumes:
  meili-prod:
    driver: local
```

部署命令（在 compose 目录，`docker.env` 里加一行 `MEILI_MASTER_KEY=【已脱敏】`）：

```bash
# master key 生成（写进 docker.env，勿回显）
echo "MEILI_MASTER_KEY=$(openssl rand -hex 16)" >> docker.env

# 起 meilisearch（先起它，后起 backend，保证 backend 启动时 index 能建）
docker compose --env-file docker.env up -d meilisearch

# 换/升级 meili 版本时：数据不兼容需清卷
docker compose rm -sf meilisearch && docker volume rm <项目>_meili-prod
docker compose --env-file docker.env up -d meilisearch

# 起/重建 backend（读到新环境变量、加入同网络、启动时建 index）
docker compose --env-file docker.env up -d backend
```

### 灌数据（首次全量重建）

```bash
# 需超级管理员登录态（super-admin 绕过权限；普通角色需补 system:search:rebuild 菜单）
curl -s "http://127.0.0.1:8113/admin-api/system/search/rebuild-index" \
  -H "Authorization: Bearer 【已脱敏】" -H "tenant-id: 1"
# 返回 {"code":0,"data":true}
```

### 验证

```bash
# 容器内查 index 文档数（Bearer 新协议，v1.x）
docker exec <项目>-meilisearch-1 sh -c \
  'curl -s http://localhost:7700/indexes/yuqing_posts/stats -H "Authorization: Bearer $MEILI_MASTER_KEY"'

# 打检索接口（中文关键词需 URL 编码，前端 axios 自动编码）
curl -s "http://127.0.0.1:8113/admin-api/system/search/portal?keyword=trump&type=all&pageNo=1&pageSize=3" \
  -H "tenant-id: 1"
```

## 四、复现 Checklist

**后端**
- [ ] `yudao-dependencies` 加 meilisearch-java 版本 + dependencyManagement；**同时钉 okhttp 版本**（踩坑①-okhttp）
- [ ] `yudao-module-system` 引 meilisearch-java（不写 version）
- [ ] MeilisearchProperties + YudaoMeilisearchConfiguration（Client bean）
- [ ] MeiliIndexConst + MeiliIndexInitializer（启动幂等建 index，`catch Throwable` + safeMessage）
- [ ] MeiliErrors.safeMessage（防 getMessage NPE）
- [ ] SearchDocMapper / SearchIndexService（全量重建 + rebuild 端点）
- [ ] SearchFilterBuilder / SearchResultAssembler / SearchServiceImpl（聚合检索）
- [ ] PortalSearchResultVO 加 facets 结构
- [ ] application-prod.yaml 加 `yudao.meilisearch.*`

**服务器**
- [ ] docker-compose.override.yml 加 meilisearch（**v1.x，非 latest**）+ backend 环境变量
- [ ] master key 写 docker.env；**backend Meili host 用服务名**（容器化不能用 127.0.0.1）
- [ ] 先起 meilisearch，再起 backend
- [ ] 触发 rebuild-index 灌数据

**验证**
- [ ] 后端日志出现「三个检索 index 初始化完成」，无 `Application run failed`
- [ ] meili index stats 的 `numberOfDocuments > 0`
- [ ] 前端搜已知词 → 三类聚合 + facet 计数 + `<mark>` 高亮 + 分页 + 详情跳转

## 五、踩坑记录

**① 容器化后端连不上 `127.0.0.1:7700`**
- 现象：yaml 配 `host: http://127.0.0.1:7700`，后端在容器里连不上 Meili。
- 原因：容器内 `127.0.0.1` 是容器自己的 loopback，够不到宿主机/别的容器。
- 解决：把 Meili 加进同一个 compose 网络，backend 用**服务名** `http://meilisearch:7700`（用环境变量 `YUDAO_MEILISEARCH_HOST` 覆盖，无需改代码）。

**②（最严重）SDK 异常 getMessage NPE 拖垮整个后端启动 → 崩溃重启循环**
- 现象：Meili 报错时后端 Spring 启动直接失败、容器每 25s 崩溃重启，**生产宕机**。
- 原因：meilisearch-java 的某些 `MeilisearchApiException` 内部 `error` 为 null，`getMessage()` 会抛 NPE。原 `catch` 块 `log.error(msg, e)` 渲染异常栈时调 `getMessage()` → **catch 自己二次抛 NPE** → 逃出 `ApplicationRunner` → 启动失败。「失败只告警不阻断」的设计被日志渲染破坏。
- 解决：`MeiliErrors.safeMessage()`（`getMessage()` 抛异常也只返类名）；所有 `catch` 改 `catch (Throwable)` 且**不把异常对象传给 logger**，只传 `safeMessage(e)` 字符串。init 每个 index 独立、失败只降级。
- 教训：**任何"降级"路径里的日志/错误处理本身绝不能再抛异常**，否则降级变崩溃。

**③ meilisearch-java 0.14.4 的 API 形状（需 javap 核实，别照抄旧文档）**
- `Index.search(SearchRequest)` 返回 `Searchable`（非 `SearchResult`）——只用 offset/limit 时可安全强转 `SearchResult`。
- `SearchResult` 只有 getter、无 setter、无可写空构造 → 失败降级不能 `new SearchResult()`，自建内部 `QueryResult` 承载。
- `getFacetDistribution()` 声明返回 `Object`，Gson 无类型反序列化把**数字变成 Double** → 用 `((Number) v).intValue()` 收窄，别直接 `(Integer)` 强转（会 `ClassCastException`）。

**④ v-html 渲染后端高亮 = XSS 面**
- Meili `_formatted` 把原文原样带回、只在命中处包 `<mark>`，其余是未转义用户内容。标题用 `v-html` 渲染高亮属全站既有基线（8 处同款），列为系统性技术债（建议引 DOMPurify）。摘要**没有高亮字段、不需要 v-html**，改成 `{{ summary() }}` 文本插值即可消掉一条 XSS 面。

**⑤ 镜像源 `getmeili/meilisearch:latest` 是 2021 年的 v0.24.0 古董**
- 现象：国内 docker 源（阿里云加速）拉 `latest` 得到 v0.24.0（老鉴权头 `X-Meili-API-Key`），与 SDK 0.14.4 的新协议（`Authorization: Bearer` + 新 index API）不兼容 → createIndex 返回 SDK 无法解析的响应 → 触发踩坑②的 null-error 异常。且 `v1.x` 版本 tag 从默认源全拉不到。
- 解决：换能拉到 v1.x 的国内源 `hub.rat.dev/getmeili/meilisearch:v1.10`（其它试过的 `docker.m.daocloud.io`/`docker.1ms.run`/`dockerpull.org`/`docker.1panel.live` 均 fail）。**务必用固定版本 tag，别用 latest。**

**⑥ okhttp 开放版本区间被镜像脏 metadata 污染**
- 现象：`meilisearch-java:0.14.4` 间接依赖 `okhttp` 用开放区间 `[4.10.0,5.0.0)`，华为云镜像 metadata 混入脏数据 `5.0.0-SNAPSHOT` 被选中却 404，编译失败。
- 解决：BOM 里钉死 `okhttp` = `4.12.0`（properties + dependencyManagement）。

## 六、文件清单

**核心配方（本篇全码）**：
| 文件 | 作用 |
|---|---|
| `framework/search/config/MeilisearchProperties.java` | 读 `yudao.meilisearch.*` |
| `framework/search/config/YudaoMeilisearchConfiguration.java` | Client bean |
| `framework/search/core/MeiliIndexConst.java` | index/字段常量 |
| `framework/search/core/MeiliErrors.java` | ⭐防崩安全取异常文本 |
| `framework/search/core/MeiliIndexInitializer.java` | 启动幂等建 index |
| `service/search/dochelper/SearchDocMapper.java` | DO→doc |
| `service/search/SearchIndexServiceImpl.java` | 全量重建 |
| `service/search/SearchServiceImpl.java` | 聚合检索 |
| `controller/admin/postinfo/SearchController.java` | /portal + rebuild 端点 |
| 前端 `searchLibraryList/{index,searchParams,components/*}.vue/ts` | 搜索页 |
| `docker-compose.override.yml` | Meili 服务 + backend 环境变量 |

**其余（未全码，仓库路径可查）**：
| 文件 | 作用 |
|---|---|
| `service/search/SearchService.java` | 接口 + `SearchReq` record |
| `service/search/query/SearchFilterBuilder.java` | 请求参数 → Meili filter 表达式（纯逻辑，有单测） |
| `service/search/query/SearchResultAssembler.java` | hit→VO + facet 合并（纯逻辑，有单测） |
| `service/search/SearchIndexService.java` | rebuild 接口 |
| `controller/admin/postinfo/vo/PortalSearchResultVO.java` | 结果 VO（加 Facets/tags/highlight 字段） |
| `api/postinfo/index.ts` | getSearchPortal + SearchPortalResult 类型 |
| `yudao-dependencies/pom.xml` / `yudao-module-system/pom.xml` | 依赖 + okhttp 钉版本 |
| 各 `*Test.java`（MeiliErrors/SearchDocMapper/SearchFilterBuilder/SearchResultAssembler） | 纯逻辑单测 |
