const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

// ==================== 辅助函数 ====================

// ISO 周计算
function getISOWeek(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
}

// 从文件名提取时间信息
function extractTimeFromFile(filePath) {
    const basename = filePath.split('/').pop().replace('.md', '');
    const dateMatch = basename.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
        return {
            year: dateMatch[1],
            month: dateMatch[1] + '-' + dateMatch[2],
            week: (() => {
                const weekInfo = getISOWeek(dateMatch[0]);
                return weekInfo.year + '-W' + String(weekInfo.week).padStart(2, '0');
            })()
        };
    }
    // 尝试匹配周记格式：gggg-[W]ww
    const weekMatch = basename.match(/^(\d{4})-W(\d{2})/);
    if (weekMatch) {
        return { year: weekMatch[1], week: weekMatch[0] };
    }
    // 尝试匹配月记格式：gggg-MM
    const monthMatch = basename.match(/^(\d{4}-\d{2})/);
    if (monthMatch) {
        return { year: monthMatch[1].substring(0, 4), month: monthMatch[1] };
    }
    // 尝试匹配年记格式：gggg
    const yearMatch = basename.match(/^(\d{4})/);
    if (yearMatch) {
        return { year: yearMatch[1] };
    }
    return {};
}

// ==================== 全局统计 ====================

function sumProperty(folderPath, propertyName) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
    let total = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) total += val;
    }
    return total;
}

function avgProperty(folderPath, propertyName) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
    let total = 0, count = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) { total += val; count++; }
    }
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

function countProperty(folderPath, propertyName) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
    let count = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) count++;
    }
    return count;
}

// ==================== 按当前笔记自动识别时间范围 ====================

// 获取当前活动笔记的时间信息
function getCurrentNoteTime() {
    const currentFile = engine.app.workspace.getActiveFile();
    if (!currentFile) return {};
    return extractTimeFromFile(currentFile.path);
}

// 智能统计：根据当前笔记文件名自动判断是日/周/月/年
function smartSum(folderPath, propertyName) {
    const timeInfo = getCurrentNoteTime();
    if (timeInfo.month) {
        return sumPropertyByMonth(folderPath, propertyName, timeInfo.month);
    } else if (timeInfo.week) {
        return sumPropertyByWeek(folderPath, propertyName, timeInfo.week);
    } else if (timeInfo.year) {
        return sumPropertyByYear(folderPath, propertyName, timeInfo.year);
    }
    return sumProperty(folderPath, propertyName);
}

function smartAvg(folderPath, propertyName) {
    const timeInfo = getCurrentNoteTime();
    if (timeInfo.month) {
        return avgPropertyByMonth(folderPath, propertyName, timeInfo.month);
    } else if (timeInfo.week) {
        return avgPropertyByWeek(folderPath, propertyName, timeInfo.week);
    } else if (timeInfo.year) {
        return avgPropertyByYear(folderPath, propertyName, timeInfo.year);
    }
    return avgProperty(folderPath, propertyName);
}

function smartCount(folderPath, propertyName) {
    const timeInfo = getCurrentNoteTime();
    if (timeInfo.month) {
        return countDaysByMonth(folderPath, propertyName, timeInfo.month);
    } else if (timeInfo.week) {
        return countDaysByWeek(folderPath, propertyName, timeInfo.week);
    } else if (timeInfo.year) {
        return countDaysByYear(folderPath, propertyName, timeInfo.year);
    }
    return countProperty(folderPath, propertyName);
}

// ==================== 月度统计 ====================

function sumPropertyByMonth(folderPath, propertyName, monthStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(folderPath) && file.basename.startsWith(monthStr)
    );
    let total = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) total += val;
    }
    return total;
}

function avgPropertyByMonth(folderPath, propertyName, monthStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(folderPath) && file.basename.startsWith(monthStr)
    );
    let total = 0, count = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) { total += val; count++; }
    }
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

function countDaysByMonth(folderPath, propertyName, monthStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(folderPath) && file.basename.startsWith(monthStr)
    );
    let count = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) count++;
    }
    return count;
}

// ==================== 周度统计 ====================

function sumPropertyByWeek(folderPath, propertyName, weekStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
    let total = 0;
    for (const file of files) {
        const dateMatch = file.basename.match(/^(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) continue;
        const weekInfo = getISOWeek(dateMatch[1]);
        const fileWeekStr = weekInfo.year + '-W' + String(weekInfo.week).padStart(2, '0');
        if (fileWeekStr === weekStr) {
            const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
            if (!isNaN(val)) total += val;
        }
    }
    return total;
}

function avgPropertyByWeek(folderPath, propertyName, weekStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
    let total = 0, count = 0;
    for (const file of files) {
        const dateMatch = file.basename.match(/^(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) continue;
        const weekInfo = getISOWeek(dateMatch[1]);
        const fileWeekStr = weekInfo.year + '-W' + String(weekInfo.week).padStart(2, '0');
        if (fileWeekStr === weekStr) {
            const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
            if (!isNaN(val)) { total += val; count++; }
        }
    }
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

function countDaysByWeek(folderPath, propertyName, weekStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
    let count = 0;
    for (const file of files) {
        const dateMatch = file.basename.match(/^(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) continue;
        const weekInfo = getISOWeek(dateMatch[1]);
        const fileWeekStr = weekInfo.year + '-W' + String(weekInfo.week).padStart(2, '0');
        if (fileWeekStr === weekStr) {
            const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
            if (!isNaN(val)) count++;
        }
    }
    return count;
}

// ==================== 年度统计 ====================

function sumPropertyByYear(folderPath, propertyName, yearStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(folderPath) && file.basename.startsWith(yearStr)
    );
    let total = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) total += val;
    }
    return total;
}

function avgPropertyByYear(folderPath, propertyName, yearStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(folderPath) && file.basename.startsWith(yearStr)
    );
    let total = 0, count = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) { total += val; count++; }
    }
    return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

function countDaysByYear(folderPath, propertyName, yearStr) {
    const files = engine.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(folderPath) && file.basename.startsWith(yearStr)
    );
    let count = 0;
    for (const file of files) {
        const val = Number(engine.app.metadataCache.getFileCache(file)?.frontmatter?.[propertyName]);
        if (!isNaN(val)) count++;
    }
    return count;
}

// ==================== 报告函数（交互式属性选择） ====================

// 月报（根据输入框的属性名动态展示）
function monthlyReportString(folderPath, monthStr, propertyName) {
    const sum = sumPropertyByMonth(folderPath, propertyName, monthStr);
    const avg = avgPropertyByMonth(folderPath, propertyName, monthStr);
    const days = countDaysByMonth(folderPath, propertyName, monthStr);
    
    let report = '';
    report += '📅 ' + monthStr + ' ' + propertyName + ' 月报\n';
    report += '📊 月度总计：' + sum + '\n';
    report += '📈 日均数值：' + avg + '\n';
    report += '📅 记录天数：' + days + ' 天\n';
    return report;
}

// 周报（根据输入框的属性名动态展示）
function weeklyReportString(folderPath, weekStr, propertyName) {
    const sum = sumPropertyByWeek(folderPath, propertyName, weekStr);
    const avg = avgPropertyByWeek(folderPath, propertyName, weekStr);
    const days = countDaysByWeek(folderPath, propertyName, weekStr);
    
    let report = '';
    report += '📅 ' + weekStr + ' ' + propertyName + ' 周报\n';
    report += '📊 周度总计：' + sum + '\n';
    report += '📈 日均数值：' + avg + '\n';
    report += '📅 记录天数：' + days + ' 天\n';
    return report;
}

// 年报（根据输入框的属性名动态展示）
function yearlyReportString(folderPath, yearStr, propertyName) {
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    
    // 先收集所有月份的数据，找出最大值
    const monthlyData = [];
    let yearTotal = 0, yearDays = 0;
    let maxVal = 0, maxMonth = '';
    
    for (const m of months) {
        const mSum = sumPropertyByMonth(folderPath, propertyName, yearStr + '-' + m);
        const mDays = countDaysByMonth(folderPath, propertyName, yearStr + '-' + m);
        monthlyData.push({ month: m, sum: mSum, days: mDays });
        yearTotal += mSum;
        yearDays += mDays;
        if (mSum > maxVal) { maxVal = mSum; maxMonth = m; }
    }
    
    let report = '';
    report += '🎯 ' + yearStr + '年 ' + propertyName + ' 年报\n';

    // 根据最大值绘制比例进度条（最大长度20个字符）
    const maxBarLen = 20;
    for (const data of monthlyData) {
        let bar = '';
        if (maxVal > 0 && data.sum > 0) {
            const ratio = data.sum / maxVal;
            const barLen = Math.max(1, Math.round(ratio * maxBarLen)); // 至少1个字符，避免0不显示
            bar = '█'.repeat(barLen);
        } else {
            bar = '—';
        }
        report += data.month + '月 ' + bar + ' ' + data.sum + '\n';
    }

    return report;
}

// ==================== 注册到 mathjs ====================

mb.mathJSImport({
    // 全局
    sumProperty: sumProperty,
    avgProperty: avgProperty,
    countProperty: countProperty,
    // 智能统计
    smartSum: smartSum,
    smartAvg: smartAvg,
    smartCount: smartCount,
    // 月度
    sumPropertyByMonth: sumPropertyByMonth,
    avgPropertyByMonth: avgPropertyByMonth,
    countDaysByMonth: countDaysByMonth,
    monthlyReportString: monthlyReportString,
    // 周度
    sumPropertyByWeek: sumPropertyByWeek,
    avgPropertyByWeek: avgPropertyByWeek,
    countDaysByWeek: countDaysByWeek,
    weeklyReportString: weeklyReportString,
    // 年度
    sumPropertyByYear: sumPropertyByYear,
    avgPropertyByYear: avgPropertyByYear,
    countDaysByYear: countDaysByYear,
    yearlyReportString: yearlyReportString
});

console.log('✅ 日记统计系统已加载！交互变量为属性名。');