// base-cron.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class BaseCron {
    constructor({ serviceName }) {
        this.logger = console;
        this.serviceName = serviceName;

        // // Setup Redis connection for BullMQ
        // this.connection = new IORedis({
        //     host: process.env.REDIS_HOST || '127.0.0.1',
        //     port: process.env.REDIS_PORT || 6379,
        //     // password: process.env.REDIS_PASSWORD,
        //     maxRetriesPerRequest: 3,
        // });
        //
        // // One general queue by default
        // this.queue = new Queue('default', {
        //     connection: this.connection,
        // });

        process.on('SIGINT', this.handleSignal({ logger: this.logger }));
        process.on('uncaughtException', this.handleSignal({ logger: this.logger }));
    }

    handleSignal({ logger }) {
        return async (err) => {
            if (err) {
                logger.error(
                    `Got uncaught exception while processing cron ${this.serviceName}`,
                    err
                );
                await sleep(2000);
                process.exit(1);
            } else {
                logger.warn(
                    `Got signal to exit while processing cron ${this.serviceName}`
                );
                process.exit(0);
            }
        };
    }

    async start() {
        try {
            await this.performJob({ logger: this.logger });
            await sleep(2000);
            process.exit(0);
        } catch (e) {
            this.logger.error(
                `Got error while processing cron ${this.serviceName}`,
                e
            );
            process.exit(1);
        }
    }

    async performJob({ logger }) {
        logger.error('Please override performJob in your subclass');
        throw new Error('performJob not implemented');
    }
}

module.exports = BaseCron;
