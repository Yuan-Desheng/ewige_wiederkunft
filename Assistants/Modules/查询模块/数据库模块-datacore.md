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
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sailboat-icon lucide-sailboat"><path d="M10 2v15"/><path d="M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z"/><path d="M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z"/></svg>`INPUT[inlineListSuggester(option([[homepage-主页|主页]]), option([[homepage-主页-远程推送更新|更新仓库]]), option([[Dataview-readingnote|阅读主页]]),allowOther):navigationPage]`
```col-md
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-search-icon lucide-text-search"><path d="M21 5H3"/><path d="M10 12H3"/><path d="M10 19H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>`INPUT[text(placeholder(搜索笔记名),class(text-datacore)):searchText]` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb-icon lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`INPUT[toggle:showFlashNotes]` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-kanban-icon lucide-folder-kanban"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/></svg>`INPUT[toggle:showProjectNotes]` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shredder-icon lucide-shredder"><path d="M10 22v-5"/><path d="M14 19v-2"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M18 20v-3"/><path d="M2 13h20"/><path d="M20 13V7l-5-5H6a2 2 0 0 0-2 2v9"/><path d="M6 20v-3"/></svg>`INPUT[toggle:showPermanentNotes]` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-json-icon lucide-file-json"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>自定义字段`INPUT[inlineList:customField]` 
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags-icon lucide-tags"><path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z"/><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"/><circle cx="10.5" cy="6.5" r=".5" fill="currentColor"/></svg>`INPUT[text(placeholder(搜索标签名),class(text-datacore)):searchTag]` `INPUT[datePicker(defaultValue(null)):startDate]`→ `INPUT[datePicker(defaultValue(null)):endDate]` <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-land-plot-icon lucide-land-plot"><path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/></svg>`INPUT[inlineSelect(option(Documents/I.P.A.R.A,所有领域), option(Documents/I.P.A.R.A/学习领域,学习领域), option(Documents/I.P.A.R.A/工作领域,工作领域),option(Documents/I.P.A.R.A/生活领域,生活领域)):areaPath]`   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`BUTTON[topic-filter]` `BUTTON[resetDatabase]`
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
                    // 简单哈希函数 
                    let hash = 0; 
                    for (let i = 0; i < tagText.length; i++) { 
                        const char = tagText.charCodeAt(i); 
                        hash = ((hash << 5) - hash) + char; 
                        hash = hash & hash; // 转换为32位整数 
                    } 
                    
                    // 生成柔和的颜色 
                    const hue = Math.abs(hash) % 360; 
                    const saturation = 45 + (Math.abs(hash) % 25); // 45-70% 
                    const lightness = 75 + (Math.abs(hash) % 15); // 75-90% 
                    
                    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`; 
                    const borderColor = `hsl(${hue}, ${saturation + 10}%, ${lightness - 15}%)`; 
                    const hoverColor = `hsl(${hue}, ${saturation + 5}%, ${lightness - 8}%)`; 
                    
                    return { backgroundColor, borderColor, hoverColor }; 
                }; 
                
                if (Array.isArray(tags)) { 
                    return ( 
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}> 
                            {tags.map((tag, index) => { 
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
                    const colors = generateTagColor(tags); 
                    return ( 
                        <button 
                            onClick={() => handleTagClick(tags)} 
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
                            {tags} 
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
                const pageTagsLower = pageTagsArray.map(tag => String(tag).toLowerCase());
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
