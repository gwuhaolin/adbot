const run = require('./run');

(async () => {
    while (true) {
        await run();
    }
})();