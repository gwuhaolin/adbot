new Promise(async (resolve) => {
    // 提取搜狗广告地址
    const timer = setInterval(async () => {
        try {
            const iframe = document.querySelector('iframe[src^="http://inte.sogou.com/"]');
            const urlList = [];
            let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
            const adList = innerDoc.querySelectorAll('.ad_td');
            adList.forEach((td) => {
                const a = td.querySelector('a');
                const adUrl = a.getAttribute('href');
                console.log(adUrl);
                urlList.push(adUrl);
            });
            if (urlList.length) {
                clearInterval(timer);
                resolve(JSON.stringify(urlList));
            }
        } catch (e) {
            console.error(e);
        }
    }, 100)
});
