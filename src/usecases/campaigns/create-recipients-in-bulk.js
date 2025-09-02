function makeCreateRecipientsInBulk({_, Joi, ValidationError, campaignRecipientsDb}) {
    return async function createRecipientsInBulk({linkname, userId, campaignId, recipients}) {
        validateInput({linkname, userId, campaignId, recipients});
        if(!recipients || !recipients.length){
            console.error("No recipients found!");
            return false;
        }

        _.forEach(recipients, async (recipient) => {
            recipient['variables'] = recipient.additionalInfo;
            recipient.campaignId = campaignId;
            recipient.linkname = linkname;
        })

        return await campaignRecipientsDb.createCampaignRecipientsInBulk(recipients);
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

module.exports = makeCreateRecipientsInBulk;
