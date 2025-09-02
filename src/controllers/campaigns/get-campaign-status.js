function makeGetCampaignStatusController({Joi, formatResponse, formatError, ValidationError, getCampaignStatus}) {
    return async function getCampaignStatusController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            campaignId: httpRequest.params.id,
        });

        try {
            const result = await getCampaignStatus({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                campaignId: httpRequest.params.id,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action getCampaignStatusController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, campaignId}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            campaignId: Joi.string().guid().required(),
        });
        const {value, error} = schema.validate({linkname, userId, campaignId});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeGetCampaignStatusController;
