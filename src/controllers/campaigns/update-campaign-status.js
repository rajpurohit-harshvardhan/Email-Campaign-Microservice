function makeUpdateCampaignStatusController({Joi, formatResponse, formatError, ValidationError, updateCampaignStatus}) {
    return async function updateCampaignStatusController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            campaignId: httpRequest.params.id,
            status: httpRequest.params.status,
        });

        try {
            const result = await updateCampaignStatus({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                campaignId: httpRequest.params.id,
                status: httpRequest.params.status,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action updateCampaignStatusController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, campaignId, status}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            campaignId: Joi.string().guid().required(),
            status: Joi.string().trim().valid('resume', 'pause', 'cancel').required(),
        });
        const {value, error} = schema.validate({linkname, userId, campaignId, status});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeUpdateCampaignStatusController;
