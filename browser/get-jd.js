new Promise(async (resolve) => {
    const timer = setInterval(async () => {
        // 隐藏JD广告
        const iframe = document.querySelector('iframe[src^="//u-x.jd.com/"]');
        if (iframe) {
            let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
            const ad = innerDoc.querySelector('a[href^="//union-click.jd.com/jdc?"]');
            const url = ad.getAttribute('href');
            console.log(url);
            if (url) {
                clearInterval(timer);
                resolve(url);
            }
        }
    }, 100)
});
