new Promise(async (resolve) => {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    function rand(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    await sleep(rand(1000, 5000));
    window.scrollTo(0, document.body.scrollHeight);
    console.log('滚动到底部');
    await sleep(rand(1000, 5000));
    window.scrollTo(0, 0);
    console.log('滚动到顶部');
    await sleep(rand(1000, 5000));
    const as = document.querySelectorAll('a') || [];
    as.forEach((a) => {
        const url = a.getAttribute('href');
        // 只点击本域名下的链接
        if (!/^(.*\/\/|mailto:).+$/.test(url)) {
            // 随机触发点击
            if (Math.random() > 0.5) {
                console.log('点击站内链接', url);
                a.click();
            }
        }
    });
    await sleep(rand(1000, 5000));
    resolve();
});
