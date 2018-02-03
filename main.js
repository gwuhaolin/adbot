const fs = require('fs');
const path = require('path');
const ChromePool = require('chrome-pool');
const axios = require('axios');
const sites = require('./site');

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
            Page.domContentEventFired(async () => {
                console.log(`广告页 ${adUrl} 加载完毕`);
                resolve();
                try {
                    await Runtime.evaluate({
                        awaitPromise: true,
                        returnByValue: true,
                        expression: fs.readFileSync(path.resolve(__dirname, 'browser', 'play.js'), {
                            encoding: 'utf8'
                        })
                    });
                } catch (e) {
                    console.error(e);
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
            protocols: ['Page', 'Runtime', 'Log', 'Target'],
            chromeRunnerOptions: {
                chromeFlags: [
                    '--disable-web-security',
                    proxy ? `--proxy-server=${proxy}` : '',
                ]
            }
        });
        const {protocol} = await chromePoll.require();
        const {Page, Runtime, Log} = protocol;
        await Page.navigate({
            url,
        });
        Page.domContentEventFired(async () => {
            console.log(`广告承载页 ${url} 加载完毕`);
        });
        // 输出浏览器日志
        Log.entryAdded((entry) => {
            console.log(JSON.stringify(entry));
        });
        await Promise.all([
            new Promise(async (resolve) => {
                const res = await Runtime.evaluate({
                    awaitPromise: true,
                    returnByValue: true,
                    expression: fs.readFileSync(path.resolve(__dirname, 'browser', 'get-google.js'), {
                        encoding: 'utf8'
                    })
                });
                const adUrl = JSON.parse(res.result.value);
                console.log(`成功获取到 ${'google'} 的广告地址 ${adUrl}`);
                await visitAd(url, adUrl);
                resolve();
            }),
            new Promise(async (resolve) => {
                const res = await Runtime.evaluate({
                    awaitPromise: true,
                    returnByValue: true,
                    expression: fs.readFileSync(path.resolve(__dirname, 'browser', 'get-jd.js'), {
                        encoding: 'utf8'
                    })
                });
                const adUrl = JSON.parse(res.result.value);
                console.log(`成功获取到 ${'jd'} 的广告地址 ${adUrl}`);
                await visitAd(url, adUrl);
                resolve();
            })
        ]);
        resolve();
    });
}


(async () => {
    try {
        // const p = await getProxy();
        // console.log('获取代理', p);
        const url = sites[rand(0, sites.length)];
        console.log('访问广告承载网址', url);
        await getAd(url);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();
