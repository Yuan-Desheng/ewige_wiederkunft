
🔍`INPUT[text(placeholder(输入搜索词),class(text-30)):searchTerm3]`  📁`INPUT[text(placeholder(输入搜索路径|默认Documents),class(text-40)):searchPath3]` 
```dataviewjs
// 获取当前页面的元数据
const currentPage = dv.current()
// 从 Meta Bind 输入获取搜索关键词、路径和精确搜索设置
const term = currentPage.searchTerm3 ?? ""
const folderpath = currentPage.searchPath3 ?? "Documents"
const isPrecise = currentPage.searchPrecision ?? false

// 只有当有搜索关键词时才执行搜索
if (term) {
    // 获取指定文件夹下的所有 Markdown 文件
    const files = app.vault.getMarkdownFiles().filter(file => file.path.includes(folderpath))
    
    // 获取最近的标题并清理格式
    function getNearestHeader(lines, currentIndex) {
        for (let i = currentIndex; i >= 0; i--) {
            const line = lines[i]
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
            if (headerMatch) {
                return headerMatch[2].trim()
            }
        }
        return null
    }

    // 获取标题级别标识（H1-H6）
    function getHeaderLevel(text) {
        const match = text.match(/^(#{1,6})\s/)
        if (match) {
            return `H${match[1].length}`
        }
        return ""
    }

    // 检查是否在代码块内
    function isInCodeBlock(lines, currentIndex) {
        let codeBlockCount = 0
        for (let i = 0; i <= currentIndex; i++) {
            const line = lines[i].trim()
            // 检查三个反引号的代码块
            if (line.startsWith("```")) {
                codeBlockCount++
            }
        }
        // 如果代码块计数是奇数，说明当前行在代码块内
        return codeBlockCount % 2 === 1
    }

    // 检查行是否包含内联代码块（单个反引号）
    function hasInlineCode(line) {
        const matches = line.match(/`[^`]*`/g)
        return matches !== null
    }

    // 移除内联代码块内容
    function removeInlineCode(line) {
        return line.replace(/`[^`]*`/g, '')
    }

    // 检查文本是否匹配搜索词
    function isMatch(text, searchTerm3, precise) {
        // 检查是否搜索的是标题格式（以#开头）
        const headerSearch = searchTerm3.match(/^(#{1,6})\s*/)
        
        if (headerSearch) {
            const searchLevel = headerSearch[1].length
            const textMatch = text.match(/^(#{1,6})\s*(.*)$/)
            
            if (!textMatch) return false
            
            const textLevel = textMatch[1].length
            const textContent = textMatch[2]
            
            if (searchLevel !== textLevel) return false
            
            const searchContent = searchTerm3.substring(searchLevel).trim()
            if (precise) {
                return textContent === searchContent || 
                       (searchContent === "" && textContent !== "")
            } else {
                return searchContent === "" || textContent.includes(searchContent)
            }
        }
        
        if (precise) {
            return text === searchTerm3
        } else {
            return text.includes(searchTerm3)
        }
    }

    // 处理每个文件
    const arr = files.map(async (file) => {
        const content = await app.vault.cachedRead(file)
        const lines = content.split("\n")
        const matchedLines = []
        
        lines.forEach((line, index) => {
            // 如果在代码块内，跳过该行
            if (isInCodeBlock(lines, index)) {
                return
            }
            
            // 对于包含内联代码的行，移除代码块后再检查匹配
            let checkLine = line
            if (hasInlineCode(line)) {
                checkLine = removeInlineCode(line)
            }
            
            if (isMatch(checkLine, term, isPrecise)) {
                const nearestHeader = getNearestHeader(lines, index)
                if (nearestHeader) {
                    const level = getHeaderLevel(checkLine)
                    let cleanText = checkLine.match(/^#{1,6}\s+(.+)$/)?.[1] ?? checkLine.trim()
                    
                    // 如果文本是wiki链接，提取显示文本
                    const wikiLinkMatch = cleanText.match(/\[\[([^\]]+?)(#[^\]|]+?)?\|?([^\]]+?)?\]\]/)
                    if (wikiLinkMatch) {
                        cleanText = wikiLinkMatch[3] || wikiLinkMatch[1]
                        const searchContent = `${level ? `${level}: ` : ""}[[${wikiLinkMatch[1]}${wikiLinkMatch[2] || ''}|${cleanText}]]`
                        matchedLines.push({
                            searchContent: searchContent,
                            noteName: file.basename
                        })
                    } else {
                        matchedLines.push({
                            searchContent: `${level ? `${level}: ` : ""}[[${file.basename}#${nearestHeader}|${cleanText}]]`,
                            noteName: file.basename
                        })
                    }
                }
            }
        })
        
        return matchedLines
    })

    // 处理所有结果并创建表格
    Promise.all(arr).then(values => {
        const flatResults = values.flat()
        dv.table(
            ["搜索内容", "笔记名称"],
            flatResults.map(result => [result.searchContent, result.noteName])
        )
    })
}
```
