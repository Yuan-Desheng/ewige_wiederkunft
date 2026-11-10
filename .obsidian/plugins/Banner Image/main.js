let{Plugin,MarkdownView,TFile,TFolder,PluginSettingTab,Setting,Modal,Notice,setIcon,normalizePath}=require("obsidian"),IMAGE_EXTENSIONS=new Set(["png","jpg","jpeg","gif","webp","bmp","svg","avif"]);class BannerImagePlugin extends Plugin{constructor(){super(...arguments),this.imageCache=new Map,this.loadedBanners=new Set,this.boundAddButtonAreas=new WeakSet,this.addButtonResizeObservers=new Map,this.vaultImageFiles=[]}async onload(){await this.loadSettings(),this.refreshImageIndex(),this.registerImageIndexEvents(),this.addStyle(),this.applyBannerHeight(),this.applyBannerFit(),this.addSettingTab(new BannerImageSettingTab(this.app,this)),this.registerCommands(),this.registerEvent(this.app.workspace.on("file-open",e=>{e&&this.handleFileOpen(e)})),this.registerEvent(this.app.workspace.on("active-leaf-change",()=>{setTimeout(()=>{this.updateActiveBanner()},50)})),this.registerEvent(this.app.vault.on("modify",e=>{e instanceof TFile&&"md"===e.extension&&this.handleFileModify(e)})),this.registerEvent(this.app.workspace.on("layout-change",()=>{setTimeout(()=>{this.updateActiveBanner()},100)})),this.registerEvent(this.app.workspace.on("editor-change",()=>{clearTimeout(this.editorChangeTimeout),this.editorChangeTimeout=setTimeout(()=>{this.updateActiveBanner()},500)})),this.registerEvent(this.app.workspace.on("view-mode-change",()=>{setTimeout(()=>{this.updateActiveBanner()},100)})),setTimeout(()=>{this.updateActiveBanner()},200)}onunload(){this.removeBanners(),this.imageCache.clear(),this.loadedBanners.clear(),this.addButtonResizeObservers.forEach(({observer:e})=>e.disconnect()),this.addButtonResizeObservers.clear(),window.clearTimeout(this.imageIndexRefreshTimer),window.clearTimeout(this.imagePathSettingTimer),document.getElementById("banner-image-plugin-style")?.remove()}async loadSettings(){this.settings=Object.assign({bannerHeight:200,imageFit:"cover",attachmentFolder:"Extras/头图",imageSearchPaths:""},await this.loadData())}async saveSettings(){await this.saveData(this.settings)}applyBannerHeight(){try{var e=this.settings.bannerHeight+"px";document.documentElement.style.setProperty("--banner-height",e)}catch(e){}}applyBannerFit(){try{var e=this.settings.imageFit||"cover";document.documentElement.style.setProperty("--banner-object-fit",e)}catch(e){}}addStyle(){var e=document.createElement("style");e.id="banner-image-plugin-style",e.textContent=`
            :root {
                --banner-gradient-top-alpha: 0;
                --banner-gradient-mid-alpha: 0.55;
                --banner-gradient-bottom-alpha: 1;
                --banner-gradient-height: 60%;
                --banner-height: ${this.settings.bannerHeight}px;
                --banner-object-fit: ${this.settings.imageFit};
            }

            /* 主题适配：为不同主题设置背景主色的 RGB 以及渐变强度 */
            .theme-light {
                --background-primary-rgb: var(--background-primary);
                --banner-gradient-top-alpha: 0;
                --banner-gradient-mid-alpha: 0.55;
                --banner-gradient-bottom-alpha: 1;
            }

            .theme-dark {
                --background-primary-rgb: var(--background-primary);
                --banner-gradient-top-alpha: 0;
                --banner-gradient-mid-alpha: 0.55;
                --banner-gradient-bottom-alpha: 1;
            }

            
            /* 修复实时预览模式下的布局问题：仅允许换行，不再强行改写左右位置和宽度 */
            .markdown-source-view.mod-cm6 .cm-scroller {
                flex-wrap: wrap;
            }
            
            .view-content > .markdown-source-view.mod-cm6 > .cm-editor > .cm-scroller{
                padding: 0 !important;
            }
            .markdown-preview-view{

                padding-top: var(--file-margins);
            
            }
            .banner-image-container {
                position: relative;
                width: calc(100%);
                height: var(--banner-height, 200px);
                margin: 0 0 0 0 !important;
                padding: 0 !important;
                overflow: hidden;
                pointer-events: auto;
                user-select: none;
                box-sizing: border-box;
            }
            
            .markdown-preview-view .banner-image-container {
                margin-top: calc(-1 * var(--file-margins)) !important;
                margin-left: calc(-1 * var(--file-margins)) !important;
                margin-right: calc(-1 * var(--file-margins)) !important;
                width: calc(100% + 2 * var(--file-margins)) !important;

            }

            
            .banner-image {
                position: relative;
                z-index: 1;
                width: 100%;
                height: 100%;
                object-fit: var(--banner-object-fit, cover);
                pointer-events: none;
                user-select: none;
                -webkit-user-drag: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
                user-drag: none;
            }
            
            .banner-loading {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f0f0f0;
                color: #666;
                pointer-events: none;
                user-select: none;
                -webkit-user-drag: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
                user-drag: none;
            }
            
            .banner-error {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #ffe6e6;
                color: #d00;
                pointer-events: none;
                user-select: none;
                -webkit-user-drag: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
                user-drag: none;
            }
            
            .banner-gradient {
                position: absolute;
                z-index: 2;
                bottom: 0;
                left: 0;
                right: 0;
                height: var(--banner-gradient-height, 60%);
                pointer-events: none;
                opacity: 1;
                /* 在图片底部融入当前主题背景 */
                background-image: linear-gradient(
                    to bottom,
                    transparent 0%,
                    color-mix(in srgb, var(--background-primary) 55%, transparent) 75%,
                    var(--background-primary) 100%
                );
            }

            .banner-image-add-host {
                position: relative;
            }

            .banner-image-add-row {
                position: absolute;
                z-index: 20;
                top: 0;
                left: var(--file-margins, 24px);
                right: var(--file-margins, 24px);
                display: flex;
                align-items: flex-start;
                justify-content: flex-start;
                height: 48px;
                padding: 2px 0 0;
                box-sizing: border-box;
                opacity: 0;
                pointer-events: none;
                transition: opacity 120ms ease;
            }

            .banner-image-add-row.is-visible,
            .banner-image-add-row:focus-within {
                opacity: 1;
            }

            .banner-image-add-row .banner-image-add-button {
                pointer-events: auto;
            }

            .mod-left-split .banner-image-add-row,
            .mod-right-split .banner-image-add-row {
                display: none;
            }

            .banner-image-add-button{
                display: inline-flex;
                align-items: center;
                gap: 6px;
                height: 28px;
                margin-left: 40px;
                border: 0;
                border-radius: var(--button-radius, 5px);
                background: var(--background-modifier-hover) !important;
                cursor: pointer;
                font-size: var(--font-ui-small);
            }

            .banner-image-action-button {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                height: 28px;
                padding: 0 9px;
                border: 0;
                border-radius: var(--button-radius, 5px);
                background: var(--background-modifier-hover) !important;
                cursor: pointer;
                font-size: var(--font-ui-small);
            }

            .banner-image-add-button:hover,
            .banner-image-action-button:hover {
                background: var(--background-modifier-hover);
                color: var(--text-normal);
                box-shadow: none !important;
            }

            .banner-image-add-button svg,
            .banner-image-action-button svg {
                width: 15px;
                height: 15px;
            }

            .banner-image-toolbar {
                position: absolute;
                z-index: 6;
                top: 2px;
                right: 10px;
                display: flex;
                gap: 6px;
                opacity: 0;
                transform: translateY(-2px);
                transition: opacity 120ms ease, transform 120ms ease;
                pointer-events: auto;
            }

            .banner-image-container:hover .banner-image-toolbar,
            .banner-image-toolbar:focus-within {
                opacity: 1;
                transform: translateY(0);
            }

            .banner-image-action-button {
                color: var(--text-on-accent, var(--text-normal)) !important;
            }

            .banner-picker-modal {
                width: min(820px, 92vw);
            }

            .banner-picker-header {
                display: flex;
                gap: 10px;
                margin-bottom: 12px;
            }

            .banner-picker-url-row {
                display: flex;
                gap: 10px;
                margin: 0;
            }

            .banner-picker-tabs {
                display: flex;
                gap: 4px;
                margin: 12px 0 14px;
                border-radius: 10px 10px 0 0 ;
                border-bottom: 1px solid var(--background-modifier-border);
            }

            .banner-picker-tab {
                padding: 8px 14px;
                border: 0;
                border-bottom: 2px solid transparent;
                border-radius: 0;
                background: transparent;
                color: var(--text-muted);
                box-shadow: none;
                cursor: pointer;
                 border-radius: 10px 10px 0 0 ;
            }

            .banner-picker-tab:hover {
                color: var(--text-normal);
                background: var(--background-modifier-hover);
            }

            .banner-picker-tab.is-active {
                border-bottom-color: var(--interactive-accent);
                color: var(--text-normal);
                border-radius: 10px 10px 0 0;
            }

            .banner-picker-source-pane {
                display: none;
            }

            .banner-picker-source-pane.is-active {
                display: block;
            }

            .banner-picker-search,
            .banner-picker-url-input {
                flex: 1;
                min-width: 0;
                width: 100%;
                height: 34px;
                padding: 6px 10px;
                box-sizing: border-box;
                border: 1px solid var(--background-modifier-border);
                border-radius: var(--input-radius, 5px);
                background: var(--background-primary);
                color: var(--text-normal);
                box-shadow: none;
                font-size: var(--font-ui-small);
            }

            .banner-picker-search:focus,
            .banner-picker-url-input:focus {
                border-color: var(--interactive-accent);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--interactive-accent) 20%, transparent);
            }

            .banner-picker-header > button,
            .banner-picker-url-row > button {
                flex: 0 0 auto;
                min-width: 112px;
                height: 34px;
                padding: 0 12px;
                white-space: nowrap;
            }

            .banner-picker-count {
                margin-bottom: 10px;
                color: var(--text-muted);
                font-size: var(--font-ui-small);
            }

            .banner-picker-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 12px;
                max-height: min(58vh, 560px);
                overflow-y: auto;
                padding: 2px;
            }

            .banner-picker-item {
                display: flex;
                min-width: 0;
                flex-direction: column;
                padding: 0;
                overflow: hidden;
                border: 1px solid var(--background-modifier-border);
                border-radius: 2px !important;
                background: var(--background-secondary);
                color: var(--text-normal);
                cursor: pointer;
                text-align: left;
            }

            .banner-picker-item:hover {
                border-color: var(--interactive-accent);
                background: var(--background-modifier-hover);
            }

            .banner-picker-thumbnail {
                width: 100%;
                height: 88px;
                object-fit: cover;
                background: var(--background-primary-alt);
            }

            .banner-picker-name {
                padding: 7px 8px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: var(--font-ui-smaller);
            }

            .banner-picker-empty {
                grid-column: 1 / -1;
                padding: 30px;
                color: var(--text-muted);
                text-align: center;
            }

            @media (hover: none) {
                .banner-image-add-row,
                .banner-image-toolbar {
                    opacity: 1;
                    transform: none;
                }
            }

            @media (max-width: 520px) {
                .banner-picker-header,
                .banner-picker-url-row {
                    flex-direction: column;
                }

                .banner-picker-header > button,
                .banner-picker-url-row > button {
                    width: 100%;
                }
            }
        `,document.head.appendChild(e)}registerCommands(){this.addCommand({id:"add-or-change-banner",name:"添加或更换封面图片",hotkeys:[{modifiers:["Mod","Shift"],key:"b"}],checkCallback:e=>{var t=this.getActiveMarkdownFile();return!!t&&(e||this.openImagePicker(t),!0)}}),this.addCommand({id:"remove-banner",name:"移除当前笔记的封面图片",checkCallback:e=>{var t=this.getActiveMarkdownFile();return!(!t||!this.getBannerPath(t)||(e||this.removeBannerFromFile(t),0))}})}registerImageIndexEvents(){var e=(e,t="")=>{t=t.includes(".")?t.split(".").pop().toLowerCase():"";e instanceof TFile&&(IMAGE_EXTENSIONS.has(e.extension.toLowerCase())||IMAGE_EXTENSIONS.has(t))&&(window.clearTimeout(this.imageIndexRefreshTimer),this.imageIndexRefreshTimer=window.setTimeout(()=>this.refreshImageIndex(),80))};this.registerEvent(this.app.vault.on("create",e)),this.registerEvent(this.app.vault.on("delete",e)),this.registerEvent(this.app.vault.on("rename",e))}refreshImageIndex(){let t=this.getImageSearchPaths();this.vaultImageFiles=this.app.vault.getFiles().filter(e=>IMAGE_EXTENSIONS.has(e.extension.toLowerCase())&&this.isImageInSearchPaths(e,t)).sort((e,t)=>t.stat.mtime-e.stat.mtime)}getImageSearchPaths(){var e=this.settings.imageSearchPaths,e=Array.isArray(e)?e:String(e||"").split(/[\n,，;；]+/);return[...new Set(e.map(e=>normalizePath(String(e).trim()).replace(/^\/+|\/+$/g,"")).filter(Boolean))]}isImageInSearchPaths(t,e=this.getImageSearchPaths()){return 0===e.length||e.some(e=>t.path===e||t.path.startsWith(e+"/"))}getVaultImageFiles(){return this.vaultImageFiles}getActiveMarkdownFile(){var e=this.app.workspace.getActiveViewOfType(MarkdownView);return e?.file instanceof TFile?e.file:null}getBannerPath(e){var t,e=(this.app.metadataCache.getFileCache(e)?.frontmatter)?.banner;return"string"!=typeof e?null:(t=e.trim().match(/^\[\[([^\]]+)\]\]$/))?t[1].split("|")[0].trim()||null:e.trim()||null}openImagePicker(e=this.getActiveMarkdownFile()){e?new BannerImagePickerModal(this.app,this,e).open():new Notice("请先打开一篇 Markdown 笔记")}async setBannerForFile(e,a){try{let t=String(a||"").trim();if(!t)throw new Error("图片路径为空");let r=/^https?:\/\//i.test(t);return await this.app.fileManager.processFrontMatter(e,e=>{e.banner=r?t:`[[${t}]]`}),await this.processBanner(e),!0}catch(e){return console.error("Failed to set banner:",e),new Notice("设置封面失败，请查看控制台"),!1}}async removeBannerFromFile(e){try{await this.app.fileManager.processFrontMatter(e,e=>{delete e.banner});var t=this.app.workspace.getActiveViewOfType(MarkdownView);t?.file===e&&(this.removeBanner(t),this.ensureAddButton(t))}catch(e){console.error("Failed to remove banner:",e),new Notice("移除封面失败，请查看控制台")}}async importImage(e){var t=normalizePath((this.settings.attachmentFolder||"Extras/头图").trim());if(!t||"/"===t)throw new Error("图片保存目录无效");await this.ensureFolder(t);var r=e.name||`banner-${Date.now()}.png`,a=r.lastIndexOf("."),n=this.sanitizeFileName(0<a?r.slice(0,a):r),i=0<a?r.slice(a+1).toLowerCase():"png";let o=normalizePath(t+`/${n||"banner"}.`+i),s=2;for(;this.app.vault.getAbstractFileByPath(o);)o=normalizePath(`${t}/${n||"banner"}-${s}.`+i),s+=1;return await this.app.vault.createBinary(o,await e.arrayBuffer()),o}sanitizeFileName(e){return e.replace(/[\\/:*?"<>|#\[\]]/g,"-").replace(/\s+/g," ").trim()}async ensureFolder(e){var t;let r="";for(t of e.split("/").filter(Boolean)){r=r?r+"/"+t:t;var a=this.app.vault.getAbstractFileByPath(r);if(a){if(!(a instanceof TFolder))throw new Error("无法创建目录，同名文件已存在: "+r)}else await this.app.vault.createFolder(r)}}async handleFileOpen(e){e instanceof TFile&&"md"===e.extension&&await this.processBanner(e)}async handleFileModify(e){clearTimeout(this.modifyTimeout),this.modifyTimeout=setTimeout(()=>{this.processBanner(e)},200)}async updateActiveBanner(){var e=this.app.workspace.getActiveViewOfType(MarkdownView);e&&e.file&&await this.processBanner(e.file)}async processBanner(e){var t,r,a=this.app.workspace.getActiveViewOfType(MarkdownView);if(a&&a.file===e)t=await this.app.vault.read(e),(t=this.extractBannerFromYAML(t))?await this.displayBanner(t,a):(this.removeBanner(a),this.ensureAddButton(a));else for(r of this.app.workspace.getLeavesOfType("markdown")){var n=r.view;if(n instanceof MarkdownView&&n.file===e){var i=await this.app.vault.read(e),i=this.extractBannerFromYAML(i);i?await this.displayBanner(i,n):(this.removeBanner(n),this.ensureAddButton(n));break}}}extractBannerFromYAML(e){e=e.match(/^---\s*\n([\s\S]*?)\n---/);if(!e)return null;var t,r,e=e[1].match(/^\s*banner\s*:\s*(.+)$/im);if(!e)return null;let a=e[1].trim();return a.startsWith('"')&&a.endsWith('"')?(t=(e=a.slice(1,-1).trim()).match(/^\s*\[\[([^\]]+)\]\]\s*$/))?-1!==(r=(t=t[1].trim()).indexOf("|"))?t.slice(0,r).trim():t:e||null:!/\[\[[^\]]+\]\]/.test(a)&&(a=a.startsWith("'")&&a.endsWith("'")?a.slice(1,-1).trim():a)||null}detectViewMode(e){var e=e.contentEl,t=e.querySelector(".markdown-source-view.mod-cm6"),r=e.querySelector(".markdown-preview-view"),e=e.querySelector(".markdown-source-view");let a="unknown";return t&&r?a="live-preview":r&&!t?a="reading":e&&(a="source"),a}async displayBanner(t,r){var a=r.contentEl;if(a){a.querySelectorAll(".banner-image-add-row").forEach(e=>e.remove());var e,n=a.querySelectorAll(".cm-scroller, .markdown-reading-view > .markdown-preview-view");if(0===n.length){var i=a.querySelector(".markdown-source-view.mod-cm6"),o=a.querySelector(".markdown-preview-view"),s=a.querySelector(".markdown-source-view");let e=null;i=(e=i&&null!==i.offsetParent?i:o&&null!==o.offsetParent?o:s&&null!==s.offsetParent?s:a).querySelector('.banner-image-container[data-banner-plugin="true"]');return i?void((o=await this.getImageUrl(t))?(await this.loadImage(o,i),i.setAttribute("data-banner-path",t),this.ensureBannerToolbar(i,r)):i.remove()):void await this.createAndInsertBanner(t,e,r)}for(e of n)if(null!==e.offsetParent){var l,d=e.querySelector('.banner-image-container[data-banner-plugin="true"]');d?(l=await this.getImageUrl(t))?(await this.loadImage(l,d),d.setAttribute("data-banner-path",t),this.ensureBannerToolbar(d,r)):d.remove():await this.createAndInsertBanner(t,e,r);break}}}async createAndInsertBanner(e,t,r){var a=t.querySelector('.banner-image-container[data-banner-plugin="true"]');if(!a){var a=document.createElement("div"),n=(a.className="banner-image-container",a.setAttribute("data-banner-plugin","true"),a.style.position="relative",a.style.width="100%",a.style.height="var(--banner-height)",a.style.overflow="hidden",a.style.marginBottom="20px",document.createElement("img")),n=(n.className="banner-image",a.appendChild(n),document.createElement("div"));n.className="banner-gradient",a.appendChild(n),this.ensureBannerToolbar(a,r),t.prepend(a);try{var i=await this.getImageUrl(e);i?(await this.loadImage(i,a),a.setAttribute("data-banner-path",e)):a.remove()}catch(e){a.remove()}}}getVisibleContainer(e){var t,e=e?.contentEl;if(!e)return null;for(t of e.querySelectorAll(".cm-scroller, .markdown-reading-view > .markdown-preview-view"))if(null!==t.offsetParent)return t;return e.querySelector(".markdown-source-view.mod-cm6, .markdown-preview-view, .markdown-source-view")||e}ensureAddButton(e){var t,r,a;e?.file&&((t=e.contentEl).closest(".mod-left-split, .mod-right-split")?this.removeAddButtonFromView(t):t.querySelector('[data-banner-plugin="true"]')||((r=t.querySelector(":scope > .banner-image-add-row"))?this.updateAddButtonBounds(r,e):(t.classList.add("banner-image-add-host"),t.querySelectorAll(".banner-image-add-row").forEach(e=>e.remove()),(r=document.createElement("div")).className="banner-image-add-row",r.setAttribute("data-banner-control","true"),(a=document.createElement("button")).className="banner-image-add-button",a.type="button",a.setAttribute("aria-label","添加封面图片"),setIcon(a,"image-plus"),a.append(document.createTextNode("添加封面")),a.addEventListener("mousedown",e=>e.preventDefault()),a.addEventListener("click",()=>this.openImagePicker(e.file)),r.appendChild(a),t.appendChild(r),this.updateAddButtonBounds(r,e),this.bindAddButtonHoverArea(t)),this.observeAddButtonBounds(t,e)))}removeAddButtonFromView(e){e.querySelectorAll(".banner-image-add-row").forEach(e=>e.remove()),e.classList.remove("banner-image-add-host");var t=this.addButtonResizeObservers.get(e);t&&(t.observer.disconnect(),this.addButtonResizeObservers.delete(e))}getAddButtonEditor(e){return e?.contentEl&&(e=e.contentEl.querySelectorAll(".markdown-source-view.mod-cm6 .cm-contentContainer, .markdown-preview-view .markdown-preview-sizer"),Array.from(e).find(e=>null!==e.offsetParent&&0<e.getBoundingClientRect().width))||null}updateAddButtonBounds(r,a){window.requestAnimationFrame(()=>{var e,t;r.isConnected&&a?.contentEl&&(e=a.contentEl.getBoundingClientRect(),t=this.getAddButtonEditor(a))&&(t=t.getBoundingClientRect(),r.style.left=Math.max(0,t.left-e.left)+"px",r.style.right=Math.max(0,e.right-t.right)+"px")})}observeAddButtonBounds(t,r){var e,a;"undefined"!=typeof ResizeObserver&&(e=this.getAddButtonEditor(r),(a=this.addButtonResizeObservers.get(t))?.editor!==e)&&(a?.observer.disconnect(),(a=new ResizeObserver(()=>{var e=t.querySelector(":scope > .banner-image-add-row");e&&this.updateAddButtonBounds(e,r)})).observe(t),e&&a.observe(e),this.addButtonResizeObservers.set(t,{observer:a,editor:e}))}bindAddButtonHoverArea(a){this.boundAddButtonAreas.has(a)||(this.boundAddButtonAreas.add(a),this.registerDomEvent(a,"mousemove",e=>{var t,r=a.querySelector(":scope > .banner-image-add-row");r&&(t=a.getBoundingClientRect(),e=e.clientY>=t.top&&e.clientY<=t.top+48,r.classList.toggle("is-visible",e))}),this.registerDomEvent(a,"mouseleave",()=>{a.querySelector(":scope > .banner-image-add-row")?.classList.remove("is-visible")}))}ensureBannerToolbar(e,r){if(!e.querySelector(".banner-image-toolbar")){let t=r?.file instanceof TFile?r.file:this.getActiveMarkdownFile();var a,n;t&&((r=document.createElement("div")).className="banner-image-toolbar",r.setAttribute("data-banner-control","true"),(a=this.createActionButton("image-plus","更换","更换封面图片")).addEventListener("click",e=>{e.stopPropagation(),this.openImagePicker(t)}),(n=this.createActionButton("trash-2","移除","移除封面图片")).addEventListener("click",e=>{e.stopPropagation(),this.removeBannerFromFile(t)}),r.append(a,n),e.appendChild(r))}}createActionButton(e,t,r){var a=document.createElement("button");return a.className="banner-image-action-button",a.type="button",a.setAttribute("aria-label",r),setIcon(a,e),a.append(document.createTextNode(t)),a}async getImageUrl(e){e=(e||"").trim();if(/^https?:\/\//i.test(e))return e;if(this.imageCache.has(e))return this.imageCache.get(e);try{var t,r,a,n=this.app.workspace.getActiveViewOfType(MarkdownView)?.file?.path||"",i=this.app.vault.getAbstractFileByPath(e)||this.app.metadataCache.getFirstLinkpathDest(e,n);if(i instanceof TFile)return t=await this.app.vault.readBinary(i),r=new Blob([t]),a=URL.createObjectURL(r),this.imageCache.set(e,a),a}catch(e){}return null}async loadImage(a,n){return new Promise((e,t)=>{let r=n.querySelector("img.banner-image");r?(r.onload=()=>{r.onload=null,r.onerror=null,e()},r.onerror=()=>{r.onload=null,r.onerror=null,t(new Error("图片加载失败"))},r.src=a):t(new Error("缺少图片元素"))})}removeBanner(e){e=e.contentEl.querySelectorAll('[data-banner-plugin="true"]');e&&0<e.length&&e.forEach(e=>e.remove())}removeBanners(){document.querySelectorAll('[data-banner-plugin="true"]').forEach(e=>e.remove()),document.querySelectorAll('[data-banner-control="true"]').forEach(e=>e.remove()),document.querySelectorAll(".banner-image-add-host").forEach(e=>e.classList.remove("banner-image-add-host")),this.imageCache.forEach(e=>{e.startsWith("blob:")&&URL.revokeObjectURL(e)})}}class BannerImagePickerModal extends Modal{constructor(e,t,r){super(e),this.plugin=t,this.noteFile=r,this.query="",this.imageFiles=[],this.renderLimit=60}onOpen(){this.modalEl.classList.add("banner-picker-modal"),this.contentEl.empty(),this.contentEl.createEl("h2",{text:"选择封面图片"});var e=this.contentEl.createDiv({cls:"banner-picker-tabs"});let r=e.createEl("button",{cls:"banner-picker-tab is-active",text:"本地图片",attr:{type:"button","aria-selected":"true"}}),a=e.createEl("button",{cls:"banner-picker-tab",text:"网络图片",attr:{type:"button","aria-selected":"false"}}),n=this.contentEl.createDiv({cls:"banner-picker-source-pane is-active"});e=n.createDiv({cls:"banner-picker-header"});let i=e.createEl("input",{cls:"banner-picker-search",type:"search",placeholder:"搜索 Vault 中的图片…"}),t=(i.addEventListener("input",()=>{this.query=i.value.trim().toLowerCase(),this.renderLimit=60,this.gridEl&&(this.gridEl.scrollTop=0),this.renderGrid()}),e.createEl("button",{text:"从电脑导入",cls:"mod-cta"})),o=document.createElement("input"),s=(o.type="file",o.accept="image/*",o.hidden=!0,o.addEventListener("change",()=>{var e=o.files?.[0];e&&this.handleImport(e,t)}),n.appendChild(o),t.addEventListener("click",()=>o.click()),this.countEl=n.createDiv({cls:"banner-picker-count"}),this.gridEl=n.createDiv({cls:"banner-picker-grid"}),this.contentEl.createDiv({cls:"banner-picker-source-pane"}));e=s.createDiv({cls:"banner-picker-url-row"});let l=e.createEl("input",{cls:"banner-picker-search banner-picker-url-input",type:"url",placeholder:"粘贴网络图片地址（https://…）"}),d=e.createEl("button",{text:"使用网络图片"}),c=()=>{this.handleRemoteImage(l,d)},h=(d.addEventListener("click",c),l.addEventListener("keydown",e=>{"Enter"===e.key&&(e.preventDefault(),c())}),e=>{let t="local"===e;r.classList.toggle("is-active",t),a.classList.toggle("is-active",!t),r.setAttribute("aria-selected",String(t)),a.setAttribute("aria-selected",String(!t)),n.classList.toggle("is-active",t),s.classList.toggle("is-active",!t),window.setTimeout(()=>(t?i:l).focus(),0)});r.addEventListener("click",()=>h("local")),a.addEventListener("click",()=>h("network")),this.gridEl.createDiv({cls:"banner-picker-empty",text:"正在读取图片…"}),this.gridEl.addEventListener("scroll",()=>{this.gridEl.scrollTop+this.gridEl.clientHeight>=this.gridEl.scrollHeight-160&&this.renderLimit<this.filteredCount&&(this.renderLimit+=60,this.renderGrid())}),this.imageFiles=this.plugin.getVaultImageFiles(),window.requestAnimationFrame(()=>{this.contentEl.isConnected&&this.renderGrid()}),window.setTimeout(()=>i.focus(),30)}renderGrid(){var e=this.gridEl.scrollTop,t=(this.gridEl.empty(),this.query?this.imageFiles.filter(e=>e.path.toLowerCase().includes(this.query)):this.imageFiles),a=(this.filteredCount=t.length,t.slice(0,this.renderLimit));if(this.countEl.setText(t.length>a.length?`找到 ${t.length} 张图片，已加载 ${a.length} 张`:`找到 ${t.length} 张图片`),0===a.length)this.gridEl.createDiv({cls:"banner-picker-empty",text:this.query?"没有匹配的图片":"Vault 中还没有图片，可以从电脑导入"});else{var n=document.createDocumentFragment();for(let r of a){let e=document.createElement("button"),t=(e.className="banner-picker-item",e.type="button",e.title=r.path,e.createEl("img",{cls:"banner-picker-thumbnail",attr:{src:this.app.vault.getResourcePath(r),loading:"lazy",decoding:"async",alt:r.basename}}));t.addEventListener("error",()=>t.classList.add("is-error")),e.createDiv({cls:"banner-picker-name",text:r.name}),e.addEventListener("click",async()=>{e.disabled=!0,await this.plugin.setBannerForFile(this.noteFile,r.path)?this.close():e.disabled=!1}),n.appendChild(e)}this.gridEl.appendChild(n),this.gridEl.scrollTop=e}}async handleImport(e,t){t.disabled=!0;var r=t.textContent;t.setText("正在导入…");try{var a=await this.plugin.importImage(e);if(!await this.plugin.setBannerForFile(this.noteFile,a))throw new Error("写入笔记属性失败");this.close()}catch(e){new Notice(e?.message||"导入图片失败"),t.disabled=!1,t.setText(r||"从电脑导入")}}async handleRemoteImage(t,e){var r=t.value.trim();let a;try{if("http:"!==(a=new URL(r)).protocol&&"https:"!==a.protocol)throw new Error}catch(e){return new Notice("请输入有效的 http 或 https 图片地址"),void t.focus()}e.disabled=!0,t.disabled=!0;var r=e.textContent,n=(e.setText("正在应用…"),await this.plugin.setBannerForFile(this.noteFile,a.href));n?this.close():(e.disabled=!1,t.disabled=!1,e.setText(r||"使用网络图片"),t.focus())}onClose(){this.contentEl.empty()}}class BannerImageSettingTab extends PluginSettingTab{constructor(e,t){super(e,t),this.plugin=t}display(){var e=this.containerEl;e.empty(),e.createEl("h2",{text:"Banner Image 插件设置"}),new Setting(e).setName("自定义高度输入").setDesc("直接输入具体像素值，例如 200").addText(e=>e.setPlaceholder("200").setValue(String(this.plugin.settings.bannerHeight)).onChange(async e=>{e=parseInt(e,10);!isNaN(e)&&0<e&&(this.plugin.settings.bannerHeight=e,await this.plugin.saveSettings(),this.plugin.applyBannerHeight())})),new Setting(e).setName("图片填充方式").setDesc("选择图片适配方式：cover(保持宽高比，完全覆盖容器) 或 contain（保持宽高比，完整显示整个图片）").addDropdown(e=>e.addOption("cover","cover").addOption("contain","contain").setValue(this.plugin.settings.imageFit||"cover").onChange(async e=>{this.plugin.settings.imageFit=e,await this.plugin.saveSettings(),this.plugin.applyBannerFit()})),new Setting(e).setName("导入图片保存目录").setDesc("从电脑选择的封面图片将复制到此 Vault 目录").addText(e=>e.setPlaceholder("Extras/头图").setValue(this.plugin.settings.attachmentFolder||"Extras/头图").onChange(async e=>{e=normalizePath(e.trim());e&&"/"!==e&&(this.plugin.settings.attachmentFolder=e,await this.plugin.saveSettings())})),new Setting(e).setName("图片搜索路径范围").setDesc("留空时搜索整个 Vault；设置后仅显示指定目录及其子目录中的图片。多个目录可换行或用逗号分隔").addTextArea(e=>{e.setPlaceholder("Extras/头图\nAttachments/Images").setValue(this.plugin.settings.imageSearchPaths||"").onChange(async e=>{this.plugin.settings.imageSearchPaths=e,await this.plugin.saveSettings(),window.clearTimeout(this.plugin.imagePathSettingTimer),this.plugin.imagePathSettingTimer=window.setTimeout(()=>this.plugin.refreshImageIndex(),150)}),e.inputEl.rows=3}),e.createEl("a",{text:"作者：鱼先生",href:"https://www.xiaohongshu.com/user/profile/63cfeb720000000026010489"}).target="_blank"}}module.exports=BannerImagePlugin;