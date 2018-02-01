new Promise(async (resolve) => {
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
                        resolve(url);
                    }
                }
            }
        }
    }, 100)
});
