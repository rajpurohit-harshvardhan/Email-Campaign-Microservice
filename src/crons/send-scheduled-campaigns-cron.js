const _ = require('lodash');
const cron = require('node-cron');
const moment = require('moment-timezone');
const BaseCron = require('./base-cron');

const SERVICE_NAME = 'send-scheduled-campaigns-cron';

const dbs = require('../data-access');
const { campaignSenderQueue } = require('../jobs/initialize-queues');
const config = require("../config/environments");

class SendScheduledCampaignsCron extends BaseCron {
    constructor() {
        super({ serviceName: SERVICE_NAME });
    }

    async performJob({ logger }) {
        logger.info(`[${SERVICE_NAME}] :: Started at ${moment().utc().format()}`);

        const campaigns = await dbs.campaignsDb.getScheduledCampaigns({fieldsToQuery: ['id', 'linkname', 'user_id as "userId"']});
        _.forEach(campaigns, async campaign => {
            const {linkname, userId, id} = campaign;
            logger.info(`Publishing message for linkname: ${linkname}, userId: ${userId}, campaignId: ${id}`);
            await campaignSenderQueue.add(config.redisQueues.sendCampaign.topic, {
                linkname,
                userId,
                campaignId: id
            }, {
                attempts: 3,
                backoff: 10000,
                removeOnComplete: true,
            });

            await dbs.campaignsDb.updateCampaignById({id, valuesToUpdate: {
                    status: 'running',
                    "updated_at": moment().utc().format(),
                }});
        });

        logger.info(`[${SERVICE_NAME}] :: Completed at ${moment().utc().format()}`);
    }
}

// Schedule cron job (e.g. every minute)
cron.schedule('*/5 * * * *', async () => {
    const job = new SendScheduledCampaignsCron();
    await job.start();
});
