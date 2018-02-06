const run = require('./run');

(async () => {
    try {
        await run();
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();
