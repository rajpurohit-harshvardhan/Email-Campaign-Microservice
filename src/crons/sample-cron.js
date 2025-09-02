// sample-cron.js
const cron = require('node-cron');
const BaseCron = require('./base-cron');

const SERVICE_NAME = 'sample-cron-job';

class SampleCron extends BaseCron {
    constructor() {
        super({ serviceName: SERVICE_NAME });
    }

    async performJob({ logger }) {
        logger.info(`[${SERVICE_NAME}] Hello from cron job!`);

        // Example: enqueue a BullMQ job into Redis
    }
}

// Schedule cron job (e.g. every minute)
cron.schedule('* * * * *', async () => {
    const job = new SampleCron();
    await job.start();
});
