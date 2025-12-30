let{Plugin,MarkdownView,TFile,PluginSettingTab,Setting}=require("obsidian");class BannerImagePlugin extends Plugin{constructor(){super(...arguments),this.imageCache=new Map,this.loadedBanners=new Set}async onload(){console.log("Loading Banner Image Plugin"),await this.loadSettings(),this.addStyle(),this.applyBannerHeight(),this.applyBannerFit(),this.addSettingTab(new BannerImageSettingTab(this.app,this)),this.registerEvent(this.app.workspace.on("file-open",e=>{e&&this.handleFileOpen(e)})),this.registerEvent(this.app.workspace.on("active-leaf-change",()=>{setTimeout(()=>{this.updateActiveBanner()},50)})),this.registerEvent(this.app.vault.on("modify",e=>{e instanceof TFile&&"md"===e.extension&&this.handleFileModify(e)})),this.registerEvent(this.app.workspace.on("layout-change",()=>{setTimeout(()=>{this.updateActiveBanner()},100)})),this.registerEvent(this.app.workspace.on("editor-change",()=>{clearTimeout(this.editorChangeTimeout),this.editorChangeTimeout=setTimeout(()=>{this.updateActiveBanner()},500)})),this.registerEvent(this.app.workspace.on("view-mode-change",()=>{setTimeout(()=>{this.updateActiveBanner()},100)})),setTimeout(()=>{this.updateActiveBanner()},200)}onunload(){console.log("Unloading Banner Image Plugin"),this.removeBanners(),this.imageCache.clear(),this.loadedBanners.clear()}async loadSettings(){this.settings=Object.assign({bannerHeight:200,imageFit:"cover"},await this.loadData())}async saveSettings(){await this.saveData(this.settings)}applyBannerHeight(){try{var e=this.settings.bannerHeight+"px";document.documentElement.style.setProperty("--banner-height",e)}catch(e){console.warn("Failed to apply banner height:",e)}}applyBannerFit(){try{var e=this.settings.imageFit||"cover";document.documentElement.style.setProperty("--banner-object-fit",e)}catch(e){console.warn("Failed to apply banner fit:",e)}}addStyle(){var e=document.createElement("style");e.id="banner-image-plugin-style",e.textContent=`
            :root {
                --banner-gradient-top-alpha: 0;
                --banner-gradient-mid-alpha: 0.55;
                --banner-gradient-bottom-alpha: 1;
                --banner-gradient-height: 60%;
                --banner-height: ${this.settings.bannerHeight}px;
                --banner-object-fit: ${this.settings.imageFit};
            }

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
                pointer-events: none;
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
                bottom: 0;
                left: 0;
                right: 0;
                height: var(--banner-gradient-height, 60%);
                pointer-events: none;
                background-image: linear-gradient(
                    to bottom,
                    color-mix(in srgb, var(--background-primary) calc(var(--banner-gradient-top-alpha, 0) * 100%), transparent) 0%,
                    color-mix(in srgb, var(--background-primary) calc(var(--banner-gradient-mid-alpha, 0.75) * 100%), transparent) 75%,
                    color-mix(in srgb, var(--background-primary) calc(var(--banner-gradient-bottom-alpha, 0.85) * 100%), transparent) 100%
                );
            }
        `,document.head.appendChild(e)}async handleFileOpen(e){e instanceof TFile&&"md"===e.extension&&await this.processBanner(e)}async handleFileModify(e){clearTimeout(this.modifyTimeout),this.modifyTimeout=setTimeout(()=>{this.processBanner(e)},200)}async updateActiveBanner(){var e=this.app.workspace.getActiveViewOfType(MarkdownView);e&&e.file&&await this.processBanner(e.file)}async processBanner(e){var t,n,a=this.app.workspace.getActiveViewOfType(MarkdownView);if(a&&a.file===e)t=await this.app.vault.read(e),(t=this.extractBannerFromYAML(t))?await this.displayBanner(t,a):this.removeBanner(a);else for(n of this.app.workspace.getLeavesOfType("markdown")){var r=n.view;if(r instanceof MarkdownView&&r.file===e){var i=await this.app.vault.read(e),i=this.extractBannerFromYAML(i);i?await this.displayBanner(i,r):this.removeBanner(r);break}}}extractBannerFromYAML(e){e=e.match(/^---\s*\n([\s\S]*?)\n---/);if(!e)return null;var t,n,e=e[1].match(/^\s*banner\s*:\s*(.+)$/im);if(!e)return null;let a=e[1].trim();return a.startsWith('"')&&a.endsWith('"')?(t=(e=a.slice(1,-1).trim()).match(/^\s*\[\[([^\]]+)\]\]\s*$/))?-1!==(n=(t=t[1].trim()).indexOf("|"))?t.slice(0,n).trim():t:e||null:!/\[\[[^\]]+\]\]/.test(a)&&(a=a.startsWith("'")&&a.endsWith("'")?a.slice(1,-1).trim():a)||null}detectViewMode(e){var t=e.contentEl,n=t.querySelector(".markdown-source-view.mod-cm6"),a=t.querySelector(".markdown-preview-view"),t=t.querySelector(".markdown-source-view");let r="unknown";return n&&a?r="live-preview":a&&!n?r="reading":t&&(r="source"),console.log("Detected view mode:",r),console.log("View type:",e.getViewType()),console.log("View mode method:",e.getMode()),r}async displayBanner(t,n){console.log("Displaying banner:",t);n=n.contentEl;if(n){var e,a=n.querySelectorAll(".cm-scroller, .markdown-reading-view > .markdown-preview-view");if(0===a.length){console.log("No suitable containers found, falling back to contentEl");var r=n.querySelector(".markdown-source-view.mod-cm6"),i=n.querySelector(".markdown-preview-view"),o=n.querySelector(".markdown-source-view");let e=null;r=(e=r&&null!==r.offsetParent?r:i&&null!==i.offsetParent?i:o&&null!==o.offsetParent?o:n).querySelector('.banner-image-container[data-banner-plugin="true"]');return r?void((i=await this.getImageUrl(t))?(await this.loadImage(i,r),r.setAttribute("data-banner-path",t)):r.remove()):void await this.createAndInsertBanner(t,e)}for(e of a)if(null!==e.offsetParent){console.log("Creating banner for container:",e.className);var s,l=e.querySelector('.banner-image-container[data-banner-plugin="true"]');l?(s=await this.getImageUrl(t))?(await this.loadImage(s,l),l.setAttribute("data-banner-path",t)):l.remove():await this.createAndInsertBanner(t,e);break}}else console.log("No content element found")}async createAndInsertBanner(e,t){if(t.querySelector('.banner-image-container[data-banner-plugin="true"]'))console.log("Banner already exists in target container, skipping insertion");else{var n=document.createElement("div"),a=(n.className="banner-image-container",n.setAttribute("data-banner-plugin","true"),n.style.position="relative",n.style.width="100%",n.style.height="var(--banner-height)",n.style.overflow="hidden",n.style.marginBottom="20px",document.createElement("img")),a=(a.className="banner-image",n.appendChild(a),document.createElement("div"));a.className="banner-gradient",n.appendChild(a),t.prepend(n),console.log("Banner container inserted at top of container");try{var r=await this.getImageUrl(e);r?(await this.loadImage(r,n),n.setAttribute("data-banner-path",e)):(console.log("Failed to get image URL for:",e),n.remove())}catch(e){console.error("Error loading banner image:",e),n.remove()}}}async getImageUrl(e){e=(e||"").trim();if(/^https?:\/\//i.test(e))return e;if(this.imageCache.has(e))return this.imageCache.get(e);try{var t,n,a,r=this.app.workspace.getActiveViewOfType(MarkdownView)?.file?.path||"",i=this.app.vault.getAbstractFileByPath(e)||this.app.metadataCache.getFirstLinkpathDest(e,r);if(i instanceof TFile)return t=await this.app.vault.readBinary(i),n=new Blob([t]),a=URL.createObjectURL(n),this.imageCache.set(e,a),a}catch(e){console.error("Error loading image:",e)}return null}async loadImage(a,r){return new Promise((e,t)=>{let n=r.querySelector("img.banner-image");n?(n.onload=()=>{n.onload=null,n.onerror=null,e()},n.onerror=()=>{n.onload=null,n.onerror=null,t(new Error("图片加载失败"))},n.src=a):t(new Error("缺少图片元素"))})}removeBanner(e){e=e.contentEl.querySelectorAll('[data-banner-plugin="true"]');e&&0<e.length&&e.forEach(e=>e.remove())}removeBanners(){document.querySelectorAll('[data-banner-plugin="true"]').forEach(e=>e.remove()),this.imageCache.forEach(e=>{e.startsWith("blob:")&&URL.revokeObjectURL(e)})}}class BannerImageSettingTab extends PluginSettingTab{constructor(e,t){super(e,t),this.plugin=t}display(){var e=this.containerEl;e.empty(),e.createEl("h2",{text:"Banner Image 插件设置"}),new Setting(e).setName("自定义高度输入").setDesc("直接输入具体像素值，例如 200").addText(e=>e.setPlaceholder("200").setValue(String(this.plugin.settings.bannerHeight)).onChange(async e=>{e=parseInt(e,10);!isNaN(e)&&0<e&&(this.plugin.settings.bannerHeight=e,await this.plugin.saveSettings(),this.plugin.applyBannerHeight())})),new Setting(e).setName("图片填充方式").setDesc("选择图片适配方式：cover(保持宽高比，完全覆盖容器) 或 contain（保持宽高比，完整显示整个图片）").addDropdown(e=>e.addOption("cover","cover").addOption("contain","contain").setValue(this.plugin.settings.imageFit||"cover").onChange(async e=>{this.plugin.settings.imageFit=e,await this.plugin.saveSettings(),this.plugin.applyBannerFit()})),e.createEl("a",{text:"作者：鱼先生",href:"https://www.xiaohongshu.com/user/profile/63cfeb720000000026010489"}).target="_blank"}}module.exports=BannerImagePlugin;