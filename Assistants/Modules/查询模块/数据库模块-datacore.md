---
topicCardFilter: ""
searchText: ""
searchTag: ""
startDate: ""
endDate: ""
showPermanentNotes: true
showProjectNotes: true
showFlashNotes: true
areaPath: Documents/I.P.A.R.A
customField: []
navigationPage:
  - "[[Assistants/Templater/主页/homepage-主页|主页Home]]"
  - "[[今日需处理的笔记.md|待处理笔记]]"
  - "[[homepage-主页-观影.md|观影主页]]"
  - "[[📚电子书架.md|电子书架]]"
  - "[[模块、模板数据库-Bases.base|模板数据库]]"
  - "[[文档数据库-Bases.base|文档数据库]]"
  - "[[人脉管理数据库-Bases.base|人脉数据库]]"
---
{icon=sailboat}`INPUT[inlineListSuggester(option([[homepage-主页|主页]]), option([[homepage-主页-远程推送更新|更新仓库]]), option([[Dataview-readingnote|阅读主页]]),allowOther):navigationPage]`
```col-md
{icon=text-search}`INPUT[text(placeholder(搜索笔记名),class(text-datacore)):searchText]` {icon=lightbulb}`INPUT[toggle:showFlashNotes]` {icon=folder-kanban}`INPUT[toggle:showProjectNotes]` {icon=shredder}`INPUT[toggle:showPermanentNotes]` {icon=file-json}自定义字段`INPUT[inlineList:customField]` 
{icon=tags}`INPUT[text(placeholder(搜索标签名),class(text-datacore)):searchTag]` `INPUT[datePicker(defaultValue(null)):startDate]`→ `INPUT[datePicker(defaultValue(null)):endDate]` {icon=land-plot}`INPUT[inlineSelect(option(Documents/I.P.A.R.A,所有领域), option(Documents/I.P.A.R.A/学习领域,学习领域), option(Documents/I.P.A.R.A/工作领域,工作领域),option(Documents/I.P.A.R.A/生活领域,生活领域)):areaPath]`   {icon=layout-dashboard}`BUTTON[topic-filter]` `BUTTON[resetDatabase]`
```

```datacorejsx
// 定义表格列
function getColumns(customFields) {
    const baseColumns = [
        { 
            id: "笔记名称", 
            value: page => page.$link 
        },
        { 
            id: "笔记类型", 
            value: page => {
                const noteType = page.value("笔记类型") || "未分类";
                return (
                    <span style={{ whiteSpace: 'nowrap' }}>
                        {noteType}
                    </span>
                );
            }
        },
        { 
            id: "笔记主题", 
            value: page => page.value("卡片盒笔记主题")
        },
        { 
            id: "标签", 
            value: (page) => { 
                const tags = page.value("tags"); 
                if (!tags) return ""; 
                
                // 定义标签点击处理函数 
                const handleTagClick = (tag) => { 
                    const app = window.app; 
                    const file = app.workspace.getActiveFile(); 
                    if (file) { 
                        app.fileManager.processFrontMatter(file, (frontmatter) => { 
                            frontmatter.searchTag = tag; 
                        }); 
                    } 
                }; 
                
                // 生成标签颜色的函数 
                const generateTagColor = (tagText) => { 
                    const text = String(tagText ?? "").trim(); 
                    if (!text) { 
                        const hue = 200; 
                        const saturation = 55; 
                        const lightness = 85; 
                        const backgroundColor = `hsl(${hue}, ${saturation - 10}%, ${lightness}%)`; 
                        const borderColor = `hsl(${hue}, ${saturation}%, ${lightness - 15}%)`; 
                        const hoverColor = `hsl(${hue}, ${saturation - 5}%, ${lightness - 8}%)`; 
                        return { backgroundColor, borderColor, hoverColor }; 
                    } 
                    let hash = 0; 
                    for (let i = 0; i < text.length; i++) { 
                        const char = text.charCodeAt(i); 
                        hash = ((hash << 5) - hash) + char; 
                        hash = hash & hash; 
                    } 
                    const hue = Math.abs(hash) % 360; 
                    const saturation = 45 + (Math.abs(hash) % 25); 
                    const lightness = 75 + (Math.abs(hash) % 15); 
                    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`; 
                    const borderColor = `hsl(${hue}, ${saturation + 10}%, ${lightness - 15}%)`; 
                    const hoverColor = `hsl(${hue}, ${saturation + 5}%, ${lightness - 8}%)`; 
                    return { backgroundColor, borderColor, hoverColor }; 
                }; 
                
                if (Array.isArray(tags)) { 
                    const tagList = tags.map(t => String(t ?? "").trim()).filter(t => t.length > 0); 
                    if (tagList.length === 0) return ""; 
                    return ( 
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}> 
                            {tagList.map((tag, index) => { 
                                const colors = generateTagColor(tag); 
                                return ( 
                                    <button 
                                        key={index} 
                                        onClick={() => handleTagClick(tag)} 
                                        style={{ 
                                            height: '20px', 
                                            fontSize: '11px', 
                                            backgroundColor: colors.backgroundColor, 
                                            borderRadius: '14px', 
                                            cursor: 'pointer', 
                                            color: '#2c3e50', 
                                            transition: 'all 0.2s ease', 
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)' 
                                        }} 
                                        onMouseOver={(e) => { 
                                            e.target.style.backgroundColor = colors.hoverColor; 
                                            e.target.style.transform = 'translateY(-1px)'; 
                                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)'; 
                                        }} 
                                        onMouseOut={(e) => { 
                                            e.target.style.backgroundColor = colors.backgroundColor; 
                                            e.target.style.transform = 'translateY(0)'; 
                                            e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)'; 
                                        }} 
                                    > 
                                        {tag} 
                                    </button> 
                                ); 
                            })} 
                        </div> 
                    ); 
                } else { 
                    const tagStr = String(tags ?? "").trim(); 
                    if (!tagStr) return ""; 
                    const colors = generateTagColor(tagStr); 
                    return ( 
                        <button 
                            onClick={() => handleTagClick(tagStr)} 
                            style={{ 
                                padding: '3px 8px', 
                                fontSize: '12px', 
                                backgroundColor: colors.backgroundColor, 
                                border: `1px solid ${colors.borderColor}`, 
                                borderRadius: '12px', 
                                cursor: 'pointer', 
                                color: '#2c3e50', 
                                fontWeight: '500', 
                                transition: 'all 0.2s ease', 
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)' 
                            }} 
                            onMouseOver={(e) => { 
                                e.target.style.backgroundColor = colors.hoverColor; 
                                e.target.style.transform = 'translateY(-1px)'; 
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)'; 
                            }} 
                            onMouseOut={(e) => { 
                                e.target.style.backgroundColor = colors.backgroundColor; 
                                e.target.style.transform = 'translateY(0)'; 
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)'; 
                            }} 
                        > 
                            {tagStr} 
                        </button> 
                    ); 
                } 
            } 
        }];
        
    
    // 如果customFields是数组且有值，为每个字段添加列
    if (Array.isArray(customFields) && customFields.length > 0) {
        customFields.forEach(fieldName => {
            if (fieldName && fieldName.trim()) {
                baseColumns.push({
                     id: fieldName,
                     width: "12%",
                     value: page => {
                         const fieldValue = page.value(fieldName);
                         return fieldValue || "";
                     }
                 });
            }
        });
    }
    
    // 添加进度列
    baseColumns.push({
        id: "进度",
        width: "10%",
        value: (page) => {
            return <ProgressCell page={page} />;
        }
    });
    return baseColumns;
}

// 保持向后兼容的COLUMNS常量
const COLUMNS = getColumns();

// 进度条组件
function ProgressCell({ page }) {
    const [progressData, setProgressData] = dc.useState(null);
    const [loading, setLoading] = dc.useState(true);
    const [error, setError] = dc.useState(null);
    
    dc.useEffect(() => {
        async function loadProgress() {
            try {
                setLoading(true);
                setError(null);
                
                // 获取文件内容
                const file = app.vault.getAbstractFileByPath(page.$path);
                if (!file) {
                    setError('文件不存在');
                    return;
                }
                
                const content = await app.vault.cachedRead(file);
                const progressMatches = [...content.matchAll(
                    /<progress\b[^>]*value\s*=\s*["'](\d+)["'][^>]*max\s*=\s*["'](\d+)["'][^>]*>/gi
                )];
                
                if (progressMatches.length > 0) {
                    const match = progressMatches[0];
                    const value = match[1];
                    const max = match[2];
                    // 直接返回匹配到的HTML字符串
                    setProgressData(match[0]);
                } else {
                    setProgressData(null);
                }
            } catch (err) {
                setError('读取出错');
            } finally {
                setLoading(false);
            }
        }
        
        loadProgress();
    }, [page.$path]);
    
    if (loading) {
        return (
            <span style={{
                color: '#999',
                fontSize: '12px',
                fontStyle: 'italic'
            }}>加载中...</span>
        );
    }
    
    if (error) {
        return (
            <span style={{
                color: '#f00',
                fontSize: '12px',
                fontStyle: 'italic'
            }}>{error}</span>
        );
    }
    
    if (progressData) {
        return (
            <div style={{ whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{
                __html: progressData
            }} />
        );
    }
    
    return (
        <span style={{
            color: '#999',
            fontSize: '12px',
            fontStyle: 'italic',
            whiteSpace: 'nowrap'
        }}>--</span>
    );
}

return function View() {
    const currentFile = dc.useCurrentFile();
    const topicCardFilter = currentFile?.value("topicCardFilter") || "";
    const queryString = dc.useMemo(() => {
        const areaPath = currentFile?.value("areaPath") || "";
        // 构建基础查询：@page自动限制为页面文件（md文件）
        let baseQuery = '@page';
        // 根据YAML区域的areaPath字段值确定查询范围
        if (areaPath) {
            baseQuery += ` and $path.contains("${areaPath}")`;
        }
        
        if (topicCardFilter && topicCardFilter.trim()) {
            const fullFileName = topicCardFilter.split('/').pop();
            const baseFileName = fullFileName.replace(/\.(md|canvas)$/, '');
            return `${baseQuery} and (linkedfrom([[${fullFileName}]]) or linkedfrom([[${baseFileName}]]) or connected([[${fullFileName}]]) or connected([[${baseFileName}]]))`;
        } else {
            return baseQuery;
        }
    }, [topicCardFilter, currentFile?.value("areaPath")]);
    
    // 使用动态查询字符串执行查询
    const queryResult = dc.useQuery(queryString);
    
    // 添加调试日志验证查询结果
    dc.useEffect(() => {
        if (queryResult && queryResult.length > 0) {
        }
    }, [queryString, queryResult]);
    
    // 对查询结果按修改时间降序排序
    const allPages = dc.useMemo(() => {
        if (!queryResult || queryResult.length === 0) return [];
        return [...queryResult].sort((a, b) => {
            const aTime = a.$mtime || a.file?.mtime || 0;
            const bTime = b.$mtime || b.file?.mtime || 0;
            return new Date(bTime) - new Date(aTime);
        });
    }, [queryResult]);
    
    // 使用useMemo进行数据筛选，提高性能
    const filteredPages = dc.useMemo(() => {
        let filtered = allPages;
        
        // 获取筛选条件
        const searchText = currentFile?.value("searchText") || "";
        const searchTag = currentFile?.value("searchTag") || "";
        const startDate = currentFile?.value("startDate") || "";
        const endDate = currentFile?.value("endDate") || "";
        const showPermanentNotes = currentFile?.value("showPermanentNotes") ?? true;
        const showProjectNotes = currentFile?.value("showProjectNotes") ?? true;
        const showFlashNotes = currentFile?.value("showFlashNotes") ?? true;
        const areaPath = currentFile?.value("areaPath") || "";
  
        // 文本搜索筛选
        if (searchText && searchText.trim()) {
            const searchTerms = searchText.toLowerCase().split(/[\s,，]+/).filter(term => term.length > 0);
            filtered = filtered.filter(page => {
                const title = (page.$name || "").toLowerCase();
                const content = (page.$content || "").toLowerCase();
                const matches = searchTerms.some(term => 
                    title.includes(term) || content.includes(term)
                );
                return matches;
            });
        }
        
        // 标签筛选
        if (searchTag && searchTag.trim()) {
            const searchTags = searchTag.toLowerCase().split(/[\s,，]+/).filter(tag => tag.length > 0);
            filtered = filtered.filter(page => {
                const pageTags = page.value("tags") || [];
                const pageTagsArray = Array.isArray(pageTags) ? pageTags : [pageTags];
                const pageTagsLower = pageTagsArray
                    .map(tag => String(tag ?? "").toLowerCase())
                    .filter(t => t.length > 0);
                const matches = searchTags.some(searchTag => 
                    pageTagsLower.some(pageTag => pageTag.includes(searchTag))
                );
                return matches;
            });
        }
        
        // 笔记类型筛选
        filtered = filtered.filter(page => {
            const noteType = page.value("笔记类型") || "";
            if (noteType === "永久笔记" && !showPermanentNotes) return false;
            if (noteType === "项目笔记" && !showProjectNotes) return false;
            if (noteType === "闪念笔记" && !showFlashNotes) return false;
            return true;
        });
        
        // 日期范围筛选（基于文件修改时间）
        if (startDate || endDate) {
            filtered = filtered.filter(page => {
                const modifiedTime = page.$mtime || page.file?.mtime;
                if (!modifiedTime) return false;
                
                try {
                    const pageDate = new Date(modifiedTime);
                    if (startDate && pageDate < new Date(startDate)) return false;
                    if (endDate && pageDate > new Date(endDate)) return false;
                    return true;
                } catch {
                    return false;
                }
            });
        }
        return filtered;
    }, [
        allPages,
        currentFile?.value("searchText"),
        currentFile?.value("searchTag"),
        currentFile?.value("startDate"),
        currentFile?.value("endDate"),
        currentFile?.value("showPermanentNotes"),
        currentFile?.value("showProjectNotes"),
        currentFile?.value("showFlashNotes"),
        currentFile?.value("areaPath")
    ]);

    // 获取customField的值（数组格式）
    const customFields = currentFile?.value("customField") || [];
    
    // 根据customField数组动态生成列配置
    const dynamicColumns = dc.useMemo(() => {
        return getColumns(customFields);
    }, [customFields]);
    
    // 显示统计信息和表格
    const filterStatus = topicCardFilter ? 
        `反向链接筛选: ${topicCardFilter.split('/').pop()}` : 
        "显示所有笔记";
    
    // 生成自定义字段显示信息
    const customFieldsInfo = Array.isArray(customFields) && customFields.length > 0 ? 
        `自定义字段: ${customFields.join(', ')}` : 
        "无自定义字段";
   
    return (
        <div>
            <dc.Table 
                columns={dynamicColumns} 
                rows={filteredPages}
                paging={true}
            />
        </div>
    );
    
}
```
