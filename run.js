require('events').EventEmitter.prototype._maxListeners = 10000;
const fs = require('fs');
const path = require('path');
const ChromePool = require('chrome-pool');
const axios = require('axios');
const sites = require('./site');
const adConfig = require('./adConfig');

function extractAdUrlTemplate(iframeSelector, prefixList) {
    return `
new Promise(async (resolve) => {
    /**
     * 递归造成iframe中的所有A标签
     * @param iframe doc元素
     * @param prefixList 符合条件的URL的前缀
     * @returns {*} A标签数组
     */
    function allLinkInFrame(iframe, prefixList) {
        if (Array.isArray(iframe)) {
            return [].concat.apply([], iframe.map(em => allLinkInFrame(em, prefixList)));
        } else if (iframe) {
            const innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
            const urlList = Array.from(innerDoc.querySelectorAll('a')).map(a => a.getAttribute('href')).filter(url => {
                return prefixList.some(prefix => url && url.startsWith(prefix));
            });
            const iframeList = innerDoc.querySelectorAll('iframe');
            const innerUrlList = [];
            iframeList.forEach((iframe) => {
                innerUrlList.push(...allLinkInFrame(iframe, prefixList));
            });
            return [...urlList, ...innerUrlList];
        } else {
            return [];
        }
    }

    // 提取广告地址
    const timer = setInterval(async () => {
        try {
            const iframe = document.querySelectorAll(${JSON.stringify(iframeSelector)});
            const urlList = allLinkInFrame(Array.from(iframe), ${JSON.stringify(prefixList)});
            if (urlList.length) {
                clearInterval(timer);
                resolve(JSON.stringify(urlList));
            }
        } catch (e) {
        }
    }, 10)
});`
}

const playAdJS = fs.readFileSync(path.resolve(__dirname, 'browser', 'play.js'), {
    encoding: 'utf8'
});

let chromePoll;

function rand(min, max) {
    return Math.floor(Math.random() * max) + min;
}

async function getProxy() {
    const res = await axios.get('http://pubproxy.com/api/proxy?google=true&last_check=10&type=http&format=txt');
    const ipPort = res.data;
    return `http://${ipPort}`;
}

/**
 * 访问广告
 * @param ref
 * @param adUrl
 */
async function visitAd(ref, adUrl) {
    if (Array.isArray(adUrl)) {
        return Promise.all(adUrl.map((url) => visitAd(ref, url)));
    } else if (typeof adUrl === "string") {
        if (adUrl.startsWith('//')) {
            adUrl = 'http:' + adUrl;
        }
        return new Promise(async (resolve, reject) => {
            // 打开一个tab
            const {protocol} = await chromePoll.require();
            const {Page, Runtime} = protocol;
            await Page.navigate({
                url: adUrl,
                referrer: ref,
            });
            console.log(`执行点击广告 ${adUrl}`);
            let hasDone = false;
            Page.domContentEventFired(async () => {
                if (hasDone) {
                    return;
                }
                console.log(`广告页 ${adUrl} 加载完毕`);
                try {
                    const res = await Runtime.evaluate({
                        awaitPromise: true,
                        returnByValue: true,
                        expression: playAdJS,
                    });
                    const nextUrl = res.result.value;
                    if (nextUrl) {
                        return await visitAd(ref, nextUrl);
                    } else {
                        resolve();
                    }
                } catch (e) {
                    reject(e);
                } finally {
                    hasDone = true;
                }
            });
        });
    }
}

/**
 * 获取广告地址
 * @param url
 * @param proxy
 * @returns {Promise<void>}
 */
async function getAd(url, proxy) {
    await new Promise(async (resolve, reject) => {
        try {
            // 最长执行时间
            setTimeout(() => {
                reject('TIMEOUT 200S内没执行完');
            }, 200 * 1000);

            chromePoll = await ChromePool.new({
                protocols: ['Page', 'Runtime', 'Target', 'Network'],
                chromeRunnerOptions: {
                    chromeFlags: [
                        '--disable-popup-blocking',// 可以弹窗
                        '--disable-web-security', // 禁止安全检查
                        proxy ? `--proxy-server=${proxy}` : '',
                    ]
                }
            });
            const {protocol} = await chromePoll.require();
            const {Page, Runtime, Network} = protocol;
            // 模拟移动端
            await Network.setUserAgentOverride({
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A356 Safari/604.1'
            });
            // 导航到广告承载页
            await Page.navigate({
                url,
            });
            // 刷新广告承载页
            await new Promise((resolve) => {
                let refreshCount = 0;
                Page.domContentEventFired(async () => {
                    console.log(`广告承载页 ${url} 加载完毕`);
                    refreshCount++;
                    // 点击率 1% 为正常
                    if (refreshCount < 2) {
                        setTimeout(async () => {
                            await Page.navigate({
                                url,
                            });
                        }, 100);
                    } else {
                        console.log(`广告承载页 ${url} 刷新完毕`);
                        resolve();
                    }
                });
            });
            // 提取广告链接
            await Promise.all(
                Object.keys(adConfig).map((key) => {
                    return new Promise(async (resolve) => {
                        const {iframeSelector, prefixList, urlReduce} = adConfig[key];
                        const res = await Runtime.evaluate({
                            awaitPromise: true,
                            returnByValue: true,
                            expression: extractAdUrlTemplate(iframeSelector, prefixList)
                        });
                        let adUrlList = JSON.parse(res.result.value);
                        if (urlReduce) {
                            adUrlList = adUrlList.map(urlReduce);
                        }
                        console.log(`成功获取到 ${key} 的广告地址 ${adUrlList}`);
                        // 访问广告
                        await visitAd(url, adUrlList);
                        resolve();
                    });
                }));
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = async function () {
    const url = sites[rand(0, sites.length)];
    console.log('访问广告承载网址', url);
    try {
        await getAd(url);
    } catch (e) {
        console.error(e);
    } finally {
        await chromePoll.destroyPoll();
    }
};