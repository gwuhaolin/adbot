new Promise(async (resolve) => {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    function rand(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    await sleep(rand(1000, 5000));
    window.scrollTo(0, document.body.scrollHeight);
    await sleep(rand(1000, 5000));
    window.scrollTo(0, 0);
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
                        window.location.href = url;
                        resolve();
                    }
                }
            }
        }
    }, 100)
});
