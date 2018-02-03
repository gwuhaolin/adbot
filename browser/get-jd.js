new Promise(async (resolve) => {
    // 提取京东广告地址
    const timer = setInterval(async () => {
        try {
            const iframe = document.querySelector('iframe[src^="//u-x.jd.com/"]');
            let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
            const ad = innerDoc.querySelector('a[href^="//union-click.jd.com/jdc?"]');
            const url = ad.getAttribute('href');
            if (url) {
                clearInterval(timer);
                resolve(JSON.stringify(url));
            }
        } catch (e) {
            console.error(e);
        }
    }, 100)
});
