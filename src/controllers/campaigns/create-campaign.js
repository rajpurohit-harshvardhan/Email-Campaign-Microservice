function makeCreateCampaignController({Joi, formatResponse, formatError, ValidationError, createCampaign}) {
    return async function createCampaignController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            campaignObj: httpRequest.body,
        });

        try {
            const result = await createCampaign({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                campaignObj: httpRequest.body,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action createCampaignController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, campaignObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            campaignObj: Joi.object({
                name: Joi.string().trim().required(),
                subject: Joi.string().trim(),
                fromEmail: Joi.string().email().required(),
                fromName: Joi.string().trim(),
                templateId: Joi.string().guid().required(),
            }),
        });
        const {value, error} = schema.validate({linkname, userId, campaignObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeCreateCampaignController;
