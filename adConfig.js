module.exports = {
    google: {
        iframeSelector: `#aswift_0_anchor iframe`,
        prefixList: [
            `https://www.googleadservices.com/pagead/aclk?`,
            `https://adclick.g.doubleclick.net/pcs/click?`,
            `https://googleads.g.doubleclick.net/aclk?`,
            `/aclk?`
        ],
        urlReduce: (url) => {
            if (url.startsWith('/aclk?')) {
                return `https://googleads.g.doubleclick.net${url}`
            }
            return url;
        }
    },
    baidu: {
        iframeSelector: `iframe[id^='iframeu']`,
        prefixList: [
            `http://click.bes.baidu.com/adx.php?`,
            `http://m.baidu.com/mobads.php?`,
            `https://cpro.baidu.com/cpro/ui/uijs.php?`
        ]
    },
    jd: {
        iframeSelector: `iframe[src^='//u-x.jd.com/']`,
        prefixList: [
            `//union-click.jd.com/jdc?`
        ]
    },
    sougou: {
        iframeSelector: `iframe[src^='http://inte.sogou.com/']`,
        prefixList: [
            `https://www.googleadservices.com/pagead/aclk?`
        ]
    }
};