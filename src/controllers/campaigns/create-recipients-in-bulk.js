function makeCreateRecipientsInBulkController({Joi, formatResponse, formatError, ValidationError, createRecipientsInBulk}) {
    return async function createRecipientsInBulkController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            campaignId: httpRequest.params.id,
            recipients: httpRequest.body ? httpRequest.body.recipients : [],
        });

        try {
            const result = await createRecipientsInBulk({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                campaignId: httpRequest.params.id,
                recipients: httpRequest.body? httpRequest.body.recipients : [],
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action createRecipientsInBulkController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, campaignId, recipients}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            campaignId: Joi.string().guid().required(),
            recipients: Joi.array().items(Joi.object({
                name: Joi.string().trim().required(),
                emailAddress: Joi.string().email().required(),
                additionalInfo: Joi.object().unknown(true),
            }).unknown(true)),
        });
        const {value, error} = schema.validate({linkname, userId, campaignId, recipients});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeCreateRecipientsInBulkController;
