<%*
(async function() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    await sleep(100);
    const activeLeaf = app.workspace.activeLeaf;
    if (activeLeaf) {
        activeLeaf.rebuildView();
        console.log('已刷新当前视图');
    } else {
        console.warn('未找到活动视图');
    }
})();
%>