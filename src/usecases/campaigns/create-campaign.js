function makeCreateCampaign({Joi, ValidationError, campaignsDb}) {
    return async function createCampaign({linkname, userId, campaignObj}) {
        validateInput({linkname, userId, campaignObj});

        return await campaignsDb.createCampaign({linkname, userId, ...campaignObj});
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

module.exports = makeCreateCampaign;
