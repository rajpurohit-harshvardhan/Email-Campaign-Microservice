function makeSendCampaignController({Joi, formatResponse, formatError, ValidationError, sendCampaign}) {
    return async function sendCampaignController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            campaignId: httpRequest.params.id,
            campaignObj: httpRequest.body,
        });

        try {
            const result = await sendCampaign({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                campaignId: httpRequest.params.id,
                campaignObj: httpRequest.body,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action sendCampaignController', e);
            return formatError({error: e});
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

module.exports = makeSendCampaignController;
