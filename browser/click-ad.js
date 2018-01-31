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
    const timer = setInterval(async () => {
        const iframe = document.querySelector('#aswift_0_anchor iframe');
        if (iframe) {
            let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
            const innerIframe = innerDoc.getElementById('google_ads_frame1');
            if (innerIframe) {
                innerDoc = (innerIframe.contentDocument) ? innerIframe.contentDocument : innerIframe.contentWindow.document;
                const ad = innerDoc.getElementById('aw0');
                if (ad) {
                    const url = ad.getAttribute('data-original-click-url');
                    console.log(url);
                    if (url) {
                        clearInterval(timer);
                        await sleep(rand(1000, 5000));
                        console.log('点击广告', url);
                        window.location.href = url;
                        resolve();
                    }
                }
            }
        }
    }, 100)
});
