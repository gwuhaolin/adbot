new Promise(async (resolve) => {
    // 进入广告页乱点
    function rand(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    let as = Array.from(document.querySelectorAll('a') || []);
    as = as.filter(a => {
        const url = a.getAttribute('href');
        // 只点击本域名下的链接
        return url && !/^(.*\/\/|#.*|mailto:|javascript:).+$/.test(url);
    });
    const len = Math.ceil(as.length / 3);
    const index = rand(len, as.length - len);
    // 随机触发点击
    as[index].click();
    resolve();
});
