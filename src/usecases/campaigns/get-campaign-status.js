function makeGetCampaignStatus({Joi, ValidationError, campaignsDb}) {
    return async function getCampaignStatus({linkname, userId, campaignId}) {
        validateInput({linkname, userId, campaignId});

        return await campaignsDb.getCampaignStatus({id: campaignId});
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

module.exports = makeGetCampaignStatus;
