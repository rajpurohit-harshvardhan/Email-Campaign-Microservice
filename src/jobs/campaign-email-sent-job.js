const _ = require('lodash');
const config = require('../config/environments');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

const { Worker } = require('bullmq');
const { attachWorkerLogging } = require('./job-logs');

const createTransporter = require('../utils/node-mailer-util');

const dbs = require('../data-access');
const {emails} = require('../usecases');

function startCampaignEmailSentWorker() {
    const connection = {
        host: config.redis.host,
        port: config.redis.port,
        // password: config.redis.password,
    };

    const worker = new Worker(
        config.redisQueues.campaignEmailSent.topic,
        processCampaignEmailSentJob,
        { connection }
    );

    // all logging for this worker (+ QueueEvents)
    const { queueEvents } = attachWorkerLogging(worker, { connection });

    // expose for graceful shutdown
    async function close() {
        try { await worker.close(); } catch {}
        try { await queueEvents?.close(); } catch {}
    }

    return { worker, queueEvents, close };
}

async function processCampaignEmailSentJob(job) {
    const {linkname, userId, emailObj, campaignObj} = job.data;
    console.log(`Processing ${job.name} job for linkname: ${linkname}, userId: ${userId},
     emailObj: ${JSON.stringify(emailObj)}, campaignObj: ${JSON.stringify(campaignObj)}`);

    const result = await dbs.campaignMessagesDb.updateCampaignMessageByCampaignIdAndCampaignRecipientId({
        campaignId: campaignObj.campaignId,
        campaignRecipientId: campaignObj.campaignRecipientId,
        valuesToUpdate: {
            'email_id': emailObj.id,
            'status': 'sent',
            'provider_message_id': emailObj.messageId,
            'sent_at': moment().utc().format(),
        },
    })


}

const { close } = startCampaignEmailSentWorker();

const stop = async () => {
    await close();
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
