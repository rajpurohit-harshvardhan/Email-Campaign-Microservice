// infra/queues.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../config/environments');

function attachRedisLogging(redis, label) {
    redis.on('connect', () => console.log(`[Redis] ${label}: TCP connected`));
    redis.on('ready', () => console.log(`[Redis] ${label}: READY`));
    redis.on('error', (err) => console.error(`[Redis] ${label}: ERROR`, err));
    redis.on('reconnecting', (time) => console.warn(`[Redis] ${label}: reconnecting in ${time}ms`));
    redis.on('end', () => console.warn(`[Redis] ${label}: connection closed`));
}

// Shared connection options for BullMQ
const connection = {
    host: config.redis.host,
    port: config.redis.port,
    // password: config.redis.password,
};

// Optional: one general-purpose ioredis client for app diagnostics
const redis = new IORedis({
    host: connection.host,
    port: connection.port,
    // password: config.redis.password,
    maxRetriesPerRequest: 3,
});
attachRedisLogging(redis, `Core (${connection.host}:${connection.port})`);
redis.ping().then(pong => console.log(`[Redis] Core: PING -> ${pong}`))
    .catch(err => console.error('[Redis] Core: PING failed', err));

// Queues (singletons thanks to Node's module cache)
const emailQueue = new Queue(config.redisQueues.sendEmail.topic, { connection });
const campaignSenderQueue = new Queue(config.redisQueues.sendCampaign.topic, { connection });
const campaignEmailSentQueue = new Queue(config.redisQueues.campaignEmailSent.topic, { connection });

module.exports = {
    connection,
    redis,
    emailQueue,
    campaignSenderQueue,
    campaignEmailSentQueue,
};
