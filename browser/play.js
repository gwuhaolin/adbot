new Promise(async (resolve) => {
    // 进入广告页乱点
    function rand(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    const host = location.host;
    if (host.indexOf('www.baidu.com') >= 0) {
        // 左侧第一个广告
        let a = document.querySelector(`td[align="left"] a[data-fm="pl"]`);
        if (a) {
            resolve(a.getAttribute('href'));
            return;
        }
        // 百度点击第一个链接，因为这是个广告
        a = document.querySelector(`#content_left h3[class^="t "] a`);
        resolve();
        a.click();
    } else if (host.indexOf('zhidao.baidu.com') >= 0) {
        // 百度知道中的第一个链接
        let hasRet = false;
        setInterval(() => {
            const a = document.querySelector('.ad-block a');
            if (!hasRet && a) {
                hasRet = true;
                resolve();
                a.click();
            }
        }, 10)
    } else {
        let aList = document.querySelectorAll('a');
        // 过滤掉不合法的链接
        aList = Array.from(aList).filter(a => {
            const url = a.getAttribute('href');
            if (!url) {
                return false;
            }
            if (/^(#.*|mailto:|javascript:).+$/.test(url)) {
                return false;
            }
            // 只点击本域名下的链接
            if (/^(.*\/\/).+$/.test(url) && url.indexOf(location.hostname) < 0) {
                return false;
            }
            return true;
        });

        // 默认随机点击中间的
        const len = Math.ceil(aList.length / 3);
        const targetIndex = rand(len, aList.length - len);

        // 随机触发点击
        aList[targetIndex].click();
        resolve();
    }
});
