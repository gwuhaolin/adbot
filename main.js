const fs = require('fs');
const path = require('path');
const ChromePool = require('chrome-pool');
const axios = require('axios');
const sites = require('./site');

function rand(min, max) {
    return Math.floor(Math.random() * max) + min;
}

async function getProxy() {
    const res = await axios.get('http://pubproxy.com/api/proxy?google=true&last_check=60&type=socks5&format=txt');
    const ipPort = res.data;
    return `socks5://${ipPort}`;
}

async function clickAd(url, proxy) {
    let chromePoll;
    try {
        await new Promise(async (resolve, reject) => {
            // 最长执行时间
            setTimeout(() => {
                reject('TIMEOUT', '100S内没执行完');
            }, 100000);

            chromePoll = await ChromePool.new({
                protocols: ['Page', 'Runtime', 'Log'],
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
            // 输出浏览器日志
            Log.entryAdded((entry) => {
                console.log(JSON.stringify(entry));
            });
            await Runtime.evaluate({
                awaitPromise: true,
                returnByValue: true,
                expression: fs.readFileSync(path.resolve(__dirname, 'browser', 'click-ad.js'), {
                    encoding: 'utf8'
                })
            });
            Page.domContentEventFired(async () => {
                await Runtime.evaluate({
                    awaitPromise: true,
                    returnByValue: true,
                    expression: fs.readFileSync(path.resolve(__dirname, 'browser', 'click-link.js'), {
                        encoding: 'utf8'
                    })
                });
                resolve();
            });
        });
    } finally {
        if (chromePoll) {
            await chromePoll.destroyPoll();
        }
    }
}

(async () => {
    // const p = await getProxy();
    // console.log('获取代理', p);
    const url = sites[rand(0, sites.length)];
    console.log('访问广告承载网址', url);
    await clickAd(url, /*p*/);
    console.log('done');
})();
