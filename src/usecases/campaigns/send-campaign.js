function makeSendCampaign({_, Joi, moment, config, campaignSenderQueue, ValidationError, campaignsDb}) {
    return async function sendCampaign({linkname, userId, campaignId, campaignObj}) {
        validateInput({linkname, userId, campaignId, campaignObj});
        let status = 'scheduled';
        let scheduled = true;
        if(!campaignObj.scheduledAt) {
            campaignObj.scheduledAt = moment();
            status = 'running';
            scheduled = false;
        } else {
            campaignObj.scheduledAt = moment.tz(campaignObj.scheduledAt, campaignObj.timezone);
        }

        //  convert timezone into UTC
        const utcTime = campaignObj.scheduledAt.utc().format();

        // update campaign details also mark it as running/scheduled
        await campaignsDb.updateCampaignById({id: campaignId, valuesToUpdate: {
                "timezone": campaignObj.timezone,
                "scheduled_at": utcTime,
                "max_retries": campaignObj.maxRetries,
                "send_strategy": campaignObj.sendStrategy,
                "batch_size": campaignObj.batchSize || 10,
                "batch_interval_s": campaignObj.batchInterval || 60,
                status,
                "updated_at": moment().utc().format(),
            }});

        //  if scheduledAT = null, then enqueue onto send campaign job
        if (!scheduled) {
            // enqueue onto sending campaign

            return await campaignSenderQueue.add(config.redisQueues.sendCampaign.topic, {linkname, userId, campaignId}, {
                attempts: 3,
                backoff: 10000, // retry after 10s
                removeOnComplete: true
            });
        }
    };

    function validateInput({linkname, userId, campaignId, campaignObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            campaignId: Joi.string().guid().required(),
            campaignObj: Joi.object({
                scheduledAt: Joi.optional(),
                timezone: Joi.string().required(),
                maxRetries: Joi.number().required(),
                sendStrategy: Joi.string().trim().required(),
                batchSize: Joi.when('sendStrategy', {
                    is: 'batch',
                    then: Joi.number().required(),
                    otherwise: Joi.optional()
                }),
                batchInterval: Joi.when('sendStrategy', {
                    is: 'batch',
                    then: Joi.number().required(),
                    otherwise: Joi.optional()
                }),
            }),
        });
        const {value, error} = schema.validate({linkname, userId, campaignId, campaignObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeSendCampaign;
