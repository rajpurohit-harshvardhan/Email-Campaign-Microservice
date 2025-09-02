const _ = require('lodash');
const config = require('../config/environments');
const moment = require('moment-timezone');

const { Worker } = require('bullmq');
const { attachWorkerLogging } = require('./job-logs');

const { emailQueue, campaignSenderQueue } = require('./initialize-queues');


const dbs = require('../data-access');
const {campaigns, emails} = require('../usecases');
// import { buildEmailFromTemplate } from '../utils/build-email-from-template.js';

function startSendCampaignWorker() {
    const connection = {
        host: config.redis.host,
        port: config.redis.port,
        // password: config.redis.password,
    };

    const worker = new Worker(
        config.redisQueues.sendCampaign.topic,
        processSendCampaignJob,
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

async function processSendCampaignJob(job) {
    const {linkname, userId, campaignId} = job.data;
    console.log(`Processing ${job.name} job for linkname: ${linkname}, userId: ${userId},
     campaignId: ${campaignId}`);

    const campaignObj = await dbs.campaignsDb.getCampaignById({
        id: campaignId,
        fieldsToQuery: [
            'id',
            'name',
            'from_email as "fromEmail"',
            'from_name as "fromName"',
            'subject',
            'status',
            'template_id as "templateId"',
            'send_strategy as "sendStrategy"',
            'batch_size as "batchSize"',
            'batch_interval_s as "BatchInterval"',
        ].join(','),
    });

    if (!campaignObj) {
        console.error(`Campaign not found with id ${campaignId}! Terminating job.`);
        return true;
    }

    if (campaignObj.status !== 'running') {
        console.error(`Invalid Campaign enqueued for processing! Terminating job.`);
        return true;
    }

    let limit = 10;
    if (campaignObj.sendStrategy === 'batch') {
        limit = campaignObj.batchSize;
    }

    const recipientsToEnroll = await dbs.campaignRecipientsDb.getRecipientsToEnroll({
        campaignId,
        limit,
    });

    if(!recipientsToEnroll.length){
        console.log(`No more recipients left! Enqueueing for finishing campaign`);
        return true;
    }

    // create entries in campaign_messages
    const messages = []
    _.forEach(recipientsToEnroll, (recipient) => {
        messages.push({
            linkname,
            campaignId,
            campaignRecipientId: recipient.id,
            status: 'queued',
        });
    });
   await dbs.campaignMessagesDb.createCampaignMessagesInBulk(messages);

    // fetch template and replace the variables in html
    const templateObj = await dbs.campaignTemplatesDb.getCampaignTemplatesById({
        id: campaignObj.templateId,
        fieldsToQuery: [
            'id',
            'name',
            'subject',
            'from_email as "fromEmail"',
            'from_name as "fromName"',
            'html_content as "html"',
            'text_content as "text"',
            'default_vars as "defaultVars"',
            'is_active as "isActive"',
        ],
    });

    if(!templateObj.isActive) {
        console.error("Can not use an inactive template!");
        return await dbs.campaignMessagesDb.updateCampaignMessageByCampaignId({campaignId, valuesToUpdate:{
            status: 'error',
            error: 'Inactive template',
            'updated_at': moment().utc().format(),
            }});
    }

    _.forEach(recipientsToEnroll, async (recipient) => {
        // prepare the email Obj
        const emailObj = emails.buildEmailFromTemplate({
            linkname, userId, campaign: campaignObj, template: templateObj, recipient,
        });

        // enqueue to send email
        await emailQueue.add(config.redisQueues.sendEmail.topic, {
                linkname,
                userId,
                emailObj,
                campaignObj: emailObj.metadata,
            },
            {
                attempts: 3,
                backoff: 10000, // retry after 10s
                removeOnComplete: true
            });
    });

    const recipientsCount = await dbs.campaignRecipientsDb.getRecipientsToEnrollCount({campaignId, limit});
    if (recipientsCount > 0) {
        await campaignSenderQueue.add(config.redisQueues.sendCampaign.topic, {linkname, userId, campaignId}, {
            attempts: 3,
            backoff: 10000, // retry after 10s
            removeOnComplete: true,
            delay: campaignObj.batchInterval * 1000,
        });
    } else {
        // Marking campaign's status as sent
        await dbs.campaignsDb.updateCampaignById({id: campaignId, valuesToUpdate: {
            status: 'sent',
            "updated_at": moment().utc().format(),
            }});
    }
}

const { close } = startSendCampaignWorker();

const stop = async () => {
    await close();
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
