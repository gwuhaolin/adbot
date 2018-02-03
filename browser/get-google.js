new Promise(async (resolve) => {
    // 提取google广告地址
    const timer = setInterval(async () => {
        try {
            const iframe = document.querySelector('#aswift_0_anchor iframe');
            let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
            const innerIframe = innerDoc.getElementById('google_ads_frame1');
            innerDoc = (innerIframe.contentDocument) ? innerIframe.contentDocument : innerIframe.contentWindow.document;
            const ad = innerDoc.getElementById('aw0');
            const url = ad.getAttribute('data-original-click-url');
            if (url) {
                clearInterval(timer);
                resolve(JSON.stringify(url));
            }
        } catch (e) {
        }
    }, 100)
});
