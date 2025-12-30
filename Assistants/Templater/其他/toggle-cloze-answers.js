module.exports = async function toggleClozeAnswers(params) {
    try {
        // 获取 body 元素
        const body = document.body;
        
        // 切换 show-all-answers 类
        const hasClass = body.classList.contains('show-all-answers');
        
        if (hasClass) {
            body.classList.remove('show-all-answers');
            new Notice('答案已关闭');
        } else {
            body.classList.add('show-all-answers');
            new Notice('答案已显示');
        }
        
    } catch (error) {
        console.error('Error toggling cloze answers:', error);
        new Notice('Error toggling cloze answers');
    }
}