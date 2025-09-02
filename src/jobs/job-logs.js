// src/jobs/job-logging.js
const { QueueEvents } = require('bullmq');

/** Attach logs to any ioredis-like client */
function attachRedisLogging(redis, label) {
    if (!redis) return;
    redis.on('connect', () => console.log(`[Redis] ${label}: TCP connected`));
    redis.on('ready', () => console.log(`[Redis] ${label}: READY`));
    redis.on('reconnecting', (ms) => console.warn(`[Redis] ${label}: reconnecting in ${ms}ms`));
    redis.on('end', () => console.warn(`[Redis] ${label}: connection closed`));
    redis.on('error', (err) => console.error(`[Redis] ${label}: ERROR`, err));
}

/** Attach logs to a BullMQ Queue’s internal client */
function attachQueueLogging(queue, { host, port } = {}) {
    const label = `Queue "${queue.name}"${host ? ` (${host}:${port})` : ''}`;
    if (queue?.client) attachRedisLogging(queue.client, label);
    else console.warn(`[Redis] ${label}: no client found on queue instance`);
}

/**
 * Attach logs to a Worker and (optionally) a QueueEvents stream for that queue.
 * Returns { queueEvents } so the caller can close it on shutdown.
 */
function attachWorkerLogging(worker, {
    connection,      // { host, port, ... } passed to QueueEvents
    eventsPrefix,    // optional redis key prefix
    label,           // optional custom label
    withQueueEvents = true,
} = {}) {
    const qname = worker.name;
    const tag = label || `Worker("${qname}")`;

    // Worker lifecycle + job-level logs
    worker.on('ready', () => console.log(`[${tag}] ready`));
    worker.on('closed', () => console.warn(`[${tag}] closed`));
    worker.on('error', (err) => console.error(`[${tag}] ERROR`, err));
    worker.on('active', (job) => console.log(`[${tag}] job ${job.id} active`));
    worker.on('completed', (job, ret) => console.log(`[${tag}] job ${job.id} completed`, ret ?? ''));
    worker.on('failed', (job, err) => console.error(`[${tag}] job ${job?.id} failed`, err));
    worker.on('stalled', (jobId) => console.warn(`[${tag}] job ${jobId} stalled`));

    let queueEvents = null;
    if (withQueueEvents) {
        queueEvents = new QueueEvents(qname, { connection, prefix: eventsPrefix });
        queueEvents.on('added', ({ jobId }) => console.log(`[${tag}:events] job ${jobId} added`));
        queueEvents.on('waiting', ({ jobId }) => console.log(`[${tag}:events] job ${jobId} waiting`));
        queueEvents.on('delayed', ({ jobId, delay }) => console.log(`[${tag}:events] job ${jobId} delayed ${delay}ms`));
        queueEvents.on('progress', ({ jobId, data }) => console.log(`[${tag}:events] job ${jobId} progress`, data));
        queueEvents.on('drained', () => console.log(`[${tag}:events] drained`));
        queueEvents.on('paused', () => console.warn(`[${tag}:events] paused`));
        queueEvents.on('resumed', () => console.log(`[${tag}:events] resumed`));
        queueEvents.on('error', (err) => console.error(`[${tag}:events] ERROR`, err));
    }

    return { queueEvents };
}

module.exports = {
    attachRedisLogging,
    attachQueueLogging,
    attachWorkerLogging,
};
