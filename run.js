const fs = require('fs');
const path = require('path');
const ChromePool = require('chrome-pool');
const axios = require('axios');
const sites = require('./site');
const adConfig = require('./adConfig');
process.setMaxListeners(Infinity);

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
        if (iframe) {
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

    // 提取百度广告地址
    const timer = setInterval(async () => {
        try {
            const iframe = document.querySelector(${JSON.stringify(iframeSelector)});
            const urlList = allLinkInFrame(iframe, ${JSON.stringify(prefixList)});
            if (urlList.length) {
                clearInterval(timer);
                resolve(JSON.stringify(urlList));
            }
        } catch (e) {
        }
    }, 100)
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
                    await Runtime.evaluate({
                        awaitPromise: true,
                        returnByValue: true,
                        expression: playAdJS,
                    });
                    resolve();
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
        // 最长执行时间
        setTimeout(() => {
            reject('TIMEOUT 200S内没执行完');
        }, 200000);

        chromePoll = await ChromePool.new({
            protocols: ['Page', 'Runtime', 'Target'],
            chromeRunnerOptions: {
                chromeFlags: [
                    '--disable-popup-blocking',// 可以弹窗
                    '--disable-web-security', // 禁止安全检查
                    proxy ? `--proxy-server=${proxy}` : '',
                ]
            }
        });
        const {protocol} = await chromePoll.require();
        const {Page, Runtime} = protocol;
        await Page.navigate({
            url,
        });
        await new Promise((resolve) => {
            let hasRefesh = false;
            Page.domContentEventFired(async () => {
                console.log(`广告承载页 ${url} 加载完毕`);
                if (!hasRefesh) {
                    await Page.navigate({
                        url,
                    });
                }
                hasRefesh = true;
                console.log(`广告承载页 ${url} 刷新完毕`);
                resolve();
            });
        });
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
                    await visitAd(url, adUrlList);
                    resolve();
                });
            }));
        resolve();
    });
}

module.exports = async function () {
    const url = sites[rand(0, sites.length)];
    console.log('访问广告承载网址', url);
    await getAd(url);
};