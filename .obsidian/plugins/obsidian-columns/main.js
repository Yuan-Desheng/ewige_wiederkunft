/**
 * Obsidian Columns - \u5141\u8bb8\u5728Obsidian\u4e2d\u521b\u5efa\u5217\u5e03\u5c40\u7684\u63d2\u4ef6
 * 
 * Copyright (C) 2023 Trevor Nichols
 * Copyright (C) 2025 ytmaps_\u9c7c\u5148\u751f
 * \u539f\u59cb\u4ed3\u5e93: https://github.com/tnichols217/obsidian-columns\uff0cytmaps_\u9c7c\u5148\u751f\u5bf9\u539f\u59cb\u4ed3\u5e93\u4ee3\u7801\u8fdb\u884c\u4e86\u5927\u91cf\u4fee\u6539\u3001\u4f18\u5316\uff0c\u4f7f\u5176\u529f\u80fd\u66f4\u52a0\u5f3a\u5927\u3002
 * 
 * \u672c\u7a0b\u5e8f\u662f\u81ea\u7531\u8f6f\u4ef6\uff1a\u4f60\u53ef\u4ee5\u6839\u636e\u81ea\u7531\u8f6f\u4ef6\u57fa\u91d1\u4f1a\u53d1\u5e03\u7684GNU\u901a\u7528\u516c\u5171\u8bb8\u53ef\u8bc1\uff08\u7248\u672c3\u6216\u66f4\u9ad8\u7248\u672c\uff09\u91cd\u65b0\u5206\u53d1\u548c/\u6216\u4fee\u6539\u5b83\u3002
 * 
 * \u672c\u7a0b\u5e8f\u7684\u53d1\u5e03\u662f\u5e0c\u671b\u5b83\u80fd\u6709\u6240\u5e2e\u52a9\uff0c\u4f46\u6ca1\u6709\u4efb\u4f55\u4fdd\u8bc1\uff1b\u751a\u81f3\u6ca1\u6709\u5bf9\u9002\u9500\u6027\u6216\u7279\u5b9a\u7528\u9014\u9002\u7528\u6027\u7684\u6697\u793a\u4fdd\u8bc1\u3002
 * \u66f4\u591a\u8be6\u60c5\uff0c\u8bf7\u53c2\u9605GNU\u901a\u7528\u516c\u5171\u8bb8\u53ef\u8bc1\u3002
 * 
 * \u4f60\u5e94\u8be5\u5df2\u7ecf\u6536\u5230\u4e86\u4e00\u4efdGNU\u901a\u7528\u516c\u5171\u8bb8\u53ef\u8bc1\u7684\u526f\u672c\u3002\u5982\u679c\u6ca1\u6709\uff0c\u8bf7\u53c2\u9605 <https://www.gnu.org/licenses/>\u3002
 */
const {
    Plugin,
    MarkdownRenderChild,
    MarkdownRenderer,
    PluginSettingTab,
    App,
    Modal,
    Setting
} = require("obsidian");

const NAME = "Obsidian Columns";

const COLUMNNAME = "col";

const COLUMNMD = COLUMNNAME + "-md";

const TOKEN = "!!!";

const SETTINGSDELIM = "===";

const COLUMNPADDING = 10;

const MINWIDTHVARNAME = "--obsidian-columns-min-width";

const DEFSPANVARNAME = "--obsidian-columns-def-span";

const CODEBLOCKFENCE = "`";
/**
 * textarea \u65e0\u6cd5\u76f4\u63a5\u4f7f\u7528 AbstractInputSuggest\u3002\u4fdd\u7559 textarea \u7126\u70b9\uff0c\u5e76\u4f7f\u7528
 * Obsidian \u539f\u751f suggestion DOM \u7c7b\u540d\uff0c\u4ee5\u83b7\u5f97\u4e0e\u5b98\u65b9\u754c\u9762\u4e00\u81f4\u7684\u4e3b\u9898\u548c\u9009\u4e2d\u6548\u679c\u3002
 */

class ColumnLinkSuggest {
    constructor(app, plugin, textArea, sourcePath) {
        this.app = app;
        this.plugin = plugin;
        this.textArea = textArea;
        this.sourcePath = sourcePath;
        this.insertPos = 0;
        this.isActive = false;
        this.selectedIndex = 0;
        this.suggestions = [];
        this.limit = 20;
        const doc = textArea.ownerDocument || document;
        this.containerEl = doc.createElement("div");
        this.containerEl.className = "suggestion-container column-link-suggestion";
        this.containerEl.style.display = "none";
        this.suggestionEl = this.containerEl.createDiv({
            cls: "suggestion"
        });
        doc.body.appendChild(this.containerEl);
    }
    getSuggestions(queryText) {
        const query = queryText.toLowerCase();
        const files = this.app.vault.getFiles();
        return files.filter(file => !query || file.basename.toLowerCase().includes(query)).sort((a, b) => {
            if (!query) return a.basename.localeCompare(b.basename);
            const aName = a.basename.toLowerCase();
            const bName = b.basename.toLowerCase();
            const aStarts = aName.startsWith(query);
            const bStarts = bName.startsWith(query);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;
            return aName.localeCompare(bName);
        }).slice(0, this.limit);
    }
    renderSuggestion(file, el, index) {
        el.className = "suggestion-item";
        el.toggleClass("is-selected", index === this.selectedIndex);
        el.createDiv({
            cls: "suggestion-title",
            text: file.name
        });
        const parentPath = file.parent?.path;
        if (parentPath && parentPath !== "/") {
            el.createDiv({
                cls: "suggestion-note",
                text: parentPath
            });
        }
        el.addEventListener("mousemove", () => {
            if (this.selectedIndex !== index) {
                this.selectedIndex = index;
                this.updateSelection();
            }
        });
        el.addEventListener("mousedown", event => {
            event.preventDefault();
            event.stopPropagation();
            this.selectSuggestion(file);
        });
    }
    selectSuggestion(file) {
        const linktext = this.app.metadataCache.fileToLinktext(file, this.sourcePath, true);
        this.plugin.insertSuggestionAtPosition(this.textArea, linktext, this.insertPos);
        this.close();
    }
    showFor(query, insertPos) {
        this.insertPos = insertPos;
        this.suggestions = this.getSuggestions(query);
        if (this.suggestions.length === 0) {
            this.close();
            return;
        }
        this.selectedIndex = 0;
        this.suggestionEl.empty();
        this.suggestions.forEach((file, index) => {
            const itemEl = this.suggestionEl.createDiv();
            this.renderSuggestion(file, itemEl, index);
        });
        this.isActive = true;
        this.plugin.activeLinkSuggest = this;
        this.containerEl.style.display = "";
        this.positionAtCaret();
    }
    positionAtCaret() {
        const textArea = this.textArea;
        const doc = textArea.ownerDocument || document;
        const win = doc.defaultView || window;
        const style = win.getComputedStyle(textArea);
        const mirror = doc.createElement("div");
        const properties = [ "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "lineHeight", "textTransform", "textAlign", "textIndent", "tabSize" ];
        properties.forEach(property => {
            mirror.style[property] = style[property];
        });
        mirror.style.position = "fixed";
        mirror.style.left = "-10000px";
        mirror.style.top = "0";
        mirror.style.visibility = "hidden";
        mirror.style.whiteSpace = "pre-wrap";
        mirror.style.overflowWrap = "break-word";
        mirror.style.wordBreak = style.wordBreak;
        mirror.textContent = textArea.value.substring(0, textArea.selectionStart);
        const marker = doc.createElement("span");
        marker.textContent = textArea.value.substring(textArea.selectionStart, textArea.selectionStart + 1) || "\u200b";
        mirror.appendChild(marker);
        doc.body.appendChild(mirror);
        const textAreaRect = textArea.getBoundingClientRect();
        const mirrorRect = mirror.getBoundingClientRect();
        const markerRect = marker.getBoundingClientRect();
        const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.5 || 20;
        let left = textAreaRect.left + markerRect.left - mirrorRect.left - textArea.scrollLeft;
        // \u4f7f\u7528\u5149\u6807\u6807\u8bb0\u7684\u771f\u5b9e\u5e95\u8fb9\uff0c\u800c\u4e0d\u662f\u7528\u884c\u9876\u90e8\u63a8\u7b97\u3002\u4e0d\u540c\u4e3b\u9898\u7684
        // font-size/line-height \u7ec4\u5408\u4e0b\uff0c\u63a8\u7b97\u503c\u53ef\u80fd\u4f7f\u5f39\u7a97\u4e0e\u5f53\u524d\u884c\u91cd\u53e0\u3002
        const markerBottom = markerRect.height > 0 ? markerRect.bottom : markerRect.top + lineHeight;
        const caretGap = 6;
        let top = textAreaRect.top + markerBottom - mirrorRect.top - textArea.scrollTop + caretGap;
        mirror.remove();
        const popupWidth = Math.min(Math.max(textAreaRect.width, 280), 480);
        left = Math.max(8, Math.min(left, win.innerWidth - popupWidth - 8));
        this.containerEl.style.width = `${popupWidth}px`;
        this.containerEl.style.left = `${left}px`;
        this.containerEl.style.top = `${top}px`;
        const popupRect = this.containerEl.getBoundingClientRect();
        if (top + popupRect.height > win.innerHeight - 8) {
            top = Math.max(8, top - popupRect.height - lineHeight);
            this.containerEl.style.top = `${top}px`;
        }
    }
    updateSelection() {
        const items = this.suggestionEl.querySelectorAll(".suggestion-item");
        items.forEach((item, index) => item.toggleClass("is-selected", index === this.selectedIndex));
        items[this.selectedIndex]?.scrollIntoView({
            block: "nearest"
        });
    }
    handleKeydown(event) {
        if (!this.isActive || this.suggestions.length === 0) return false;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
            this.updateSelection();
            return true;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
            this.updateSelection();
            return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.selectSuggestion(this.suggestions[this.selectedIndex]);
            return true;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.close();
            return true;
        }
        return false;
    }
    close() {
        this.containerEl.style.display = "none";
        this.isActive = false;
        if (this.plugin.activeLinkSuggest === this) {
            this.plugin.activeLinkSuggest = null;
        }
    }
    destroy() {
        this.close();
        this.containerEl.remove();
    }
}

function createSetting(containerEl, keyval, currentValue, onChange) {
    let setting = new Setting(containerEl).setName(keyval[1].name).setDesc(keyval[1].desc);
    if (typeof keyval[1].value === "boolean") {
        setting.addToggle(toggle => toggle.setValue(currentValue).onChange(bool => {
            onChange(bool, keyval[0]);
        }));
    } else {
        setting.addText(text => text.setPlaceholder(String(keyval[1].value)).setValue(String(currentValue)).onChange(value => {
            onChange(parseObject(value, typeof keyval[1].value), keyval[0]);
        }));
    }
}

function display(obj, DEFAULT_SETTINGS, name) {
    const {
        containerEl
    } = obj;
    containerEl.empty();
    containerEl.createEl("h2", {
        text: "Settings for " + name
    });
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
        obj.loadData().then(data => {
            if (data) {
                let items = Object.entries(data);
                items.forEach(item => {
                    obj.settings[item[0]].value = item[1];
                });
            }
        }).then(resolve).catch(reject);
    });
}

async function saveSettings(obj, DEFAULT_SETTINGS) {
    let saveData = {};
    Object.entries(obj.settings).forEach(i => {
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
    return value === "yes" || value === "true";
}

const DEFAULT_SETTINGS = {
    wrapSize: {
        value: 100,
        name: "Minimum width of column",
        desc: "Columns will have this minimum width before wrapping to a new row. 0 disables column wrapping. Useful for smaller devices",
        onChange: val => {
            document.querySelector(":root").style.setProperty(MINWIDTHVARNAME, val.toString() + "px");
        }
    },
    defaultSpan: {
        value: 1,
        name: "The default span of an item",
        desc: "The default width of a column. If the minimum width is specified, the width of the column will be multiplied by this setting.",
        onChange: val => {
            document.querySelector(":root").style.setProperty(DEFSPANVARNAME, val.toString());
        }
    }
};

let findSettings = (source, unallowed = [ "`" ], delim = SETTINGSDELIM) => {
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
                    return {
                        settings: split[0],
                        source: split.slice(1).join(delim + "\n")
                    };
                }
                break lineLoop;
            }
        }
    }
    return {
        settings: "",
        source: source
    };
};

let parseSettings = settings => {
    let o = {};
    settings.split("\n").map(i => {
        return i.split(";");
    }).reduce((a, b) => {
        a.push(...b);
        return a;
    }, []).map(i => {
        return i.split("=").map(j => {
            return j.trim();
        }).slice(0, 2);
    }).forEach(i => {
        o[i[0]] = i[1];
    });
    return o;
};

let countBeginning = source => {
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

let parseRows = source => {
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

let parseDirtyNumber = num => {
    return parseFloat(num.split("").filter(char => "0123456789.".contains(char)).join(""));
};

class ObsidianColumns extends Plugin {
    // \u65b0\u589e\uff1a\u8ddf\u8e2a\u6240\u6709\u6b63\u5728\u7f16\u8f91\u7684\u5217
    editingColumns = new Map();
    // \u5b58\u50a8\u6b63\u5728\u7f16\u8f91\u7684\u5217\u4fe1\u606f
    columnResizeObservers = new WeakMap();
    activeLinkSuggest = null;
    generateCssString = span => {
        let o = {};
        o.flexGrow = span.toString();
        o.flexBasis = (this.settings.wrapSize.value * span).toString() + "px";
        o.width = (this.settings.wrapSize.value * span).toString() + "px";
        return o;
    };
    normalizeVaultPath = path => {
        return (path || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    };
    getParentFolderPath = sourcePath => {
        const normalizedSourcePath = this.normalizeVaultPath(sourcePath);
        const lastSlashIndex = normalizedSourcePath.lastIndexOf("/");
        return lastSlashIndex === -1 ? "" : normalizedSourcePath.substring(0, lastSlashIndex);
    };
    resolveAttachmentPath = sourcePath => {
        const rawAttachmentPath = (this.app.vault.config?.attachmentFolderPath || "").trim();
        if (!rawAttachmentPath) {
            return "attachments";
        }
        const normalizedAttachmentPath = rawAttachmentPath.replace(/\\/g, "/");
        if (normalizedAttachmentPath === ".") {
            return this.getParentFolderPath(sourcePath);
        }
        if (normalizedAttachmentPath.startsWith("./")) {
            const parentFolderPath = this.getParentFolderPath(sourcePath);
            return this.normalizeVaultPath(parentFolderPath ? `${parentFolderPath}/${normalizedAttachmentPath.slice(2)}` : normalizedAttachmentPath.slice(2));
        }
        return this.normalizeVaultPath(normalizedAttachmentPath);
    };
    ensureFolderExists = async folderPath => {
        const normalizedFolderPath = this.normalizeVaultPath(folderPath);
        if (!normalizedFolderPath) {
            return;
        }
        const segments = normalizedFolderPath.split("/").filter(Boolean);
        let currentPath = "";
        for (const segment of segments) {
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;
            if (!await this.app.vault.adapter.exists(currentPath)) {
                await this.app.vault.createFolder(currentPath);
            }
        }
    };
    // \u751f\u6210\u552f\u4e00\u7684\u6587\u4ef6\u540d
    generateUniqueFileName = async (attachmentPath, baseName, extension) => {
        let fileName = `${baseName}.${extension}`;
        let fullPath = `${attachmentPath}/${fileName}`;
        // \u5982\u679c\u6587\u4ef6\u4e0d\u5b58\u5728\uff0c\u76f4\u63a5\u8fd4\u56de
        if (!await this.app.vault.adapter.exists(fullPath)) {
            return fileName;
        }
        // \u5982\u679c\u6587\u4ef6\u5b58\u5728\uff0c\u6dfb\u52a0\u6570\u5b57\u540e\u7f00
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
    getDirectColumnChildren = parentElement => {
        return Array.from(parentElement.children).filter(child => child.classList.contains("columnChild"));
    };
    positionColumnResizeHandles = parentElement => {
        const columns = this.getDirectColumnChildren(parentElement);
        const handles = Array.from(parentElement.children).filter(child => child.classList.contains("column-resize-handle"));
        const parentRect = parentElement.getBoundingClientRect();
        const containingBlockLeft = parentRect.left + parentElement.clientLeft;
        const containingBlockTop = parentRect.top + parentElement.clientTop;
        handles.forEach(handle => {
            const columnIndex = Number(handle.dataset.columnIndex);
            const currentColumn = columns[columnIndex];
            const nextColumn = columns[columnIndex + 1];
            if (!currentColumn || !nextColumn) {
                handle.style.display = "none";
                return;
            }
            const currentRect = currentColumn.getBoundingClientRect();
            const nextRect = nextColumn.getBoundingClientRect();
            if (Math.abs(currentRect.top - nextRect.top) >= 1) {
                handle.style.display = "none";
                return;
            }
            const handleWidth = 10;
            const gapCenter = (currentRect.right + nextRect.left) / 2;
            handle.style.display = "block";
            handle.style.setProperty("left", `${gapCenter - containingBlockLeft - handleWidth / 2}px`, "important");
            handle.style.setProperty("right", "auto", "important");
            handle.style.setProperty("top", `${currentRect.top - containingBlockTop}px`, "important");
            handle.style.setProperty("bottom", "auto", "important");
            handle.style.setProperty("width", `${handleWidth}px`, "important");
            handle.style.setProperty("height", `${currentRect.height}px`, "important");
        });
    };
    observeColumnParentResize = (parentElement, context) => {
        if (this.columnResizeObservers.has(parentElement)) return;
        let animationFrame = null;
        const schedulePositionUpdate = () => {
            if (animationFrame !== null) return;
            animationFrame = requestAnimationFrame(() => {
                animationFrame = null;
                if (parentElement.isConnected) {
                    this.positionColumnResizeHandles(parentElement);
                }
            });
        };
        const resizeObserver = new ResizeObserver(schedulePositionUpdate);
        resizeObserver.observe(parentElement);
        this.getDirectColumnChildren(parentElement).forEach(column => {
            resizeObserver.observe(column);
        });
        this.columnResizeObservers.set(parentElement, resizeObserver);
        // Markdown \u4ee3\u7801\u5757\u88ab\u91cd\u65b0\u6e32\u67d3\u65f6\u540c\u6b65\u89e3\u9664\u89c2\u5bdf\uff0c\u907f\u514d\u4fdd\u7559\u5df2\u79fb\u9664\u7684 DOM\u3002
        const observerLifecycle = new MarkdownRenderChild(parentElement);
        observerLifecycle.onunload = () => {
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            resizeObserver.disconnect();
            this.columnResizeObservers.delete(parentElement);
        };
        context.addChild(observerLifecycle);
        schedulePositionUpdate();
    };
    calculateNewColumnFlexGrow = parentElement => {
        const flexGrows = this.getDirectColumnChildren(parentElement).map(column => {
            const flexGrow = parseFloat(getComputedStyle(column).flexGrow);
            return Number.isFinite(flexGrow) && flexGrow > 0 ? flexGrow : 1;
        });
        if (flexGrows.length === 0) return 1;
        const averageFlexGrow = flexGrows.reduce((sum, value) => sum + value, 0) / flexGrows.length;
        return Number(averageFlexGrow.toFixed(6));
    };
    insertColumnIntoSource = (fullSource, columnIndex, newFlexGrow) => {
        const lines = fullSource.split("\n");
        let currentColumnIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const openingMatch = lines[i].match(/^(\s*)(`{3,})col-md(?:\s.*)?$/);
            if (!openingMatch) continue;
            currentColumnIndex++;
            const [ , indent, fence ] = openingMatch;
            let closingIndex = i + 1;
            while (closingIndex < lines.length && lines[closingIndex].trim() !== fence) {
                closingIndex++;
            }
            if (closingIndex >= lines.length) return null;
            if (currentColumnIndex === columnIndex) {
                const newColumnSource = [ `${indent}${fence}col-md`, `${indent}flexGrow=${newFlexGrow}`, `${indent}columneditable:true`, `${indent}${SETTINGSDELIM}`, "", `${indent}${fence}` ];
                lines.splice(closingIndex + 1, 0, ...newColumnSource);
                return lines.join("\n");
            }
            i = closingIndex;
        }
        return null;
    };
    addColumnAfter = async (sourcePath, fullSource, columnIndex, blockLocator, newFlexGrow) => {
        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!file) return false;
        const updatedFullSource = this.insertColumnIntoSource(fullSource, columnIndex, newFlexGrow);
        if (updatedFullSource === null) return false;
        const fileContent = await this.app.vault.read(file);
        const newFileContent = this.replaceCodeBlockSourceAtLocator(fileContent, fullSource, updatedFullSource, blockLocator);
        if (newFileContent === null || newFileContent === fileContent) return false;
        await this.app.vault.modify(file, newFileContent);
        return true;
    };
    processChild = c => {
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
    makeColumnEditable = (columnElement, columnSource, fullSource, columnIndex, ctx, blockLocator) => {
        let contentToEdit = this.extractColumnContent(columnSource);
        columnElement.dataset.columnIndex = columnIndex;
        columnElement.dataset.columnSource = columnSource;
        columnElement.dataset.fullSource = fullSource;
        columnElement.dataset.originalContent = contentToEdit;
        columnElement.dataset.sourcePath = ctx.sourcePath;
        if (columnElement.dataset.hasEventListeners === "true") {
            return;
        }
        const clickHandler = e => {
            // \u8c03\u6574\u680f\u5bbd\u540e\u6d4f\u89c8\u5668\u4ecd\u53ef\u80fd\u751f\u6210 click\uff0c\u4e0d\u5e94\u8fdb\u5165\u5217\u7f16\u8f91\u6a21\u5f0f\u3002
            const suppressEditUntil = Number(columnElement.dataset.suppressEditClickUntil) || 0;
            if (e.target.closest(".column-resize-handle") || Date.now() < suppressEditUntil) {
                return;
            }
            if (e.target.closest("a.internal-link") || e.target.closest("a[data-href]")) {
                return;
            }
            e.stopPropagation();
            if (columnElement.classList.contains("editing-mode")) {
                return;
            }
            this.enterEditMode(columnElement, contentToEdit, columnSource, fullSource, columnIndex, ctx, blockLocator);
        };
        columnElement.addEventListener("click", clickHandler);
        columnElement.dataset.clickHandler = clickHandler;
        columnElement.dataset.hasEventListeners = "true";
        columnElement.style.cursor = "pointer";
        columnElement.classList.add("editable-column");
    };
    enterEditMode = (columnElement, originalContent, columnSource, fullSource, columnIndex, ctx, blockLocator) => {
        columnElement.classList.add("editing-mode");
        columnElement.style.backgroundColor = "transparent";
        columnElement.style.padding = "10px";
        // \u4fdd\u5b58\u539f\u8282\u70b9\u7684\u7cbe\u786e display \u72b6\u6001\uff0c\u53d6\u6d88\u7f16\u8f91\u65f6\u76f4\u63a5\u6062\u590d DOM\uff0c\u65e0\u9700\u91cd\u65b0\u6e32\u67d3\u3002
        const originalChildren = Array.from(columnElement.children);
        columnElement._columnOriginalChildDisplays = new Map();
        originalChildren.forEach(child => {
            if (!child.classList.contains("column-resize-handle")) {
                columnElement._columnOriginalChildDisplays.set(child, child.style.display);
                child.style.display = "none";
            }
        });
        const editContainer = columnElement.createDiv("column-edit-container");
        editContainer.style.setProperty("width", "100%", "important");
        editContainer.style.setProperty("height", "100%", "important");
        editContainer.style.setProperty("display", "flex", "important");
        editContainer.style.setProperty("flex-direction", "column", "important");
        const textArea = editContainer.createEl("textarea", "column-edit-textarea");
        textArea.value = originalContent;
        this.setupAutocomplete(textArea, editContainer, ctx.sourcePath);
        // \u5b58\u50a8\u7f16\u8f91\u4fe1\u606f\u5230\u5168\u5c40Map\u4e2d
        const editKey = `${blockLocator.blockKey}::column:${columnIndex}`;
        this.editingColumns.set(editKey, {
            columnElement: columnElement,
            textArea: textArea,
            originalContent: originalContent,
            columnSource: columnSource,
            fullSource: fullSource,
            columnIndex: columnIndex,
            ctx: ctx,
            blockLocator: blockLocator,
            handleClickOutside: null
        });
        const handleClickOutside = event => {
            const clickedSuggestion = event.target.closest?.(".suggestion-container");
            if (!columnElement.contains(event.target) && !clickedSuggestion) {
                this.saveAllEditingColumns();
            }
        };
        // \u66f4\u65b0\u5b58\u50a8\u7684handleClickOutside\u5f15\u7528
        this.editingColumns.get(editKey).handleClickOutside = handleClickOutside;
        setTimeout(() => {
            document.addEventListener("click", handleClickOutside);
        }, 100);
        textArea.addEventListener("keydown", e => {
            if (this.activeLinkSuggest?.isActive) {
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                // Esc \u8868\u793a\u4fdd\u5b58\u5e76\u9000\u51fa\u3002saveAllEditingColumns \u53ea\u4f1a\u5728\u5199\u5165\u6210\u529f\u540e
                // \u6e05\u7406\u7f16\u8f91\u6846\uff1b\u5b9a\u4f4d\u6216\u5199\u5165\u5931\u8d25\u65f6\u4f1a\u4fdd\u7559\u5f53\u524d textarea \u5185\u5bb9\u3002
                void this.saveAllEditingColumns();
            }
        });
        // \u6dfb\u52a0\u7c98\u8d34\u4e8b\u4ef6\u76d1\u542c\u5668\uff0c\u786e\u4fdd\u56fe\u7247\u6b63\u786e\u63d2\u5165\u5230===\u548c````\u4e4b\u95f4
        textArea.addEventListener("paste", async e => {
            const clipboardData = e.clipboardData || window.clipboardData;
            if (!clipboardData) return;
            const items = clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf("image") !== -1) {
                    e.preventDefault();
                    try {
                        const file = item.getAsFile();
                        if (!file) continue;
                        // \u751f\u6210\u552f\u4e00\u7684\u6587\u4ef6\u540d
                        const now = new Date();
                        const timestamp = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getDate().toString().padStart(2, "0") + now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0") + now.getSeconds().toString().padStart(2, "0");
                        const extension = file.type.split("/")[1] || "png";
                        const fileName = `Pasted image_${timestamp}.${extension}`;
                        // \u8bfb\u53d6\u6587\u4ef6\u5185\u5bb9
                        const arrayBuffer = await file.arrayBuffer();
                        // \u83b7\u53d6\u9644\u4ef6\u6587\u4ef6\u5939\u8def\u5f84
                        let attachmentPath = this.resolveAttachmentPath(ctx.sourcePath);
                        // \u5982\u679c\u6ca1\u6709\u8bbe\u7f6e\u9644\u4ef6\u6587\u4ef6\u5939\uff0c\u4f7f\u7528\u9ed8\u8ba4\u8def\u5f84
                        if (!attachmentPath) {
                            attachmentPath = "attachments";
                        }
                        // \u786e\u4fdd\u9644\u4ef6\u6587\u4ef6\u5939\u5b58\u5728
                        await this.ensureFolderExists(attachmentPath);
                        // \u5b8c\u6574\u7684\u6587\u4ef6\u8def\u5f84
                        const fullPath = `${attachmentPath}/${fileName}`;
                        // \u4fdd\u5b58\u6587\u4ef6\u5230vault
                        await this.app.vault.createBinary(fullPath, arrayBuffer);
                        // \u751f\u6210Obsidian\u683c\u5f0f\u7684\u56fe\u7247\u94fe\u63a5
                        const imageLink = `![[${fileName}]]`;
                        // \u63d2\u5165\u5230\u5f53\u524d\u5149\u6807\u4f4d\u7f6e
                        const cursorPos = textArea.selectionStart;
                        const textBefore = textArea.value.substring(0, cursorPos);
                        const textAfter = textArea.value.substring(textArea.selectionEnd);
                        textArea.value = textBefore + imageLink + textAfter;
                        // \u8bbe\u7f6e\u5149\u6807\u4f4d\u7f6e\u5230\u63d2\u5165\u5185\u5bb9\u4e4b\u540e
                        const newCursorPos = cursorPos + imageLink.length;
                        textArea.setSelectionRange(newCursorPos, newCursorPos);
                        // \u89e6\u53d1input\u4e8b\u4ef6\u4ee5\u4fbf\u5176\u4ed6\u529f\u80fd\u80fd\u591f\u54cd\u5e94
                        textArea.dispatchEvent(new Event("input", {
                            bubbles: true
                        }));
                        // \u68c0\u67e5Imagen\u63d2\u4ef6\u662f\u5426\u542f\u7528\u91cd\u547d\u540d\u529f\u80fd
                        const imagenPlugin = this.app.plugins.plugins["imagen"];
                        const isImagenRenameEnabled = imagenPlugin?.settings?.imageRename?.enabled && !imagenPlugin?.settings?.objectStorage?.enabled;
                        if (isImagenRenameEnabled) {
                            // \u5f39\u51fa\u91cd\u547d\u540d\u5bf9\u8bdd\u6846
                            const defaultName = fileName.replace(/\.[^/.]+$/, "");
                            const renameModal = new RenameModal(this.app, defaultName, async newName => {
                                if (newName && newName.trim() && newName.trim() !== defaultName) {
                                    try {
                                        // \u751f\u6210\u552f\u4e00\u7684\u6587\u4ef6\u540d
                                        const uniqueFileName = await this.generateUniqueFileName(attachmentPath, newName.trim(), extension);
                                        const uniqueFullPath = `${attachmentPath}/${uniqueFileName}`;
                                        // \u5982\u679c\u751f\u6210\u7684\u6587\u4ef6\u540d\u4e0e\u671f\u671b\u7684\u4e0d\u540c\uff0c\u8bf4\u660e\u539f\u540d\u79f0\u5df2\u5b58\u5728
                                        if (uniqueFileName !== `${newName.trim()}.${extension}`) {
                                            new Notice(`\u6587\u4ef6\u540d\u5df2\u5b58\u5728\uff0c\u81ea\u52a8\u91cd\u547d\u540d\u4e3a: ${uniqueFileName}`);
                                        }
                                        // \u91cd\u547d\u540d\u6587\u4ef6
                                        await this.app.vault.rename(this.app.vault.getAbstractFileByPath(fullPath), uniqueFullPath);
                                        // \u4f7f\u7528\u6700\u7ec8\u7684\u6587\u4ef6\u540d\u548c\u8def\u5f84
                                        const finalFileName = uniqueFileName;
                                        const finalFullPath = uniqueFullPath;
                                        // \u66f4\u65b0textarea\u4e2d\u7684\u94fe\u63a5
                                        const newImageLink = `![[${finalFileName}]]`;
                                        // \u83b7\u53d6\u5f53\u524dtextarea\u7684\u503c\u548c\u5149\u6807\u4f4d\u7f6e
                                        const currentValue = textArea.value;
                                        const currentCursorPos = textArea.selectionStart;
                                        // \u627e\u5230\u521a\u63d2\u5165\u7684\u56fe\u7247\u94fe\u63a5\u5e76\u66ff\u6362
                                        const beforeCursor = currentValue.substring(0, currentCursorPos);
                                        const afterCursor = currentValue.substring(currentCursorPos);
                                        // \u67e5\u627e\u6700\u8fd1\u63d2\u5165\u7684\u56fe\u7247\u94fe\u63a5
                                        const lastImageLinkIndex = beforeCursor.lastIndexOf(imageLink);
                                        if (lastImageLinkIndex !== -1) {
                                            // \u66ff\u6362\u627e\u5230\u7684\u94fe\u63a5
                                            const updatedValue = beforeCursor.substring(0, lastImageLinkIndex) + newImageLink + beforeCursor.substring(lastImageLinkIndex + imageLink.length) + afterCursor;
                                            textArea.value = updatedValue;
                                            // \u91cd\u65b0\u8ba1\u7b97\u5149\u6807\u4f4d\u7f6e
                                            const lengthDiff = newImageLink.length - imageLink.length;
                                            const newCursorPosition = currentCursorPos + lengthDiff;
                                            textArea.setSelectionRange(newCursorPosition, newCursorPosition);
                                        } else {
                                            // \u5982\u679c\u6ca1\u627e\u5230\uff0c\u76f4\u63a5\u66ff\u6362\u6574\u4e2a\u503c\u4e2d\u7684\u94fe\u63a5
                                            const updatedValue = currentValue.replace(imageLink, newImageLink);
                                            textArea.value = updatedValue;
                                            // \u8bbe\u7f6e\u5149\u6807\u5230\u65b0\u94fe\u63a5\u7684\u672b\u5c3e
                                            const newLinkIndex = updatedValue.indexOf(newImageLink);
                                            if (newLinkIndex !== -1) {
                                                const newCursorPosition = newLinkIndex + newImageLink.length;
                                                textArea.setSelectionRange(newCursorPosition, newCursorPosition);
                                            }
                                        }
                                        // \u89e6\u53d1input\u4e8b\u4ef6\u4ee5\u4fbf\u5176\u4ed6\u529f\u80fd\u54cd\u5e94
                                        textArea.dispatchEvent(new Event("input", {
                                            bubbles: true
                                        }));
                                    } catch (renameError) {
                                        // \u63d0\u4f9b\u66f4\u8be6\u7ec6\u7684\u9519\u8bef\u4fe1\u606f
                                        if (renameError.message.includes("already exists")) {} else if (renameError.message.includes("not found")) {} else {}
                                    }
                                } else if (newName === null) {} else if (newName === defaultName) {} else {}
                            });
                            renameModal.open();
                        }
                    } catch (error) {}
                    break; // \u53ea\u5904\u7406\u7b2c\u4e00\u4e2a\u56fe\u7247
                }
            }
        });
        textArea.focus();
        textArea.select();
    };
    // \u65b0\u589e\uff1a\u4fdd\u5b58\u6240\u6709\u6b63\u5728\u7f16\u8f91\u7684\u5217
    saveAllEditingColumns = async () => {
        if (this.editingColumns.size === 0) return;
        if (this.isSavingEditingColumns) return;
        this.isSavingEditingColumns = true;
        try {
            // \u5148\u6309\u6587\u4ef6\u5206\u7ec4\uff0c\u518d\u6309\u5916\u5c42 col \u4ee3\u7801\u5757\u5206\u7ec4\u3002
            const blocksByFile = new Map();
            for (const [ editKey, editInfo ] of this.editingColumns) {
                const {
                    ctx,
                    columnIndex,
                    textArea,
                    fullSource,
                    blockLocator
                } = editInfo;
                const sourcePath = ctx.sourcePath;
                if (!blocksByFile.has(sourcePath)) {
                    blocksByFile.set(sourcePath, new Map());
                }
                const fileBlocks = blocksByFile.get(sourcePath);
                if (!fileBlocks.has(blockLocator.blockKey)) {
                    fileBlocks.set(blockLocator.blockKey, {
                        fullSource: fullSource,
                        blockLocator: blockLocator,
                        columns: []
                    });
                }
                fileBlocks.get(blockLocator.blockKey).columns.push({
                    columnIndex: columnIndex,
                    newContent: textArea.value
                });
            }
            let allSaved = true;
            for (const [ sourcePath, fileBlocks ] of blocksByFile) {
                const saved = await this.batchUpdateColumnBlocks(sourcePath, Array.from(fileBlocks.values()));
                allSaved = allSaved && saved;
            }
            // \u5b9a\u4f4d\u5931\u8d25\u65f6\u4fdd\u7559\u7f16\u8f91\u6846\uff0c\u7edd\u4e0d\u5c06\u5185\u5bb9\u5199\u5230\u5176\u4ed6\u540c\u540d\u4ee3\u7801\u5757\u3002
            if (allSaved) this.clearAllEditingColumns();
        } finally {
            this.isSavingEditingColumns = false;
        }
    };
    replaceCodeBlockSourceAtLocator = (fileContent, expectedSource, updatedSource, blockLocator) => {
        const eol = fileContent.includes("\r\n") ? "\r\n" : "\n";
        const normalize = value => (value || "").replace(/\r\n/g, "\n");
        const expected = normalize(expectedSource);
        if (!expected) return null;
        const lines = normalize(fileContent).split("\n");
        const {
            lineStart,
            lineEnd
        } = blockLocator;
        if (lineStart >= 0 && lineEnd >= lineStart && lineEnd < lines.length) {
            const section = lines.slice(lineStart, lineEnd + 1).join("\n");
            const matchIndex = section.indexOf(expected);
            const secondMatchIndex = matchIndex === -1 ? -1 : section.indexOf(expected, matchIndex + expected.length);
            if (matchIndex !== -1 && secondMatchIndex === -1) {
                const updatedSection = section.slice(0, matchIndex) + normalize(updatedSource) + section.slice(matchIndex + expected.length);
                lines.splice(lineStart, lineEnd - lineStart + 1, ...updatedSection.split("\n"));
                return lines.join(eol);
            }
        }
        // \u884c\u53f7\u56e0\u5916\u90e8\u7f16\u8f91\u5931\u6548\u65f6\uff0c\u4ec5\u5141\u8bb8\u56de\u9000\u5230\u201c\u5168\u6587\u552f\u4e00\u5339\u914d\u201d\u3002
        // \u591a\u4e2a\u76f8\u540c\u4ee3\u7801\u5757\u65f6\u8fd4\u56de null\uff0c\u907f\u514d\u731c\u6d4b\u5e76\u4e32\u5199\u3002
        const normalizedFile = normalize(fileContent);
        const matchIndex = normalizedFile.indexOf(expected);
        if (matchIndex === -1 || normalizedFile.indexOf(expected, matchIndex + expected.length) !== -1) {
            return null;
        }
        return (normalizedFile.slice(0, matchIndex) + normalize(updatedSource) + normalizedFile.slice(matchIndex + expected.length)).split("\n").join(eol);
    };
    batchUpdateColumnBlocks = async (sourcePath, blocks) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) return false;
            const originalFileContent = await this.app.vault.read(file);
            let newFileContent = originalFileContent;
            const sortedBlocks = [ ...blocks ].sort((a, b) => b.blockLocator.lineStart - a.blockLocator.lineStart);
            for (const block of sortedBlocks) {
                let updatedFullSource = block.fullSource;
                const sortedColumns = [ ...block.columns ].sort((a, b) => b.columnIndex - a.columnIndex);
                for (const {
                    columnIndex,
                    newContent
                } of sortedColumns) {
                    updatedFullSource = this.updateColumnInFullSource(updatedFullSource, newContent, columnIndex);
                }
                const locatedContent = this.replaceCodeBlockSourceAtLocator(newFileContent, block.fullSource, updatedFullSource, block.blockLocator);
                if (locatedContent === null) return false;
                newFileContent = locatedContent;
            }
            if (newFileContent !== originalFileContent) {
                await this.app.vault.modify(file, newFileContent);
            }
            return true;
        } catch (error) {
            return false;
        }
    };
    // \u65b0\u589e\uff1a\u6e05\u7406\u6240\u6709\u7f16\u8f91\u72b6\u6001
    clearAllEditingColumns = () => {
        for (const [ editKey, editInfo ] of this.editingColumns) {
            const {
                columnElement,
                handleClickOutside
            } = editInfo;
            // \u79fb\u9664\u4e8b\u4ef6\u76d1\u542c\u5668
            if (handleClickOutside) {
                document.removeEventListener("click", handleClickOutside);
            }
            // \u9000\u51fa\u7f16\u8f91\u6a21\u5f0f
            this.exitEditMode(columnElement);
        }
        // \u6e05\u7a7aMap
        this.editingColumns.clear();
    };
    saveEdit = (columnElement, newContent, columnSource, fullSource, columnIndex, ctx) => {
        this.exitEditMode(columnElement);
        this.reloadEntireCodeBlock(ctx.sourcePath, fullSource, columnIndex, newContent);
    };
    cancelEdit = columnElement => {
        // \u627e\u5230\u5bf9\u5e94\u7684\u7f16\u8f91\u4fe1\u606f
        let targetEditKey = null;
        for (const [ editKey, editInfo ] of this.editingColumns) {
            if (editInfo.columnElement === columnElement) {
                targetEditKey = editKey;
                break;
            }
        }
        if (targetEditKey) {
            const editInfo = this.editingColumns.get(targetEditKey);
            const {
                handleClickOutside
            } = editInfo;
            // \u79fb\u9664\u4e8b\u4ef6\u76d1\u542c\u5668
            if (handleClickOutside) {
                document.removeEventListener("click", handleClickOutside);
            }
            // \u4eceMap\u4e2d\u79fb\u9664
            this.editingColumns.delete(targetEditKey);
        }
        this.exitEditMode(columnElement);
    };
    exitEditMode = columnElement => {
        columnElement.classList.remove("editing-mode");
        columnElement.style.backgroundColor = "";
        columnElement.style.border = "";
        columnElement.style.borderRadius = "";
        columnElement.style.padding = "";
        // \u9000\u51fa\u7f16\u8f91\u65f6\u79fb\u9664\u5efa\u8bae\u5f39\u7a97\u3002
        const editContainer = columnElement.querySelector(".column-edit-container");
        const textArea = editContainer?.querySelector(".column-edit-textarea");
        if (textArea?._columnLinkSuggest) {
            textArea._columnLinkSuggest.destroy();
            textArea._columnLinkSuggest = null;
        }
        if (editContainer) {
            editContainer.remove();
        }
        // \u6062\u590d\u8fdb\u5165\u7f16\u8f91\u6a21\u5f0f\u524d\u7684\u539f\u8282\u70b9\u53ca\u5176 display \u72b6\u6001\u3002
        const originalDisplays = columnElement._columnOriginalChildDisplays;
        const originalChildren = Array.from(columnElement.children);
        originalChildren.forEach(child => {
            if (!child.classList.contains("column-resize-handle")) {
                child.style.display = originalDisplays?.get(child) ?? "";
            }
        });
        columnElement._columnOriginalChildDisplays = null;
        this.hideAutocomplete();
    };
    setupAutocomplete = (textArea, editContainer, sourcePath) => {
        const suggester = new ColumnLinkSuggest(this.app, this, textArea, sourcePath);
        textArea._columnLinkSuggest = suggester;
        textArea.addEventListener("input", () => {
            const cursorPos = textArea.selectionStart;
            const beforeCursor = textArea.value.substring(0, cursorPos);
            const match = beforeCursor.match(/\[\[([^\]]*)$/);
            if (match) {
                // match[1] \u53ef\u4ee5\u4e3a\u7a7a\uff1a\u521a\u8f93\u5165 [[ \u5c31\u7acb\u5373\u663e\u793a\u5168\u90e8\u5019\u9009\u3002
                suggester.showFor(match[1], cursorPos);
            } else {
                suggester.close();
            }
        });
        textArea.addEventListener("keydown", event => suggester.handleKeydown(event));
        textArea.addEventListener("scroll", () => {
            if (suggester.isActive) suggester.positionAtCaret();
        });
    };
    hideAutocomplete = () => {
        this.activeLinkSuggest?.close();
    };
    insertSuggestionAtPosition = (textArea, suggestion, insertPos) => {
        if (!textArea || !Number.isInteger(insertPos)) return;
        const text = textArea.value;
        const beforeInsert = text.substring(0, insertPos);
        const afterInsert = text.substring(insertPos);
        const openBracketPos = beforeInsert.lastIndexOf("[[");
        if (openBracketPos === -1) return;
        const newText = beforeInsert.substring(0, openBracketPos) + "[[" + suggestion + "]]" + afterInsert;
        textArea.value = newText;
        const newCursorPos = openBracketPos + suggestion.length + 4;
        textArea.setSelectionRange(newCursorPos, newCursorPos);
        textArea._columnLinkSuggest?.close();
        textArea.focus();
    };
    extractColumnContent = source => {
        let lines = source.split("\n");
        let contentLines = [];
        let inContent = false;
        for (let line of lines) {
            if (line.trim() === SETTINGSDELIM) {
                inContent = true;
                continue;
            }
            if (inContent && line.trim().startsWith("```")) {
                break;
            }
            if (inContent) {
                contentLines.push(line);
            }
        }
        return contentLines.join("\n").trim();
    };
    isColumnEditable = columnSource => {
        let lines = columnSource.split("\n");
        for (let line of lines) {
            let trimmedLine = line.trim();
            if (trimmedLine === "columneditable:true") {
                return true;
            }
        }
        return false;
    };
    addColumnResizeHandle = (columnElement, parentElement, columnIndex, sourceColumnIndex, blockLocator, fullSource) => {
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "column-resize-handle";
        resizeHandle.dataset.columnIndex = columnIndex.toString();
        const addColumnControl = document.createElement("button");
        addColumnControl.type = "button";
        addColumnControl.className = "column-add-control";
        addColumnControl.setAttribute("aria-label", "\u5728\u6b64\u5904\u65b0\u589e\u4e00\u5217");
        addColumnControl.title = "\u5728\u6b64\u5904\u65b0\u589e\u4e00\u5217";
        resizeHandle.appendChild(addColumnControl);
        let isAddingColumn = false;
        addColumnControl.addEventListener("pointerdown", e => {
            e.stopPropagation();
        });
        addColumnControl.addEventListener("click", async e => {
            e.preventDefault();
            e.stopPropagation();
            if (isAddingColumn) return;
            isAddingColumn = true;
            addColumnControl.disabled = true;
            try {
                const newFlexGrow = this.calculateNewColumnFlexGrow(parentElement);
                await this.addColumnAfter(columnElement.dataset.sourcePath, fullSource, sourceColumnIndex, blockLocator, newFlexGrow);
            } finally {
                isAddingColumn = false;
                addColumnControl.disabled = false;
            }
        });
        // pointerdown \u7684 stopPropagation \u4e0d\u4f1a\u81ea\u52a8\u62e6\u622a\u540e\u7eed click\u3002
        // \u963b\u6b62 click \u5192\u6ce1\u5230 editable-column\uff0c\u5426\u5219\u91ca\u653e\u65f6\u4f1a\u77ed\u6682\u8fdb\u5165\u7f16\u8f91\u6a21\u5f0f\u3002
        resizeHandle.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
        });
        let isDragging = false;
        let activePointerId = null;
        let startX = 0;
        let rowColumns = [];
        let startWidths = [];
        let currentWidths = [];
        let originalFlexGrows = [];
        let rowWidth = 0;
        let minimumColumnWidth = 50;
        const getRowColumns = () => {
            const columnTop = columnElement.getBoundingClientRect().top;
            return this.getDirectColumnChildren(parentElement).filter(column => Math.abs(column.getBoundingClientRect().top - columnTop) < 1);
        };
        const distributeRemainingWidth = (totalWidth, weights, minimumWidth) => {
            if (weights.length === 0) return [];
            const result = new Array(weights.length).fill(0);
            const remainingIndexes = new Set(weights.map((_, index) => index));
            const effectiveMinimum = Math.min(minimumWidth, totalWidth / weights.length);
            let widthLeft = totalWidth;
            while (remainingIndexes.size > 0) {
                const weightTotal = Array.from(remainingIndexes).reduce((sum, index) => sum + Math.max(0, weights[index]), 0);
                const fallbackWeight = weightTotal > 0 ? null : 1 / remainingIndexes.size;
                let fixedAny = false;
                for (const index of Array.from(remainingIndexes)) {
                    const proportion = fallbackWeight ?? Math.max(0, weights[index]) / weightTotal;
                    const proposedWidth = widthLeft * proportion;
                    if (proposedWidth < effectiveMinimum) {
                        result[index] = effectiveMinimum;
                        widthLeft -= effectiveMinimum;
                        remainingIndexes.delete(index);
                        fixedAny = true;
                    }
                }
                if (!fixedAny) {
                    const finalWeightTotal = Array.from(remainingIndexes).reduce((sum, index) => sum + Math.max(0, weights[index]), 0);
                    for (const index of remainingIndexes) {
                        const proportion = finalWeightTotal > 0 ? Math.max(0, weights[index]) / finalWeightTotal : 1 / remainingIndexes.size;
                        result[index] = widthLeft * proportion;
                    }
                    break;
                }
            }
            return result;
        };
        const updateDraggedWidths = clientX => {
            if (!isDragging || rowColumns.length < 2) return;
            const currentIndex = rowColumns.indexOf(columnElement);
            const otherStartWidths = startWidths.filter((_, index) => index !== currentIndex);
            const feasibleMinimum = Math.min(minimumColumnWidth, rowWidth / rowColumns.length);
            const maximumWidth = rowWidth - feasibleMinimum * (rowColumns.length - 1);
            const requestedWidth = startWidths[currentIndex] + clientX - startX;
            const targetWidth = Math.min(maximumWidth, Math.max(feasibleMinimum, requestedWidth));
            const otherWidths = distributeRemainingWidth(rowWidth - targetWidth, otherStartWidths, feasibleMinimum);
            let otherIndex = 0;
            currentWidths = rowColumns.map((column, index) => {
                const width = index === currentIndex ? targetWidth : otherWidths[otherIndex++];
                column.style.width = `${width}px`;
                column.style.flexBasis = `${width}px`;
                column.style.flexGrow = "0";
                column.style.flexShrink = "0";
                return width;
            });
            this.positionColumnResizeHandles(parentElement);
        };
        resizeHandle.addEventListener("pointerdown", e => {
            if (e.button !== 0 || isDragging || e.target.closest(".column-add-control")) return;
            e.preventDefault();
            e.stopPropagation();
            rowColumns = getRowColumns();
            if (rowColumns.length < 2) return;
            isDragging = true;
            columnElement.dataset.suppressEditClickUntil = String(Date.now() + 500);
            activePointerId = e.pointerId;
            startX = e.clientX;
            startWidths = rowColumns.map(column => column.getBoundingClientRect().width);
            currentWidths = [ ...startWidths ];
            rowWidth = startWidths.reduce((sum, width) => sum + width, 0);
            originalFlexGrows = rowColumns.map(column => {
                const flexGrow = parseFloat(getComputedStyle(column).flexGrow);
                return Number.isFinite(flexGrow) && flexGrow > 0 ? flexGrow : 1;
            });
            const configuredMinimum = Number(this.settings.wrapSize.value);
            minimumColumnWidth = Number.isFinite(configuredMinimum) && configuredMinimum > 0 ? configuredMinimum : 50;
            parentElement.style.transition = "none";
            resizeHandle.classList.add("dragging");
            resizeHandle.style.backgroundColor = "rgba(100, 150, 255, 0.5)";
            rowColumns.forEach(column => column.classList.add("dragging"));
            parentElement.classList.add("dragging");
            resizeHandle.setPointerCapture(e.pointerId);
        });
        const handlePointerMove = e => {
            if (!isDragging || e.pointerId !== activePointerId) return;
            updateDraggedWidths(e.clientX);
        };
        const finishDragging = e => {
            if (!isDragging || e.pointerId !== activePointerId) return;
            // pointermove \u53ef\u80fd\u6ca1\u6709\u6765\u5f97\u53ca\u5904\u7406\u6700\u540e\u7684\u91ca\u653e\u5750\u6807\u3002
            if (e.type === "pointerup") {
                updateDraggedWidths(e.clientX);
            }
            isDragging = false;
            columnElement.dataset.suppressEditClickUntil = String(Date.now() + 300);
            const pointerId = activePointerId;
            activePointerId = null;
            resizeHandle.classList.remove("dragging");
            resizeHandle.style.backgroundColor = "transparent";
            rowColumns.forEach(column => column.classList.remove("dragging"));
            parentElement.classList.remove("dragging");
            parentElement.style.transition = "";
            if (resizeHandle.hasPointerCapture(pointerId)) {
                resizeHandle.releasePointerCapture(pointerId);
            }
            const allColumns = this.getDirectColumnChildren(parentElement);
            const newFlexGrows = this.calculateProportionalFlexGrows(currentWidths, originalFlexGrows);
            rowColumns.forEach((col, index) => {
                this.applyStyle(col, this.generateCssString(newFlexGrows[index]));
                col.style.flexShrink = "";
            });
            // \u786e\u4fdd\u5176\u4ed6\u884c\u7684 basis \u4e5f\u4e0e grow \u4fdd\u6301\u540c\u4e00\u6bd4\u4f8b\u6a21\u578b\u3002
            allColumns.filter(col => !rowColumns.includes(col)).forEach(col => {
                const flexGrow = parseFloat(getComputedStyle(col).flexGrow) || 1;
                this.applyStyle(col, this.generateCssString(flexGrow));
            });
            const flexGrows = allColumns.map(col => parseFloat(col.style.flexGrow) || 1);
            if (!this.validateFlexGrowCalculation(flexGrows, allColumns)) return;
            this.saveColumnWidth(columnElement, parentElement, columnIndex);
            this.positionColumnResizeHandles(parentElement);
        };
        resizeHandle.addEventListener("pointermove", handlePointerMove);
        resizeHandle.addEventListener("pointerup", finishDragging);
        resizeHandle.addEventListener("pointercancel", finishDragging);
        parentElement.style.position = "relative";
        parentElement.appendChild(resizeHandle);
        this.positionColumnResizeHandles(parentElement);
    };
    saveColumnWidth = (columnElement, parentElement, columnIndex) => {
        const allColumns = this.getDirectColumnChildren(parentElement);
        const flexGrows = allColumns.map(col => parseFloat(col.style.flexGrow) || 1);
        const sourcePath = columnElement.dataset.sourcePath;
        const fullSource = columnElement.dataset.fullSource;
        if (sourcePath && fullSource) {
            this.updateAllFlexGrowsInSource(sourcePath, fullSource, flexGrows);
        }
        allColumns.forEach((col, index) => {
            const innerElement = col.querySelector(".block-language-col-md");
            if (innerElement && innerElement.childNodes[0]) {
                const innerStyle = this.generateCssString(flexGrows[index]);
                delete innerStyle.width;
                this.applyStyle(innerElement.childNodes[0], innerStyle);
            }
        });
    };
    calculateProportionalFlexGrows = (widths, currentFlexGrows) => {
        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        const currentTotalFlexGrow = currentFlexGrows.reduce((sum, flexGrow) => sum + flexGrow, 0);
        const totalFlexGrow = currentTotalFlexGrow > 0 ? currentTotalFlexGrow : widths.length;
        if (totalWidth <= 0 || widths.length === 0) return [];
        const result = widths.map(width => Math.max(1e-6, Number((width / totalWidth * totalFlexGrow).toFixed(6))));
        const roundedTotal = result.reduce((sum, flexGrow) => sum + flexGrow, 0);
        result[result.length - 1] = Number(Math.max(1e-6, result[result.length - 1] + totalFlexGrow - roundedTotal).toFixed(6));
        return result;
    };
    validateFlexGrowCalculation = (flexGrows, allColumns) => {
        const totalFlexGrow = flexGrows.reduce((sum, fg) => sum + fg, 0);
        return flexGrows.length === allColumns.length && Number.isFinite(totalFlexGrow) && totalFlexGrow > 0 && flexGrows.every(flexGrow => Number.isFinite(flexGrow) && flexGrow > 0);
    };
    updateAllFlexGrowsInSource = async (sourcePath, fullSource, flexGrows) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateAllFlexGrowsInFullSource(fullSource, flexGrows);
            const newFileContent = this.replaceCodeBlockSourceAtLocator(fileContent, fullSource, updatedFullSource, {
                lineStart: -1,
                lineEnd: -1
            });
            if (newFileContent !== null && newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent);
            }
        } catch (error) {}
    };
    updateFlexGrowInSource = async (sourcePath, fullSource, columnSource, newFlexGrow, columnIndex) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateFlexGrowInFullSource(fullSource, newFlexGrow, columnIndex);
            const newFileContent = this.replaceCodeBlockSourceAtLocator(fileContent, fullSource, updatedFullSource, {
                lineStart: -1,
                lineEnd: -1
            });
            if (newFileContent !== null && newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent);
            }
        } catch (error) {}
    };
    updateAllFlexGrowsInFullSource = (fullSource, flexGrows) => {
        let lines = fullSource.split("\n");
        let result = [];
        let currentColumnIndex = -1;
        let i = 0;
        while (i < lines.length) {
            let line = lines[i];
            if (line.trim().startsWith("````col-md")) {
                currentColumnIndex++;
                let columnLines = [ line ];
                let j = i + 1;
                while (j < lines.length && !lines[j].trim().startsWith("````col-md")) {
                    columnLines.push(lines[j]);
                    j++;
                }
                let updatedColumn = this.updateFlexGrowInColumn(columnLines.join("\n"), flexGrows[currentColumnIndex]);
                result.push(updatedColumn);
                i = j;
                continue;
            }
            result.push(line);
            i++;
        }
        return result.join("\n");
    };
    updateFlexGrowInFullSource = (fullSource, newFlexGrow, columnIndex) => {
        let lines = fullSource.split("\n");
        let result = [];
        let currentColumnIndex = -1;
        let i = 0;
        while (i < lines.length) {
            let line = lines[i];
            if (line.trim().startsWith("````col-md")) {
                currentColumnIndex++;
                if (currentColumnIndex === columnIndex) {
                    let columnLines = [ line ];
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim().startsWith("````col-md")) {
                        columnLines.push(lines[j]);
                        j++;
                    }
                    let updatedColumn = this.updateFlexGrowInColumn(columnLines.join("\n"), newFlexGrow);
                    result.push(updatedColumn);
                    i = j;
                    continue;
                }
            }
            result.push(line);
            i++;
        }
        return result.join("\n");
    };
    updateFlexGrowInColumn = (columnSource, newFlexGrow) => {
        let lines = columnSource.split("\n");
        let result = [];
        let flexGrowUpdated = false;
        for (let line of lines) {
            if (line.trim().startsWith("flexGrow=")) {
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
                if (i === 0 && lines[i].trim().startsWith("````col-md")) {
                    newLines.push(`flexGrow=${newFlexGrow}`);
                }
            }
            return newLines.join("\n");
        }
        return result.join("\n");
    };
    parseColumnSources = source => {
        let lines = source.split("\n");
        let columnSources = [];
        let currentColumn = [];
        let inColumn = false;
        for (let line of lines) {
            if (line.trim().startsWith("````col-md")) {
                if (inColumn && currentColumn.length > 0) {
                    columnSources.push(currentColumn.join("\n"));
                }
                currentColumn = [ line ];
                inColumn = true;
            } else if (inColumn) {
                currentColumn.push(line);
            }
        }
        if (inColumn && currentColumn.length > 0) {
            columnSources.push(currentColumn.join("\n"));
        }
        return columnSources;
    };
    updateColumnContent = (columnElement, newContent, originalSource, ctx) => {
        columnElement.innerHTML = "";
        const sourcePath = ctx.sourcePath;
        let renderChild = new MarkdownRenderChild(columnElement);
        ctx.addChild(renderChild);
        MarkdownRenderer.renderMarkdown(newContent, columnElement, sourcePath, renderChild);
        this.processChild(columnElement);
        requestAnimationFrame(() => {
            const internalLinks = columnElement.querySelectorAll("a.internal-link");
            if (internalLinks.length > 0) {
                const event = new Event("mouseenter", {
                    bubbles: true
                });
                internalLinks.forEach(link => {
                    link.dispatchEvent(event);
                });
            }
        });
    };
    rebuildColumnSource = (originalSource, newContent) => {
        let lines = originalSource.split("\n");
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
            if (inContent && line.trim().startsWith("```")) {
                inContent = false;
                result.push(line);
                continue;
            }
            if (!inContent) {
                result.push(line);
            }
        }
        return result.join("\n");
    };
    updateColumnInFullSource = (fullSource, updatedColumnSource, columnIndex) => {
        let lines = fullSource.split("\n");
        let result = [];
        let currentColumnIndex = -1;
        let i = 0;
        while (i < lines.length) {
            let line = lines[i];
            if (line.trim().startsWith("````col-md")) {
                currentColumnIndex++;
                if (currentColumnIndex === columnIndex) {
                    let columnLines = [ line ];
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim().startsWith("````col-md")) {
                        columnLines.push(lines[j]);
                        j++;
                    }
                    let originalColumnSource = columnLines.join("\n");
                    let updatedColumn = this.rebuildColumnSource(originalColumnSource, updatedColumnSource);
                    result.push(updatedColumn);
                    i = j;
                    continue;
                }
            }
            result.push(line);
            i++;
        }
        return result.join("\n");
    };
    reloadEntireCodeBlock = async (sourcePath, fullSource, columnIndex, newContent) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateColumnInFullSource(fullSource, newContent, columnIndex);
            const newFileContent = this.replaceCodeBlockSourceAtLocator(fileContent, fullSource, updatedFullSource, {
                lineStart: -1,
                lineEnd: -1
            });
            if (newFileContent !== null && newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent);
            }
        } catch (error) {}
    };
    tryUpdateSourceFile = async (sourcePath, fullSource, columnSource, newContent, columnIndex) => {
        try {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!file) {
                return;
            }
            const fileContent = await this.app.vault.read(file);
            const updatedFullSource = this.updateColumnInFullSource(fullSource, newContent, columnIndex);
            const newFileContent = this.replaceCodeBlockSourceAtLocator(fileContent, fullSource, updatedFullSource, {
                lineStart: -1,
                lineEnd: -1
            });
            if (newFileContent !== null && newFileContent !== fileContent) {
                await this.app.vault.modify(file, newFileContent);
            } else {}
        } catch (error) {}
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
            MarkdownRenderer.renderMarkdown(source, child, sourcePath, renderChild);
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
            const outerSource = source;
            this.codeBlockInstanceCounter = (this.codeBlockInstanceCounter || 0) + 1;
            const blockInstanceId = this.codeBlockInstanceCounter;
            const sectionInfo = typeof ctx.getSectionInfo === "function" ? ctx.getSectionInfo(el) : null;
            const lineStart = Number.isFinite(sectionInfo?.lineStart) ? sectionInfo.lineStart : -1;
            const lineEnd = Number.isFinite(sectionInfo?.lineEnd) ? sectionInfo.lineEnd : -1;
            const blockLocator = {
                lineStart: lineStart,
                lineEnd: lineEnd,
                expectedSource: outerSource,
                blockKey: `${ctx.sourcePath}::${lineStart}:${lineEnd}::instance:${blockInstanceId}`
            };
            let mdSettings = findSettings(outerSource);
            let settings = parseSettings(mdSettings.settings);
            let rowSource = parseRows(mdSettings.source);
            let columnOffset = 0;
            for (let source of rowSource) {
                const sourcePath = ctx.sourcePath;
                let child = createDiv();
                let renderChild = new MarkdownRenderChild(child);
                ctx.addChild(renderChild);
                let renderAwait = MarkdownRenderer.renderMarkdown(source, child, sourcePath, renderChild);
                let parent = el.createEl("div", {
                    cls: "columnParent"
                });
                let columnSources = this.parseColumnSources(source);
                const renderedColumns = Array.from(child.children);
                renderedColumns.forEach((c, columnIndex) => {
                    const sourceColumnIndex = columnOffset + columnIndex;
                    let cc = parent.createEl("div", {
                        cls: "columnChild"
                    });
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
                    cc.dataset.columnIndex = sourceColumnIndex;
                    if (this.isColumnEditable(columnSource)) {
                        this.makeColumnEditable(cc, columnSource, outerSource, sourceColumnIndex, ctx, blockLocator);
                    }
                    this.addColumnResizeHandle(cc, parent, columnIndex, sourceColumnIndex, blockLocator, outerSource);
                });
                columnOffset += renderedColumns.length;
                if (settings.height != null) {
                    let height = settings.height;
                    if (height === "shortest") {
                        await renderAwait;
                        let shortest = Math.min(...this.getDirectColumnChildren(parent).map(c => c.childNodes[0]).map(c => parseDirtyNumber(getComputedStyle(c).height) + parseDirtyNumber(getComputedStyle(c).lineHeight)));
                        let heightCSS = {};
                        heightCSS.height = shortest + "px";
                        heightCSS.overflow = "scroll";
                        this.getDirectColumnChildren(parent).map(c => c.childNodes[0]).forEach(c => {
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
                this.observeColumnParentResize(parent, ctx);
            }
        });
        this.addCommand({
            id: "insert-column-wrapper",
            name: "Insert column wrapper",
            editorCallback: (editor, view) => {
                new ColumnInsertModal(this.app, result => {
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
                    editor.setCursor({
                        line: cursorPosition.line + 5,
                        ch: 0
                    }); // Place the cursor on the specified line
                } else {
                    let lines = selectedText.split("\n").length; // Calculate the number of lines in the selected text
                    editor.setCursor({
                        line: cursorPosition.line + 5 + lines - 1,
                        ch: selectedText.length - selectedText.lastIndexOf("\n") - 1
                    }); // Place the cursor after the inserted string
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
                    editor.setCursor({
                        line: cursorPosition.line + 5,
                        ch: 0
                    }); // Place the cursor on the new line after # New Column
                } else {
                    // If there is selected text, place it in the specified location
                    outString = "```col-md\nflexGrow=1\ncolumneditable:true\n===\n" + selectedText + "\n```";
                    editor.replaceSelection(outString); // Replace the selection with the constructed string
                    let lines = selectedText.split("\n").length; // Calculate the number of lines in the selected text
                    editor.setCursor({
                        line: cursorPosition.line + lines + 3,
                        ch: selectedText.length - selectedText.lastIndexOf("\n") - 1
                    }); // Place the cursor after the last character of the selected text
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
                    let colParent = element.createEl("div", {
                        cls: "columnParent"
                    });
                    let renderColP = new MarkdownRenderChild(colParent);
                    context.addChild(renderColP);
                    let itemList = listItem.querySelector("ul, ol");
                    if (itemList == null) {
                        continue;
                    }
                    for (let itemListItem of Array.from(itemList.children)) {
                        let childDiv = colParent.createEl("div", {
                            cls: "columnChild"
                        });
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
        this.registerMarkdownPostProcessor((element, context) => {
            processList(element, context);
        });
    }
    applyPotentialBorderStyling(settings, child) {
        const hasBorder = settings.borderColor != null || settings.borderStyle != null || settings.borderWidth != null || settings.borderRadius != null || settings.borderPadding != null;
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
        // \u6e05\u7406\u6240\u6709\u6b63\u5728\u7f16\u8f91\u7684\u5217
        this.clearAllEditingColumns();
        document.querySelectorAll(".columnParent, .columnChild, .editable-column").forEach(el => {
            if (el.dataset.clickHandler) {
                el.removeEventListener("click", el.dataset.clickHandler);
            }
            const resizeHandles = el.querySelectorAll(".column-resize-handle");
            resizeHandles.forEach(handle => {
                handle.remove();
            });
            el.remove();
        });
        this.hideAutocomplete();
        document.removeEventListener("click", this.handleClickOutside);
    }
    async loadSettings() {
        await loadSettings(this, DEFAULT_SETTINGS);
        let r = document.querySelector(":root");
        r.style.setProperty(MINWIDTHVARNAME, this.settings.wrapSize.value.toString() + "px");
        r.style.setProperty(DEFSPANVARNAME, this.settings.defaultSpan.value.toString());
    }
    async saveSettings() {
        await saveSettings(this, DEFAULT_SETTINGS);
    }
}

const DEFAULT_MODAL_SETTINGS = {
    numberOfColumns: {
        value: 2,
        name: "\u521b\u5efa\u5217\u6570",
        desc: "\u5c06\u8981\u521b\u5efa\u7684\u5217\u6570"
    }
};

class ColumnEditModal extends Modal {
    constructor(app, originalContent, onSubmit) {
        super(app);
        this.originalContent = originalContent;
        this.onSubmit = onSubmit;
    }
    onOpen() {
        const {
            contentEl
        } = this;
        contentEl.createEl("h1", {
            text: "\u7f16\u8f91\u5217\u5185\u5bb9"
        });
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
            text: "\u7f16\u8f91 === \u548c ``` \u4e4b\u95f4\u7684\u5185\u5bb9\u3002\u70b9\u51fb\u4fdd\u5b58\u6309\u94ae\u5e94\u7528\u66f4\u6539\u3002",
            cls: "column-edit-description"
        });
        const buttonContainer = contentEl.createEl("div", {
            cls: "column-edit-buttons"
        });
        buttonContainer.style.marginTop = "20px";
        buttonContainer.style.textAlign = "right";
        const cancelBtn = buttonContainer.createEl("button", {
            text: "\u53d6\u6d88",
            cls: "mod-warning"
        });
        cancelBtn.style.marginRight = "10px";
        cancelBtn.addEventListener("click", () => {
            this.close();
        });
        const saveBtn = buttonContainer.createEl("button", {
            text: "\u4fdd\u5b58",
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
        let {
            contentEl
        } = this;
        contentEl.empty();
    }
}

class ColumnInsertModal extends Modal {
    constructor(app, onSubmit) {
        super(app);
        this.onSubmit = onSubmit;
    }
    onOpen() {
        const {
            contentEl
        } = this;
        contentEl.createEl("h1", {
            text: "\u521b\u5efa\u81ea\u5b9a\u4e49\u5217"
        });
        let modalSettings = DEFAULT_MODAL_SETTINGS;
        let keyvals = Object.entries(DEFAULT_MODAL_SETTINGS);
        for (let keyval of keyvals) {
            createSetting(contentEl, keyval, "", (value, key) => {
                modalSettings[key].value = value;
            });
        }
        new Setting(contentEl).addButton(btn => btn.setButtonText("\u63d0\u4ea4").setCta().onClick(() => {
            this.close();
            this.onSubmit(modalSettings);
        }));
    }
    onClose() {
        let {
            contentEl
        } = this;
        contentEl.empty();
    }
}

class RenameModal extends Modal {
    constructor(app, defaultName, onSubmit, attachmentPath = "attachments", extension = "png") {
        super(app);
        this.defaultName = defaultName;
        this.onSubmit = onSubmit;
        this.result = null;
        this.attachmentPath = attachmentPath;
        this.extension = extension;
        this.isSubmitted = false; // \u6807\u8bb0\u662f\u5426\u5df2\u7ecf\u63d0\u4ea4
    }
    onOpen() {
        const {
            contentEl
        } = this;
        contentEl.empty();
        contentEl.createEl("h2", {
            text: "\u91cd\u547d\u540d\u56fe\u7247"
        });
        // \u6dfb\u52a0\u63d0\u793a\u4fe1\u606f
        const hintText = contentEl.createEl("p", {
            text: "\u63d0\u793a\uff1a\u70b9\u51fb\u786e\u8ba4\u6216\u53d6\u6d88\u6309\u94ae\u6765\u5b8c\u6210\u64cd\u4f5c\uff0c\u76f4\u63a5\u5173\u95ed\u7a97\u53e3\u5c06\u4f7f\u7528\u9ed8\u8ba4\u540d\u79f0\u3002",
            cls: "modal-hint"
        });
        hintText.style.fontSize = "12px";
        hintText.style.color = "var(--text-muted)";
        hintText.style.marginBottom = "15px";
        hintText.style.fontStyle = "italic";
        const inputContainer = contentEl.createDiv({
            cls: "modal-input-container"
        });
        inputContainer.style.marginBottom = "20px";
        const label = inputContainer.createEl("label", {
            text: "\u8bf7\u8f93\u5165\u65b0\u7684\u6587\u4ef6\u540d\uff08\u4e0d\u5305\u542b\u6269\u5c55\u540d\uff09:"
        });
        label.style.display = "block";
        label.style.marginBottom = "8px";
        label.style.fontWeight = "bold";
        const input = inputContainer.createEl("input", {
            type: "text",
            value: this.defaultName,
            cls: "modal-input"
        });
        input.style.width = "100%";
        input.style.padding = "8px 12px";
        input.style.border = "1px solid var(--background-modifier-border)";
        input.style.borderRadius = "4px";
        input.style.fontSize = "14px";
        input.style.boxSizing = "border-box";
        input.focus();
        input.select();
        const buttonContainer = contentEl.createDiv({
            cls: "modal-button-container"
        });
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "flex-end";
        buttonContainer.style.gap = "10px";
        buttonContainer.style.marginTop = "20px";
        const confirmButton = buttonContainer.createEl("button", {
            text: "\u786e\u8ba4",
            cls: "mod-cta"
        });
        confirmButton.style.padding = "8px 16px";
        confirmButton.style.borderRadius = "4px";
        const cancelButton = buttonContainer.createEl("button", {
            text: "\u53d6\u6d88"
        });
        cancelButton.style.padding = "8px 16px";
        cancelButton.style.borderRadius = "4px";
        cancelButton.style.marginRight = "0";
        const handleSubmit = async () => {
            const value = input.value.trim();
            if (value && value.length > 0) {
                // \u9a8c\u8bc1\u6587\u4ef6\u540d\u662f\u5426\u5408\u6cd5
                const invalidChars = /[<>:"/\\|?*]/g;
                if (invalidChars.test(value)) {
                    new Notice("\u6587\u4ef6\u540d\u5305\u542b\u65e0\u6548\u5b57\u7b26\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165");
                    input.focus();
                    return;
                }
                // \u68c0\u67e5\u6587\u4ef6\u662f\u5426\u5df2\u5b58\u5728\uff08\u53ef\u9009\u7684\u8b66\u544a\uff0c\u4e0d\u963b\u6b62\u64cd\u4f5c\uff09
                const targetPath = `${this.attachmentPath}/${value}.${this.extension}`;
                const exists = await this.app.vault.adapter.exists(targetPath);
                if (exists && value !== this.defaultName) {}
                this.result = value;
                this.isSubmitted = true;
                this.onSubmit(value);
            } else {
                new Notice("\u6587\u4ef6\u540d\u4e0d\u80fd\u4e3a\u7a7a");
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
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
            } else if (e.key === "Escape") {
                e.preventDefault();
                handleCancel();
            }
        });
        // \u963b\u6b62\u70b9\u51fb\u6a21\u6001\u6846\u5916\u90e8\u65f6\u5173\u95ed
        this.containerEl.addEventListener("click", e => {
            e.stopPropagation();
        });
    }
    onClose() {
        const {
            contentEl
        } = this;
        contentEl.empty();
        // \u5982\u679c\u6ca1\u6709\u901a\u8fc7\u786e\u8ba4\u6216\u53d6\u6d88\u6309\u94ae\u63d0\u4ea4\uff0c\u5219\u4f7f\u7528\u9ed8\u8ba4\u540d\u79f0
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