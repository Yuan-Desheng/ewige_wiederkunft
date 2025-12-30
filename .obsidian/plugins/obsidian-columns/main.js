/**
 * Obsidian Columns - 允许在Obsidian中创建列布局的插件
 * 
 * Copyright (C) 2023 Trevor Nichols
 * Copyright (C) 2025 ytmaps_鱼先生
 * 原始仓库: https://github.com/tnichols217/obsidian-columns，ytmaps_鱼先生对原始仓库代码进行了大量修改、优化，使其功能更加强大。
 * 
 * 本程序是自由软件：你可以根据自由软件基金会发布的GNU通用公共许可证（版本3或更高版本）重新分发和/或修改它。
 * 
 * 本程序的发布是希望它能有所帮助，但没有任何保证；甚至没有对适销性或特定用途适用性的暗示保证。
 * 更多详情，请参阅GNU通用公共许可证。
 * 
 * 你应该已经收到了一份GNU通用公共许可证的副本。如果没有，请参阅 <https://www.gnu.org/licenses/>。
 */

const { Plugin, MarkdownRenderChild, MarkdownRenderer, PluginSettingTab, App, Modal, Setting } = require('obsidian');

const NAME = "Obsidian Columns";
const COLUMNNAME = "col";
const COLUMNMD = COLUMNNAME + "-md";
const TOKEN = "!!!";
const SETTINGSDELIM = "===";
const COLUMNPADDING = 10;
const MINWIDTHVARNAME = '--obsidian-columns-min-width';
const DEFSPANVARNAME = '--obsidian-columns-def-span';
const CODEBLOCKFENCE = "`";

function createSetting(containerEl, keyval, currentValue, onChange) {
    let setting = new Setting(containerEl)
        .setName(keyval[1].name)
        .setDesc(keyval[1].desc);

    if (typeof keyval[1].value === "boolean") {
        setting.addToggle(toggle => toggle
            .setValue(currentValue)
            .onChange((bool) => {
                onChange(bool, keyval[0]);
            })
        );
    } else {
        setting.addText(text => text
            .setPlaceholder(String(keyval[1].value))
            .setValue(String(currentValue))
            .onChange((value) => {
                onChange(parseObject(value, typeof keyval[1].value), keyval[0]);
            })
        );
    }
}

function display(obj, DEFAULT_SETTINGS, name) {
    const { containerEl } = obj;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Settings for ' + name });

    let keyvals = Object.entries(DEFAULT_SETTINGS);

    for (let keyval of keyvals) {
        createSetting(containerEl, keyval, obj.plugin.settings[keyval[0]].value, (value, key) => {
            obj.plugin.settings[key].value = value;
            obj.plugin.saveSettings();
        });
    }
}

async function loadSettings(obj, DEFAULT_SETTINGS) {
    return new Promise((resolve, reject) => {
        obj.settings = DEFAULT_SETTINGS;
        obj.loadData().then((data) => {
            if (data) {
                let items = Object.entries(data);
                items.forEach((item) => {
                    obj.settings[item[0]].value = item[1];
                });
            }
        }).then(resolve).catch(reject);
    });
}

async function saveSettings(obj, DEFAULT_SETTINGS) {
    let saveData = {};
    Object.entries(obj.settings).forEach((i) => {
        saveData[i[0]] = i[1].value;
        i[1].onChange(i[1].value);
    });
    await obj.saveData(saveData);
}

function parseObject(value, typ) {
    if (typ === "string") {
        return value;
    }
    if (typ === "boolean") {
        return parseBoolean(value);
    }
    if (typ === "number") {
        return parseFloat(value);
    }
}

function parseBoolean(value) {
    return (value === "yes" || value === "true");
}

const DEFAULT_SETTINGS = {
    wrapSize: {
        value: 100,
        name: "Minimum width of column",
        desc: "Columns will have this minimum width before wrapping to a new row. 0 disables column wrapping. Useful for smaller devices",
        onChange: (val) => {
            document.querySelector(':root').style.setProperty(MINWIDTHVARNAME, val.toString() + "px");
        }
    },
    defaultSpan: {
        value: 1,
        name: "The default span of an item",
        desc: "The default width of a column. If the minimum width is specified, the width of the column will be multiplied by this setting.",
        onChange: (val) => {
            document.querySelector(':root').style.setProperty(DEFSPANVARNAME, val.toString());
        }
    }
};

let findSettings = (source, unallowed = ["`"], delim = SETTINGSDELIM) => {
    let lines = source.split("\n");

    let done = false;

    lineLoop: for (let line of lines) {
        for (let j of unallowed) {
            if (line.contains(j)) {
                break lineLoop;
            }
            if (line === delim) {
                let split = source.split(delim + "\n");
                if (split.length > 1) {
                    return { settings: split[0], source: split.slice(1).join(delim + "\n") };
                }
                break lineLoop;
            }
        }
    }
    return { settings: "", source: source };
};

let parseSettings = (settings) => {
    let o = {};
    settings.split("\n").map((i) => {
        return i.split(";");
    }).reduce((a, b) => {
        a.push(...b);
        return a;
    }, []).map((i) => {
        return i.split("=").map((j) => {
            return j.trim();
        }).slice(0, 2);
    }).forEach((i) => {
        o[i[0]] = i[1];
    });
    return o;
};

let countBeginning = (source) => {
    let out = 0;
    let letters = source.split("");
    for (let letter of letters) {
        if (letter === CODEBLOCKFENCE) {
            out++;
        } else {
            break;
        }
    }
    return out;
};

let parseRows = (source) => {
    let lines = source.split("\n");
    let rows = [];
    let curToken = 0;
    let newToken = 0;
    let curRow = [];
    for (let line of lines) {
        let newCount = countBeginning(line);
        newToken = newCount < 3 ? 0 : newCount;
        if (curToken === 0 && newToken === 0 && line.startsWith(SETTINGSDELIM)) {
            rows.push(curRow.join("\n"));
            curRow = [];
            continue;
        } else if (curToken === 0) {
            curToken = newToken;
        } else if (curToken === newToken) {
            curToken = 0;
        }
        curRow.push(line);
    }
    rows.push(curRow.join("\n"));
    return rows;
};

let parseDirtyNumber = (num) => {
    return parseFloat(num.split("")
        .filter((char) => "0123456789.".contains(char))
        .join(""));
};

class ObsidianColumns extends Plugin {
    // 新增：跟踪所有正在编辑的列
    editingColumns = new Map(); // 存储正在编辑的列信息
    
    generateCssString = (span) => {
        let o = {};
        o.flexGrow = span.toString();
        o.flexBasis = (this.settings.wrapSize.value * span).toString() + "px";
        o.width = (this.settings.wrapSize.value * span).toString() + "px";
        return o;
    };

    // 生成唯一的文件名
    generateUniqueFileName = async (attachmentPath, baseName, extension) => {
        let fileName = `${baseName}.${extension}`;
        let fullPath = `${attachmentPath}/${fileName}`;
        
        // 如果文件不存在，直接返回
        if (!(await this.app.vault.adapter.exists(fullPath))) {
            return fileName;
        }
        
        // 如果文件存在，添加数字后缀
        let counter = 1;
        do {
            fileName = `${baseName}_${counter}.${extension}`;
            fullPath = `${attachmentPath}/${fileName}`;
            counter++;
        } while (await this.app.vault.adapter.exists(fullPath));
        
        return fileName;
    };

    applyStyle = (el, styles) => {
        Object.assign(el.style, styles);
    };

    processChild = (c) => {
        if (c.firstChild != null && "tagName" in c.firstChild && c.firstChild.tagName === "BR") {
            c.removeChild(c.firstChild);
        }
        let firstChild = c;

        while (firstChild != null) {
            if ("style" in firstChild) {
                firstChild.style.marginTop = "0px";
            }
            firstChild = firstChild.firstChild;
        }
        let lastChild = c;
        while (lastChild != null) {
            if ("style" in lastChild) {
                lastChild.style.marginBottom = "0px";
            }
            lastChild = lastChild.lastChild;
        }
    };

    makeColumnEditable = (columnElement, columnSource, fullSource, columnIndex, ctx) => {
        let contentToEdit = this.extractColumnContent(columnSource);
        columnElement.dataset.columnIndex = columnIndex;
        columnElement.dataset.columnSource = columnSource;
        columnElement.dataset.fullSource = fullSource;
        columnElement.dataset.originalContent = contentToEdit;
        columnElement.dataset.sourcePath = ctx.sourcePath;
        if (columnElement.dataset.hasEventListeners === 'true') {
            return;
        }

        const clickHandler = (e) => {
            if (e.target.closest('a.internal-link') || e.target.closest('a[data-href]')) {
                return;
            }
            e.stopPropagation();

            if (columnElement.classList.contains('editing-mode')) {
                return;
            }

            this.enterEditMode(columnElement, contentToEdit, columnSource, fullSource, columnIndex, ctx);
        };
        
        const mouseenterHandler = () => {
            if (!columnElement.classList.contains('editing-mode')) {
                columnElement.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                columnElement.style.borderRadius = '4px';
            }
        };
        
        const mouseleaveHandler = () => {
            if (!columnElement.classList.contains('editing-mode')) {
                columnElement.style.backgroundColor = '';
                columnElement.style.borderRadius = '';
            }
        };

        columnElement.addEventListener('click', clickHandler);
        columnElement.addEventListener('mouseenter', mouseenterHandler);
        columnElement.addEventListener('mouseleave', mouseleaveHandler);
        columnElement.dataset.clickHandler = clickHandler;
        columnElement.dataset.mouseenterHandler = mouseenterHandler;
        columnElement.dataset.mouseleaveHandler = mouseleaveHandler;
        columnElement.dataset.hasEventListeners = 'true';
        columnElement.style.cursor = 'pointer';
        columnElement.classList.add('editable-column');
    };


    enterEditMode = (columnElement, originalContent, columnSource, fullSource, columnIndex, ctx) => {
        columnElement.classList.add('editing-mode');
        columnElement.style.backgroundColor = 'transparent';
        columnElement.style.border = '2px solid rgb(54 139 140)';
        columnElement.style.borderRadius = '6px';
        columnElement.style.padding = '10px';
        
        // 保存原始内容并隐藏
        const originalHTML = columnElement.innerHTML;
        columnElement.dataset.originalHTML = originalHTML;
        
        // 隐藏所有原始内容
        const originalChildren = Array.from(columnElement.children);
        originalChildren.forEach(child => {
            if (!child.classList.contains('column-resize-handle')) {
                child.style.display = 'none';
            }
        });
        
        const editContainer = columnElement.createDiv('column-edit-container');
        editContainer.style.setProperty('width', '100%', 'important');
        editContainer.style.setProperty('height', '100%', 'important');
        editContainer.style.setProperty('display', 'flex', 'important');
        editContainer.style.setProperty('flex-direction', 'column', 'important');
        const textArea = editContainer.createEl('textarea', 'column-edit-textarea');
        textArea.value = originalContent;
        textArea.style.setProperty('width', '100%', 'important');
        textArea.style.setProperty('min-height', '200px', 'important');
        textArea.style.setProperty('max-height', '200px', 'important');
        textArea.style.setProperty('font-size', '14px', 'important');
        textArea.style.setProperty('padding', '10px', 'important');
        textArea.style.setProperty('border', '1px solid #ccc', 'important');
        textArea.style.setProperty('border-radius', '4px', 'important');
        textArea.style.setProperty('resize', 'both', 'important');
        textArea.style.setProperty('overflow', 'auto', 'important');
        textArea.style.setProperty('background-color', 'transparent', 'important');
        textArea.style.setProperty('color', '#333', 'important');
        textArea.style.setProperty('box-sizing', 'border-box', 'important');
        textArea.style.setProperty('margin-bottom', '10px', 'important');
        this.setupAutocomplete(textArea, ctx.sourcePath);
        
        // 存储编辑信息到全局Map中
        const editKey = `${ctx.sourcePath}_${columnIndex}`;
        this.editingColumns.set(editKey, {
            columnElement,
            textArea,
            originalContent,
            columnSource,
            fullSource,
            columnIndex,
            ctx,
            handleClickOutside: null
        });
        
        const handleClickOutside = (event) => {
            if (!columnElement.contains(event.target)) {
                this.saveAllEditingColumns();
            }
        };
        
        // 更新存储的handleClickOutside引用
        this.editingColumns.get(editKey).handleClickOutside = handleClickOutside;
        
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
        textArea.addEventListener('keydown', (e) => {
            if (this.autocompleteContainer && this.autocompleteContainer.style.display !== 'none') {
                return;
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelEdit(columnElement);
                document.removeEventListener('click', handleClickOutside);
            }
        });
        
        // 添加粘贴事件监听器，确保图片正确插入到===和````之间
        textArea.addEventListener('paste', async (e) => {
            const clipboardData = e.clipboardData || window.clipboardData;
            if (!clipboardData) return;
            
            const items = clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    
                    try {
                        const file = item.getAsFile();
                        if (!file) continue;
                        
                        // 生成唯一的文件名
                        const now = new Date();
                        const timestamp = now.getFullYear().toString() + 
                                        (now.getMonth() + 1).toString().padStart(2, '0') + 
                                        now.getDate().toString().padStart(2, '0') + 
                                        now.getHours().toString().padStart(2, '0') + 
                                        now.getMinutes().toString().padStart(2, '0') + 
                                        now.getSeconds().toString().padStart(2, '0');
                        const extension = file.type.split('/')[1] || 'png';
                        const fileName = `Pasted image_${timestamp}.${extension}`;
                        
                        // 读取文件内容
                        const arrayBuffer = await file.arrayBuffer();
                        
                        // 获取附件文件夹路径
                        const attachmentFolder = this.app.vault.adapter.getResourcePath('');
                        let attachmentPath = this.app.vault.config?.attachmentFolderPath || '';
                        
                        // 如果没有设置附件文件夹，使用默认路径
                        if (!attachmentPath) {
                            attachmentPath = 'attachments';
                        }
                        
                        // 确保附件文件夹存在
                        const folderExists = await this.app.vault.adapter.exists(attachmentPath);
                        if (!folderExists) {
                            await this.app.vault.createFolder(attachmentPath);
                        }
                        
                        // 完整的文件路径
                        const fullPath = `${attachmentPath}/${fileName}`;
                        
                        // 保存文件到vault
                        await this.app.vault.createBinary(fullPath, arrayBuffer);
                        
                        // 生成Obsidian格式的图片链接
                        const imageLink = `![[${fileName}]]`;
                        
                        // 插入到当前光标位置
                        const cursorPos = textArea.selectionStart;
                        const textBefore = textArea.value.substring(0, cursorPos);
                        const textAfter = textArea.value.substring(textArea.selectionEnd);
                        
                        textArea.value = textBefore + imageLink + textAfter;
                        
                        // 设置光标位置到插入内容之后
                        const newCursorPos = cursorPos + imageLink.length;
                        textArea.setSelectionRange(newCursorPos, newCursorPos);
                        
                        // 触发input事件以便其他功能能够响应
                        textArea.dispatchEvent(new Event('input', { bubbles: true }));
                        
                        // 检查Imagen插件是否启用重命名功能
                        const imagenPlugin = this.app.plugins.plugins['imagen'];
                        const isImagenRenameEnabled = imagenPlugin?.settings?.imageRename?.enabled && 
                                                    !imagenPlugin?.settings?.objectStorage?.enabled;
                        
                        if (isImagenRenameEnabled) {
                            // 弹出重命名对话框
                            const defaultName = fileName.replace(/\.[^/.]+$/, "");
                            const renameModal = new RenameModal(this.app, defaultName, async (newName) => {
                                if (newName && newName.trim() && newName.trim() !== defaultName) {
                                    try {
                                        // 生成唯一的文件名
                                        const uniqueFileName = await this.generateUniqueFileName(attachmentPath, newName.trim(), extension);
                                        const uniqueFullPath = `${attachmentPath}/${uniqueFileName}`;
                                        
                                        // 如果生成的文件名与期望的不同，说明原名称已存在
                                        if (uniqueFileName !== `${newName.trim()}.${extension}`) {
                                            new Notice(`文件名已存在，自动重命名为: ${uniqueFileName}`);
                                        }
                                        
                                        // 重命名文件
                                        await this.app.vault.rename(this.app.vault.getAbstractFileByPath(fullPath), uniqueFullPath);
                                        
                                        // 使用最终的文件名和路径
                                        const finalFileName = uniqueFileName;
                                        const finalFullPath = uniqueFullPath;
                                        
                                        // 更新textarea中的链接
                                        const newImageLink = `![[${finalFileName}]]`;
                                        
                                        // 获取当前textarea的值和光标位置
                                        const currentValue = textArea.value;
                                        const currentCursorPos = textArea.selectionStart;
                                        
                                        // 找到刚插入的图片链接并替换
                                        const beforeCursor = currentValue.substring(0, currentCursorPos);
                                        const afterCursor = currentValue.substring(currentCursorPos);
                                        
                                        // 查找最近插入的图片链接
                                        const lastImageLinkIndex = beforeCursor.lastIndexOf(imageLink);
                                        if (lastImageLinkIndex !== -1) {
                                            // 替换找到的链接
                                            const updatedValue = 
                                                beforeCursor.substring(0, lastImageLinkIndex) + 
                                                newImageLink + 
                                                beforeCursor.substring(lastImageLinkIndex + imageLink.length) + 
                                                afterCursor;
                                            
                                            textArea.value = updatedValue;
                                            
                                            // 重新计算光标位置
                                            const lengthDiff = newImageLink.length - imageLink.length;
                                            const newCursorPosition = currentCursorPos + lengthDiff;
                                            textArea.setSelectionRange(newCursorPosition, newCursorPosition);
                                        } else {
                                            // 如果没找到，直接替换整个值中的链接
                                            const updatedValue = currentValue.replace(imageLink, newImageLink);
                                            textArea.value = updatedValue;
                                            
                                            // 设置光标到新链接的末尾
                                            const newLinkIndex = updatedValue.indexOf(newImageLink);
                                            if (newLinkIndex !== -1) {
                                                const newCursorPosition = newLinkIndex + newImageLink.length;
                                                textArea.setSelectionRange(newCursorPosition, newCursorPosition);
                                            }
                                        }
                                        
                                        // 触发input事件以便其他功能响应
                                        textArea.dispatchEvent(new Event('input', { bubbles: true }));
                                        
                                    } catch (renameError) {
                                        // 提供更详细的错误信息
                                        if (renameError.message.includes('already exists')) {
                                        } else if (renameError.message.includes('not found')) {
                                        } else {
                                        }
                                    }
                                } else if (newName === null) {
                                } else if (newName === defaultName) {
                                } else {
                                }
                            });
                            renameModal.open();
                        }
                        
                    } catch (error) {
                    }
                    
                    break; // 只处理第一个图片
                }
            }
        });
        
        textArea.focus();
        textArea.select();
    };
    // 新增：保存所有正在编辑的列
    saveAllEditingColumns = async () => {
        if (this.editingColumns.size === 0) return;
        
        // 按源文件分组编辑的列
        const columnsByFile = new Map();
        
        for (const [editKey, editInfo] of this.editingColumns) {
            const { ctx, columnIndex, textArea, fullSource } = editInfo;
            const sourcePath = ctx.sourcePath;
            
            if (!columnsByFile.has(sourcePath)) {
                columnsByFile.set(sourcePath, {
                    fullSource,
                    columns: []
                });
            }
            
            const fileInfo = columnsByFile.get(sourcePath);
            fileInfo.columns.push({
                columnIndex,
                newContent: textArea.value
            });
        }
        
        // 为每个文件批量更新所有列
        for (const [sourcePath, fileInfo] of columnsByFile) {
            await this.batchUpdateColumns(sourcePath, fileInfo.fullSource, fileInfo.columns);
        }
        
        // 清理所有编辑状态
        this.clearAllEditingColumns();
    };
    
    // 新增：批量更新多个列
    batchUpdateColumns = async (sourcePath, fullSource, columns) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) return;
            
            const fileContent = await this.app.vault.read(file);
            let updatedFullSource = fullSource;
            
            // 按列索引倒序排列，避免更新时索引变化
            const sortedColumns = columns.sort((a, b) => b.columnIndex - a.columnIndex);
            
            // 逐个更新每个列
            for (const { columnIndex, newContent } of sortedColumns) {
                updatedFullSource = this.updateColumnInFullSource(updatedFullSource, newContent, columnIndex);
            }
            
            // 写入文件
            const newFileContent = fileContent.replace(fullSource, updatedFullSource);
            await this.app.vault.modify(file, newFileContent);
            
        } catch (error) {
        }
    };
    
    // 新增：清理所有编辑状态
    clearAllEditingColumns = () => {
        for (const [editKey, editInfo] of this.editingColumns) {
            const { columnElement, handleClickOutside } = editInfo;
            
            // 移除事件监听器
            if (handleClickOutside) {
                document.removeEventListener('click', handleClickOutside);
            }
            
            // 退出编辑模式
            this.exitEditMode(columnElement);
        }
        
        // 清空Map
        this.editingColumns.clear();
    };

    saveEdit = (columnElement, newContent, columnSource, fullSource, columnIndex, ctx) => {
        this.exitEditMode(columnElement);
        this.reloadEntireCodeBlock(ctx.sourcePath, fullSource, columnIndex, newContent);
    };
    cancelEdit = (columnElement) => {
        // 找到对应的编辑信息
        let targetEditKey = null;
        for (const [editKey, editInfo] of this.editingColumns) {
            if (editInfo.columnElement === columnElement) {
                targetEditKey = editKey;
                break;
            }
        }
        
        if (targetEditKey) {
            const editInfo = this.editingColumns.get(targetEditKey);
            const { originalContent, columnSource, handleClickOutside } = editInfo;
            
            // 恢复原始内容
            if (originalContent) {
                this.updateColumnContent(columnElement, originalContent, columnSource, { sourcePath: columnElement.dataset.sourcePath });
            }
            
            // 移除事件监听器
            if (handleClickOutside) {
                document.removeEventListener('click', handleClickOutside);
            }
            
            // 从Map中移除
            this.editingColumns.delete(targetEditKey);
        }
        
        this.exitEditMode(columnElement);
    };
    exitEditMode = (columnElement) => {
        columnElement.classList.remove('editing-mode');
        columnElement.style.backgroundColor = '';
        columnElement.style.border = '';
        columnElement.style.borderRadius = '';
        columnElement.style.padding = '';
        
        // 移除编辑容器
        const editContainer = columnElement.querySelector('.column-edit-container');
        if (editContainer) {
            editContainer.remove();
        }
        
        // 恢复原始内容的显示
        const originalChildren = Array.from(columnElement.children);
        originalChildren.forEach(child => {
            if (!child.classList.contains('column-resize-handle')) {
                child.style.display = '';
            }
        });
        
        // 清理自动补全相关资源
        this.hideAutocomplete();
        if (this.autocompleteContainer) {
            this.autocompleteContainer.remove();
            this.autocompleteContainer = null;
        }
        this.cachedFiles = null;
        this.cachedFilesTimestamp = null;
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    };
    setupAutocomplete = (textArea, sourcePath) => {
        let debounceTimer = null;
        textArea.addEventListener('input', (e) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                const cursorPos = textArea.selectionStart;
                const text = textArea.value;
                const beforeCursor = text.substring(0, cursorPos);
                const match = beforeCursor.match(/\[\[([^\]]*)$/);
                if (match) {
                    const query = match[1];
                    if (query.length > 0) {
                        this.showAutocomplete(textArea, query, sourcePath, cursorPos);
                    } else {
                        this.hideAutocomplete();
                    }
                } else {
                    this.hideAutocomplete();
                }
            }, 150); 
        });
        
        textArea.addEventListener('keydown', (e) => {
            if (!this.autocompleteContainer || this.autocompleteContainer.style.display === 'none') {
                return;
            }
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNextSuggestion();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPreviousSuggestion();
                    break;
                case 'Enter':
                case 'Tab':
                    e.preventDefault();
                    this.insertSuggestion(textArea);
                    break;
                case 'Escape':
                    this.hideAutocomplete();
                    break;
            }
        });
        this.currentTextArea = textArea;
    };

    showAutocomplete = (textArea, query, sourcePath, insertPos) => {
        if (!this.cachedFiles || !this.cachedFilesTimestamp || Date.now() - this.cachedFilesTimestamp > 5000) {
            this.cachedFiles = this.app.vault.getFiles();
            this.cachedFilesTimestamp = Date.now();
        }
        
        const suggestions = this.cachedFiles
            .filter(file => {
                if (!file || !file.basename) return false;
                const fileName = file.basename.toLowerCase();
                const queryLower = query.toLowerCase();
                return fileName.includes(queryLower);
            })
            .map(file => ({
                name: file.basename,
                path: file.path,
                displayName: file.extension ? `${file.basename}.${file.extension}` : file.basename
            }))
            .slice(0, 8); 
        
        if (suggestions.length === 0) {
            this.hideAutocomplete();
            return;
        }

        if (!this.autocompleteContainer) {
            this.autocompleteContainer = document.createElement('div');
            this.autocompleteContainer.className = 'column-autocomplete';
            this.autocompleteContainer.style.cssText = `
                position: absolute;
                background: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                max-height: 160px;
                overflow-y: auto;
                z-index: 1000;
                font-size: 14px;
            `;
            document.body.appendChild(this.autocompleteContainer);
        }

        const fragment = document.createDocumentFragment();
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid var(--background-modifier-border);
            `;
            item.textContent = suggestion.displayName;
            
            if (index === 0) {
                item.classList.add('selected');
            }
            
            item.addEventListener('click', () => {
                this.insertSuggestionAtPosition(textArea, suggestion.displayName, insertPos);
            });
            
            fragment.appendChild(item);
        });
        
        this.autocompleteContainer.innerHTML = '';
        this.autocompleteContainer.appendChild(fragment);
        const rect = textArea.getBoundingClientRect();
        const textBeforeCursor = textArea.value.substring(0, textArea.selectionStart);
        const lines = textBeforeCursor.split('\n');
        const lineHeight = 20; 
        
        this.autocompleteContainer.style.left = rect.left + 'px';
        this.autocompleteContainer.style.top = (rect.top + (lines.length - 1) * lineHeight + 40) + 'px';
        this.autocompleteContainer.style.display = 'block';
        this.suggestions = suggestions;
        this.selectedIndex = 0;
        this.currentTextArea = textArea;
        this.currentInsertPos = insertPos;
        this.currentQuery = query;
    };

    hideAutocomplete = () => {
        if (this.autocompleteContainer) {
            this.autocompleteContainer.style.display = 'none';
        }
    };

    selectNextSuggestion = () => {
        if (this.suggestions.length === 0) return;
        
        this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
        this.updateSelection();
    };

    selectPreviousSuggestion = () => {
        if (this.suggestions.length === 0) return;
        
        this.selectedIndex = this.selectedIndex === 0 ? this.suggestions.length - 1 : this.selectedIndex - 1;
        this.updateSelection();
    };

    updateSelection = () => {
        const items = this.autocompleteContainer.querySelectorAll('.autocomplete-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    };

    insertSuggestion = (textArea) => {
        if (this.suggestions.length === 0) return;
        
        const selectedSuggestion = this.suggestions[this.selectedIndex];
        this.insertSuggestionAtPosition(textArea, selectedSuggestion.displayName, this.currentInsertPos);
    };

    insertSuggestionAtPosition = (textArea, suggestion, insertPos) => {
        const text = textArea.value;
        const beforeInsert = text.substring(0, insertPos);
        const afterInsert = text.substring(insertPos);
        const openBracketPos = beforeInsert.lastIndexOf('[[');
        const newText = beforeInsert.substring(0, openBracketPos) + '[[' + suggestion + ']]' + afterInsert;
        textArea.value = newText;
        const newCursorPos = openBracketPos + suggestion.length + 4; 
        textArea.setSelectionRange(newCursorPos, newCursorPos);
        
        this.hideAutocomplete();
        textArea.focus();
    };
    extractColumnContent = (source) => {
        let lines = source.split('\n');
        let contentLines = [];
        let inContent = false;
        
        for (let line of lines) {
            if (line.trim() === SETTINGSDELIM) {
                inContent = true;
                continue;
            }
            if (inContent && line.trim().startsWith('```')) {
                break;
            }
            if (inContent) {
                contentLines.push(line);
            }
        }
        
        return contentLines.join('\n').trim();
    };
    isColumnEditable = (columnSource) => {
        let lines = columnSource.split('\n');
        for (let line of lines) {
            let trimmedLine = line.trim();
            if (trimmedLine === 'columneditable:true') {
                return true;
            }
        }
        return false;
    };

    addColumnResizeHandle = (columnElement, parentElement, columnIndex) => {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'column-resize-handle';
        resizeHandle.style.cssText = `
            position: absolute;
            right: -5px;
            top: 0;
            bottom: 0;
            width: 10px;
            cursor: col-resize;
            z-index: 10;
            background: transparent;
            transition: background-color 0.2s ease;
            pointer-events: auto;
            user-select: none;
            /* 确保手柄始终在正确位置 */
            transform: translateZ(0);
        `;
        
        resizeHandle.addEventListener('mouseenter', () => {
            resizeHandle.style.backgroundColor = 'rgba(100, 150, 255, 0.3)';
        });
        
        resizeHandle.addEventListener('mouseleave', () => {
            if (!resizeHandle.classList.contains('dragging')) {
                resizeHandle.style.backgroundColor = 'transparent';
            }
        });

        let isDragging = false;
        let startX = 0;
        let startWidth = 0;
        let originalFlexGrow = 0;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;

            startX = e.clientX;
            startWidth = columnElement.offsetWidth;
            originalFlexGrow = parseFloat(columnElement.style.flexGrow) || 1;
            columnElement.style.transition = 'none';
            parentElement.style.transition = 'none';
            resizeHandle.classList.add('dragging');
            resizeHandle.style.backgroundColor = 'rgba(100, 150, 255, 0.5)';
            columnElement.classList.add('dragging');
            parentElement.classList.add('dragging');
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const parentWidth = parentElement.offsetWidth;
            const gap = 20; 
            const totalGaps = parentElement.children.length - 1;
            const availableWidth = parentWidth - (totalGaps * gap);
            const newWidth = Math.max(50, startWidth + deltaX); 
            const maxWidth = availableWidth * 0.8; 
            const clampedWidth = Math.min(newWidth, maxWidth);
            columnElement.style.width = clampedWidth + 'px';
            columnElement.style.flexBasis = clampedWidth + 'px';
            columnElement.style.flexGrow = '0'; 
        };
        
                const handleMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            resizeHandle.classList.remove('dragging');
            resizeHandle.style.backgroundColor = 'transparent';
            columnElement.classList.remove('dragging');
            parentElement.classList.remove('dragging');
            columnElement.style.transition = '';
            parentElement.style.transition = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            const finalWidth = columnElement.offsetWidth;
            const parentWidth = parentElement.offsetWidth;
            const gap = 20;
            const totalGaps = parentElement.children.length - 1;
            const availableWidth = parentWidth - (totalGaps * gap);
            const allColumns = Array.from(parentElement.children);
            const currentColumnIndex = allColumns.indexOf(columnElement);
            const newFlexGrows = this.calculateProportionalFlexGrows(
                allColumns, 
                currentColumnIndex, 
                finalWidth, 
                availableWidth
            );

            allColumns.forEach((col, index) => {
                const newFlexGrow = newFlexGrows[index];
                col.style.flexGrow = newFlexGrow.toString();
                col.style.flexBasis = '';
                col.style.width = '';
            });

            this.saveColumnWidth(columnElement, parentElement, columnIndex);
            const flexGrows = allColumns.map(col => parseFloat(col.style.flexGrow) || 1);
            this.validateFlexGrowCalculation(flexGrows, allColumns);
            
            this.showResizeSuccess(columnElement, flexGrows);
        };
        
        columnElement.style.position = 'relative';
        columnElement.style.overflow = 'visible';
        columnElement.appendChild(resizeHandle);
    };

    saveColumnWidth = (columnElement, parentElement, columnIndex) => {
        const allColumns = Array.from(parentElement.children);
        const flexGrows = allColumns.map(col => parseFloat(col.style.flexGrow) || 1);
        const sourcePath = columnElement.dataset.sourcePath;
        const fullSource = columnElement.dataset.fullSource;
        
        if (sourcePath && fullSource) {
            this.updateAllFlexGrowsInSource(sourcePath, fullSource, flexGrows);
        }

        allColumns.forEach((col, index) => {
            const innerElement = col.querySelector('.block-language-col-md');
            if (innerElement && innerElement.childNodes[0]) {
                innerElement.childNodes[0].style.flexGrow = flexGrows[index].toString();
            }
        });
    };

    calculateProportionalFlexGrows = (allColumns, currentColumnIndex, newWidth, availableWidth) => {
        const totalColumns = allColumns.length;
        const currentFlexGrows = allColumns.map(col => parseFloat(col.style.flexGrow) || 1);
        const newFlexGrowForCurrentColumn = Math.max(0.1, (newWidth / availableWidth) * totalColumns);
        const otherColumnsTotalFlexGrow = currentFlexGrows.reduce((sum, fg, index) => 
            index === currentColumnIndex ? sum : sum + fg, 0);
        if (otherColumnsTotalFlexGrow === 0) {
            const equalFlexGrow = Math.max(0.1, (availableWidth - newWidth) / availableWidth * totalColumns / (totalColumns - 1));
            const result = [];
            for (let i = 0; i < totalColumns; i++) {
                if (i === currentColumnIndex) {
                    result.push(Math.round(newFlexGrowForCurrentColumn * 100) / 100);
                } else {
                    result.push(Math.round(equalFlexGrow * 100) / 100);
                }
            }
            return result;
        }

        const result = [];
        for (let i = 0; i < totalColumns; i++) {
            if (i === currentColumnIndex) {
                result.push(Math.round(newFlexGrowForCurrentColumn * 100) / 100);
            } else {
                const proportion = currentFlexGrows[i] / otherColumnsTotalFlexGrow;
                const remainingFlexGrow = Math.max(0.1, (availableWidth - newWidth) / availableWidth * totalColumns);
                const newFlexGrow = remainingFlexGrow * proportion;
                result.push(Math.round(newFlexGrow * 100) / 100);
            }
        }
        
        return result;
    };

    validateFlexGrowCalculation = (flexGrows, allColumns) => {
        const totalFlexGrow = flexGrows.reduce((sum, fg) => sum + fg, 0);
        const columnCount = allColumns.length;
        const hasZeroOrNegative = flexGrows.some(fg => fg <= 0);
        if (hasZeroOrNegative) {
        }
        const hasPrecisionIssues = flexGrows.some(fg => fg.toString().includes('e-') || fg > 1000);
        if (hasPrecisionIssues) {
        }
        const ratios = [];
        for (let i = 0; i < flexGrows.length; i++) {
            for (let j = i + 1; j < flexGrows.length; j++) {
                if (flexGrows[j] > 0) {
                    ratios.push(flexGrows[i] / flexGrows[j]);
                }
            }
        }
        
    };

    calculateSimpleProportionalFlexGrows = (allColumns, currentColumnIndex, newWidth, availableWidth) => {
        const totalColumns = allColumns.length;
        const currentFlexGrows = allColumns.map(col => parseFloat(col.style.flexGrow) || 1);
        const newFlexGrowForCurrentColumn = Math.max(0.1, (newWidth / availableWidth) * totalColumns);
        const otherColumnsTotalFlexGrow = currentFlexGrows.reduce((sum, fg, index) => 
            index === currentColumnIndex ? sum : sum + fg, 0);
        if (otherColumnsTotalFlexGrow === 0) {
            const equalFlexGrow = Math.max(0.1, (availableWidth - newWidth) / availableWidth * totalColumns / (totalColumns - 1));
            const result = [];
            for (let i = 0; i < totalColumns; i++) {
                if (i === currentColumnIndex) {
                    result.push(Math.round(newFlexGrowForCurrentColumn * 100) / 100);
                } else {
                    result.push(Math.round(equalFlexGrow * 100) / 100);
                }
            }
            return result;
        }
        const result = [];
        for (let i = 0; i < totalColumns; i++) {
            if (i === currentColumnIndex) {
                result.push(Math.round(newFlexGrowForCurrentColumn * 100) / 100);
            } else {
                const proportion = currentFlexGrows[i] / otherColumnsTotalFlexGrow;
                const remainingFlexGrow = Math.max(0.1, (availableWidth - newWidth) / availableWidth * totalColumns);
                const newFlexGrow = remainingFlexGrow * proportion;
                result.push(Math.round(newFlexGrow * 100) / 100);
            }
        }
        
        return result;
    };
    updateAllFlexGrowsInSource = async (sourcePath, fullSource, flexGrows) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateAllFlexGrowsInFullSource(fullSource, flexGrows);
            const newFileContent = fileContent.replace(fullSource, updatedFullSource);
            if (newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent)
            }
            
        } catch (error) {
        }
    };

    updateFlexGrowInSource = async (sourcePath, fullSource, columnSource, newFlexGrow, columnIndex) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {

                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateFlexGrowInFullSource(fullSource, newFlexGrow, columnIndex);
            const newFileContent = fileContent.replace(fullSource, updatedFullSource);
            if (newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent);
            }
            
        } catch (error) {
        }
    };
    updateAllFlexGrowsInFullSource = (fullSource, flexGrows) => {
        let lines = fullSource.split('\n');
        let result = [];
        let currentColumnIndex = -1;
        let i = 0;
        
        while (i < lines.length) {
            let line = lines[i];
            if (line.trim().startsWith('````col-md')) {
                currentColumnIndex++;
                let columnLines = [line];
                let j = i + 1;
                while (j < lines.length && !lines[j].trim().startsWith('````col-md')) {
                    columnLines.push(lines[j]);
                    j++;
                }
                let updatedColumn = this.updateFlexGrowInColumn(columnLines.join('\n'), flexGrows[currentColumnIndex]);
                result.push(updatedColumn);
                i = j;
                continue;
            }
            result.push(line);
            i++;
        }
        
        return result.join('\n');
    };

    updateFlexGrowInFullSource = (fullSource, newFlexGrow, columnIndex) => {
        let lines = fullSource.split('\n');
        let result = [];
        let currentColumnIndex = -1;
        let i = 0;
        
        while (i < lines.length) {
            let line = lines[i];
            if (line.trim().startsWith('````col-md')) {
                currentColumnIndex++;

                if (currentColumnIndex === columnIndex) {
                    let columnLines = [line];
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim().startsWith('````col-md')) {
                        columnLines.push(lines[j]);
                        j++;
                    }

                    let updatedColumn = this.updateFlexGrowInColumn(columnLines.join('\n'), newFlexGrow);
                    result.push(updatedColumn);
                    i = j;
                    continue;
                }
            }

            result.push(line);
            i++;
        }
        
        return result.join('\n');
    };

    updateFlexGrowInColumn = (columnSource, newFlexGrow) => {
        let lines = columnSource.split('\n');
        let result = [];
        let flexGrowUpdated = false;
        
        for (let line of lines) {
            if (line.trim().startsWith('flexGrow=')) {
                result.push(`flexGrow=${newFlexGrow}`);
                flexGrowUpdated = true;
            } else {
                result.push(line);
            }
        }

        if (!flexGrowUpdated) {
            let newLines = [];
            for (let i = 0; i < lines.length; i++) {
                newLines.push(lines[i]);
                if (i === 0 && lines[i].trim().startsWith('````col-md')) {
                    newLines.push(`flexGrow=${newFlexGrow}`);
                }
            }
            return newLines.join('\n');
        }
        
        return result.join('\n');
    };

    showResizeSuccess = (columnElement, flexGrows) => {
        const notification = document.createElement('div');
        notification.className = 'column-resize-notification';
        const flexGrowText = flexGrows.map((fg, index) => `列${index + 1}: ${fg}`).join(', ');
        notification.textContent = `列宽已调整 (${flexGrowText})`;
        
        notification.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(40, 167, 69, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        columnElement.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000); 
    };

    parseColumnSources = (source) => {
        let lines = source.split('\n');
        let columnSources = [];
        let currentColumn = [];
        let inColumn = false;
        
        for (let line of lines) {
            if (line.trim().startsWith('````col-md')) {
                if (inColumn && currentColumn.length > 0) {
                    columnSources.push(currentColumn.join('\n'));
                }
                currentColumn = [line];
                inColumn = true;
            } else if (inColumn) {
                currentColumn.push(line);
            }
        }

        if (inColumn && currentColumn.length > 0) {
            columnSources.push(currentColumn.join('\n'));
        }
        
        return columnSources;
    };

    updateColumnContent = (columnElement, newContent, originalSource, ctx) => {
        columnElement.innerHTML = '';
        const sourcePath = ctx.sourcePath;
        let renderChild = new MarkdownRenderChild(columnElement);
        ctx.addChild(renderChild);
        
        MarkdownRenderer.renderMarkdown(
            newContent,
            columnElement,
            sourcePath,
            renderChild
        );

        this.processChild(columnElement);
        requestAnimationFrame(() => {
            const internalLinks = columnElement.querySelectorAll('a.internal-link');
            if (internalLinks.length > 0) {
                const event = new Event('mouseenter', { bubbles: true });
                internalLinks.forEach(link => {
                    link.dispatchEvent(event);
                });
            }
        });
    };

    rebuildColumnSource = (originalSource, newContent) => {
        let lines = originalSource.split('\n');
        let result = [];
        let inContent = false;
        let contentReplaced = false;
        
        for (let line of lines) {
            if (line.trim() === SETTINGSDELIM) {
                inContent = true;
                result.push(line);
                if (!contentReplaced) {
                    result.push(newContent);
                    contentReplaced = true;
                }
                continue;
            }
            if (inContent && line.trim().startsWith('```')) {
                inContent = false;
                result.push(line);
                continue;
            }
            if (!inContent) {
                result.push(line);
            }
        }
        
        return result.join('\n');
    };

    updateColumnInFullSource = (fullSource, updatedColumnSource, columnIndex) => {
        let lines = fullSource.split('\n');
        let result = [];
        let currentColumnIndex = -1;
        let i = 0;
        
        while (i < lines.length) {
            let line = lines[i];
            if (line.trim().startsWith('````col-md')) {
                currentColumnIndex++;
                if (currentColumnIndex === columnIndex) {
                    let columnLines = [line];
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim().startsWith('````col-md')) {
                        columnLines.push(lines[j]);
                        j++;
                    }
                    let originalColumnSource = columnLines.join('\n');
                    let updatedColumn = this.rebuildColumnSource(originalColumnSource, updatedColumnSource);
                    result.push(updatedColumn);
                    i = j;
                    continue;
                }
            }
            result.push(line);
            i++;
        }
        
        return result.join('\n');
    };

    reloadEntireCodeBlock = async (sourcePath, fullSource, columnIndex, newContent) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateColumnInFullSource(fullSource, newContent, columnIndex);
            const newFileContent = fileContent.replace(fullSource, updatedFullSource);
            await this.app.vault.modify(file, newFileContent);
            
        } catch (error) {
        }
    };

    tryUpdateSourceFile = async (sourcePath, fullSource, columnSource, newContent, columnIndex) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateColumnInFullSource(fullSource, newContent, columnIndex);
            const newFileContent = fileContent.replace(fullSource, updatedFullSource);
            if (newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent);
            } else {
            }
            
        } catch (error) {
        }
    };

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ObsidianColumnsSettings(this.app, this));

        this.registerMarkdownCodeBlockProcessor(COLUMNMD, (source, el, ctx) => {
            let mdSettings = findSettings(source);
            let settings = parseSettings(mdSettings.settings);
            source = mdSettings.source;

            const sourcePath = ctx.sourcePath;
            let child = el.createDiv();
            let renderChild = new MarkdownRenderChild(child);
            ctx.addChild(renderChild);
            MarkdownRenderer.renderMarkdown(
                source,
                child,
                sourcePath,
                renderChild
            );
            if (settings.flexGrow != null) {
                let flexGrow = parseFloat(settings.flexGrow);
                let CSS = this.generateCssString(flexGrow);
                delete CSS.width;
                this.applyStyle(child, CSS);
            }
            if (settings.height != null) {
                let heightCSS = {};
                heightCSS.height = settings.height.toString();
                heightCSS.overflow = "scroll";
                this.applyStyle(child, heightCSS);
            }
            if (settings.textAlign != null) {
                let alignCSS = {};
                alignCSS.textAlign = settings.textAlign;
                this.applyStyle(child, alignCSS);
            }
            this.applyPotentialBorderStyling(settings, child);
        });

        this.registerMarkdownCodeBlockProcessor(COLUMNNAME, async (source, el, ctx) => {
            let mdSettings = findSettings(source);
            let settings = parseSettings(mdSettings.settings);
            let rowSource = parseRows(mdSettings.source);

            for (let source of rowSource) {
                const sourcePath = ctx.sourcePath;
                let child = createDiv();
                let renderChild = new MarkdownRenderChild(child);
                ctx.addChild(renderChild);
                let renderAwait = MarkdownRenderer.renderMarkdown(
                    source,
                    child,
                    sourcePath,
                    renderChild
                );
                let parent = el.createEl("div", { cls: "columnParent" });
                let columnSources = this.parseColumnSources(source);
                
                Array.from(child.children).forEach((c, columnIndex) => {
                    let cc = parent.createEl("div", { cls: "columnChild" });
                    let renderCc = new MarkdownRenderChild(cc);
                    ctx.addChild(renderCc);
                    this.applyStyle(cc, this.generateCssString(this.settings.defaultSpan.value));
                    cc.appendChild(c);
                    if (c.classList.contains("block-language-" + COLUMNMD) && c.childNodes[0].style.flexGrow !== "") {
                        cc.style.flexGrow = c.childNodes[0].style.flexGrow;
                        cc.style.flexBasis = c.childNodes[0].style.flexBasis;
                        cc.style.width = c.childNodes[0].style.flexBasis;
                    }
                    this.processChild(c);
                    let columnSource = columnSources[columnIndex] || source;
                    cc.dataset.sourcePath = ctx.sourcePath;
                    cc.dataset.fullSource = mdSettings.source;
                    cc.dataset.columnSource = columnSource;
                    cc.dataset.columnIndex = columnIndex;
                    if (this.isColumnEditable(columnSource)) {
                        this.makeColumnEditable(cc, columnSource, mdSettings.source, columnIndex, ctx);
                    }
                    this.addColumnResizeHandle(cc, parent, columnIndex);
                });

                if (settings.height != null) {
                    let height = settings.height;
                    if (height === "shortest") {
                        await renderAwait;
                        let shortest = Math.min(...Array.from(parent.children)
                            .map((c) => c.childNodes[0])
                            .map((c) => parseDirtyNumber(getComputedStyle(c).height) + parseDirtyNumber(getComputedStyle(c).lineHeight)));

                        let heightCSS = {};
                        heightCSS.height = shortest + "px";
                        heightCSS.overflow = "scroll";
                        Array.from(parent.children)
                            .map((c) => c.childNodes[0])
                            .forEach((c) => {
                                this.applyStyle(c, heightCSS);
                            });

                    } else {
                        let heightCSS = {};
                        heightCSS.height = height;
                        heightCSS.overflow = "scroll";
                        this.applyStyle(parent, heightCSS);
                    }
                }
                if (settings.textAlign != null) {
                    let alignCSS = {};
                    alignCSS.textAlign = settings.textAlign;
                    this.applyStyle(parent, alignCSS);
                }
                this.applyPotentialBorderStyling(settings, parent);
            }
        });

        this.addCommand({
            id: "insert-column-wrapper",
            name: "Insert column wrapper",
            editorCallback: (editor, view) => {
                new ColumnInsertModal(this.app, (result) => {
                    let num = result.numberOfColumns.value;
                    let outString = "`````col\n";
                    for (let i = 0; i < num; i++) {
                        outString += "````col-md\nflexGrow=1\ncolumneditable:true\n===\nColumn " + (i + 1) + "\n````\n";
                    }
                    outString += "`````\n";
                    editor.replaceSelection(outString);
                }).open();
            }
        });

        this.addCommand({
            id: "insert-quick-column-wrapper",
            name: "Insert quick column wrapper",
            editorCallback: (editor, view) => {
                let selectedText = editor.getSelection(); // Get the currently selected text
                let cursorPosition = editor.getCursor(); // Get the current cursor position

                // Construct the string with the selected text placed in the specified location
                let outString = "`````col\n````col-md\nflexGrow=1\ncolumneditable:true\n===\n" + selectedText + "\n````\n`````\n";

                editor.replaceSelection(outString); // Replace the selection with the constructed string

                // If there was no selected text, place the cursor on the specified line, else place it after the inserted string
                if (selectedText === "") {
                    editor.setCursor({ line: cursorPosition.line + 5, ch: 0 }); // Place the cursor on the specified line
                } else {
                    let lines = selectedText.split('\n').length; // Calculate the number of lines in the selected text
                    editor.setCursor({ line: cursorPosition.line + 5 + lines - 1, ch: selectedText.length - selectedText.lastIndexOf('\n') - 1 }); // Place the cursor after the inserted string
                }
            }
        });

        this.addCommand({
            id: "insert-column",
            name: "Insert column",
            editorCallback: (editor, view) => {
                let selectedText = editor.getSelection(); // Get the currently selected text
                let cursorPosition = editor.getCursor(); // Get the current cursor position

                let outString;
                if (selectedText === "") {
                    // If there is no selected text, insert a new column with a placeholder
                    outString = "```col-md\nflexGrow=1\ncolumneditable:true\n===\n# New Column\n\n```";
                    editor.replaceSelection(outString); // Replace the selection with the constructed string
                    editor.setCursor({ line: cursorPosition.line + 5, ch: 0 }); // Place the cursor on the new line after # New Column
                } else {
                    // If there is selected text, place it in the specified location
                    outString = "```col-md\nflexGrow=1\ncolumneditable:true\n===\n" + selectedText + "\n```";
                    editor.replaceSelection(outString); // Replace the selection with the constructed string
                    let lines = selectedText.split('\n').length; // Calculate the number of lines in the selected text
                    editor.setCursor({ line: cursorPosition.line + lines + 3, ch: selectedText.length - selectedText.lastIndexOf('\n') - 1 }); // Place the cursor after the last character of the selected text
                }
            }
        });

        let processList = (element, context) => {
            for (let child of Array.from(element.children)) {
                if (child == null) {
                    continue;
                }
                if (child.nodeName != "UL" && child.nodeName != "OL") {
                    continue;
                }
                for (let listItem of Array.from(child.children)) {
                    if (listItem == null) {
                        continue;
                    }
                    if (!listItem.textContent.trim().startsWith(TOKEN + COLUMNNAME)) {
                        processList(listItem, context);
                        continue;
                    }
                    child.removeChild(listItem);
                    let colParent = element.createEl("div", { cls: "columnParent" });
                    let renderColP = new MarkdownRenderChild(colParent);
                    context.addChild(renderColP);
                    let itemList = listItem.querySelector("ul, ol");
                    if (itemList == null) {
                        continue;
                    }
                    for (let itemListItem of Array.from(itemList.children)) {
                        let childDiv = colParent.createEl("div", { cls: "columnChild" });
                        let renderColC = new MarkdownRenderChild(childDiv);
                        context.addChild(renderColC);
                        let span = parseFloat(itemListItem.textContent.split("\n")[0].split(" ")[0]);
                        if (isNaN(span)) {
                            span = this.settings.defaultSpan.value;
                        }
                        this.applyStyle(childDiv, this.generateCssString(span));
                        let afterText = false;
                        processList(itemListItem, context);
                        for (let itemListItemChild of Array.from(itemListItem.childNodes)) {
                            if (afterText) {
                                childDiv.appendChild(itemListItemChild);
                            }
                            if (itemListItemChild.nodeName == "#text") {
                                afterText = true;
                            }
                        }
                        this.processChild(childDiv);
                    }
                }
            }
        };

        this.registerMarkdownPostProcessor((element, context) => { processList(element, context); });
    }

    applyPotentialBorderStyling(settings, child) {
        const hasBorder = settings.borderColor != null
            || settings.borderStyle != null
            || settings.borderWidth != null
            || settings.borderRadius != null
            || settings.borderPadding != null;

        if (hasBorder) {
            let borderCSS = {};
            borderCSS.borderColor = settings.borderColor ?? "white";
            borderCSS.borderStyle = settings.borderStyle ?? "solid";
            borderCSS.borderWidth = this.parseBorderSizeInput(settings.borderWidth, "1px");
            borderCSS.borderRadius = this.parseBorderSizeInput(settings.borderRadius);
            borderCSS.padding = this.parseBorderSizeInput(settings.borderPadding);
            this.applyStyle(child, borderCSS);
        }
    }

    parseBorderSizeInput(input, defaultSize = "0") {
        if (input == null) {
            return defaultSize;
        }
        if (!+input) {
            return input;
        }

        return input + "px";
    }

    onunload() {
        // 清理所有正在编辑的列
        this.clearAllEditingColumns();
        
        document.querySelectorAll('.columnParent, .columnChild, .editable-column').forEach(el => {
            if (el.dataset.clickHandler) {
                el.removeEventListener('click', el.dataset.clickHandler);
            }
            if (el.dataset.mouseenterHandler) {
                el.removeEventListener('mouseenter', el.dataset.mouseenterHandler);
            }
            if (el.dataset.mouseleaveHandler) {
                el.removeEventListener('mouseleave', el.dataset.mouseleaveHandler);
            }
            const resizeHandles = el.querySelectorAll('.column-resize-handle');
            resizeHandles.forEach(handle => {
                handle.remove();
            });
            el.remove();
        });
        
        if (this.autocompleteContainer) {
            this.autocompleteContainer.remove();
            this.autocompleteContainer = null;
        }

        this.cachedFiles = null;
        this.cachedFilesTimestamp = null;
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    async loadSettings() {
        await loadSettings(this, DEFAULT_SETTINGS);
        let r = document.querySelector(':root');
        r.style.setProperty(MINWIDTHVARNAME, this.settings.wrapSize.value.toString() + "px");
        r.style.setProperty(DEFSPANVARNAME, this.settings.defaultSpan.value.toString());
    }

    async saveSettings() {
        await saveSettings(this, DEFAULT_SETTINGS);
    }
}

const DEFAULT_MODAL_SETTINGS = {
    numberOfColumns: { value: 2, name: "创建列数", desc: "将要创建的列数" },
};

class ColumnEditModal extends Modal {
    constructor(app, originalContent, onSubmit) {
        super(app);
        this.originalContent = originalContent;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "编辑列内容" });
        const textArea = contentEl.createEl("textarea", {
            cls: "column-edit-textarea"
        });
        textArea.value = this.originalContent;
        textArea.style.width = "100%";
        textArea.style.height = "300px";
        textArea.style.padding = "10px";
        textArea.style.border = "1px solid #ccc";
        textArea.style.borderRadius = "4px";
        textArea.style.resize = "vertical";
        contentEl.createEl("p", {
            text: "编辑 === 和 ``` 之间的内容。点击保存按钮应用更改。",
            cls: "column-edit-description"
        });

        const buttonContainer = contentEl.createEl("div", {
            cls: "column-edit-buttons"
        });
        buttonContainer.style.marginTop = "20px";
        buttonContainer.style.textAlign = "right";

        const cancelBtn = buttonContainer.createEl("button", {
            text: "取消",
            cls: "mod-warning"
        });
        cancelBtn.style.marginRight = "10px";
        cancelBtn.addEventListener("click", () => {
            this.close();
        });

        const saveBtn = buttonContainer.createEl("button", {
            text: "保存",
            cls: "mod-cta"
        });
        saveBtn.addEventListener("click", () => {
            const newContent = textArea.value;
            this.close();
            this.onSubmit(newContent);
        });

        textArea.focus();
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

class ColumnInsertModal extends Modal {
    constructor(app, onSubmit) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "创建自定义列" });

        let modalSettings = DEFAULT_MODAL_SETTINGS;

        let keyvals = Object.entries(DEFAULT_MODAL_SETTINGS);

        for (let keyval of keyvals) {
            createSetting(contentEl, keyval, "", (value, key) => {
                modalSettings[key].value = value;
            });
        }

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("提交")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(modalSettings);
                    }));
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

class RenameModal extends Modal {
    constructor(app, defaultName, onSubmit, attachmentPath = 'attachments', extension = 'png') {
        super(app);
        this.defaultName = defaultName;
        this.onSubmit = onSubmit;
        this.result = null;
        this.attachmentPath = attachmentPath;
        this.extension = extension;
        this.isSubmitted = false; // 标记是否已经提交
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: '重命名图片' });
        
        // 添加提示信息
        const hintText = contentEl.createEl('p', { 
            text: '提示：点击确认或取消按钮来完成操作，直接关闭窗口将使用默认名称。',
            cls: 'modal-hint'
        });
        hintText.style.fontSize = '12px';
        hintText.style.color = 'var(--text-muted)';
        hintText.style.marginBottom = '15px';
        hintText.style.fontStyle = 'italic';

        const inputContainer = contentEl.createDiv({ cls: 'modal-input-container' });
        inputContainer.style.marginBottom = '20px';
        
        const label = inputContainer.createEl('label', { text: '请输入新的文件名（不包含扩展名）:' });
        label.style.display = 'block';
        label.style.marginBottom = '8px';
        label.style.fontWeight = 'bold';
        
        const input = inputContainer.createEl('input', {
            type: 'text',
            value: this.defaultName,
            cls: 'modal-input'
        });
        
        input.style.width = '100%';
        input.style.padding = '8px 12px';
        input.style.border = '1px solid var(--background-modifier-border)';
        input.style.borderRadius = '4px';
        input.style.fontSize = '14px';
        input.style.boxSizing = 'border-box';
        
        input.focus();
        input.select();

        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '20px';
        
        const confirmButton = buttonContainer.createEl('button', {
            text: '确认',
            cls: 'mod-cta'
        });
        confirmButton.style.padding = '8px 16px';
        confirmButton.style.borderRadius = '4px';
        
        const cancelButton = buttonContainer.createEl('button', {
            text: '取消'
        });
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.marginRight = '0';

        const handleSubmit = async () => {
            const value = input.value.trim();
            if (value && value.length > 0) {
                // 验证文件名是否合法
                const invalidChars = /[<>:"/\\|?*]/g;
                if (invalidChars.test(value)) {
                    new Notice('文件名包含无效字符，请重新输入');
                    input.focus();
                    return;
                }
                
                // 检查文件是否已存在（可选的警告，不阻止操作）
                const targetPath = `${this.attachmentPath}/${value}.${this.extension}`;
                const exists = await this.app.vault.adapter.exists(targetPath);
                
                if (exists && value !== this.defaultName) {
                }
                
                this.result = value;
                this.isSubmitted = true;
                this.onSubmit(value);
            } else {
                new Notice('文件名不能为空');
                input.focus();
                return;
            }
            this.close();
        };

        const handleCancel = () => {
            this.result = null;
            this.isSubmitted = true;
            this.onSubmit(null);
            this.close();
        };

        confirmButton.onclick = handleSubmit;
        cancelButton.onclick = handleCancel;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        });

        // 阻止点击模态框外部时关闭
        this.containerEl.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        
        // 如果没有通过确认或取消按钮提交，则使用默认名称
        if (!this.isSubmitted) {
            this.onSubmit(this.defaultName);
        }
    }
}

class ObsidianColumnsSettings extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        display(this, DEFAULT_SETTINGS, NAME);
    }
}

module.exports = ObsidianColumns;