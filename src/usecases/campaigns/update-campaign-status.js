function makeUpdateCampaignStatus({Joi, moment, ValidationError, campaignsDb}) {
    return async function updateCampaignStatus({linkname, userId, campaignId, status}) {
        validateInput({linkname, userId, campaignId, status});
        let statusToUpdate = "";
        const campaignObj = await campaignsDb.getCampaignById({id: campaignId, fieldsToQuery: ['id', 'status', 'scheduled_at as "scheduledAt"', 'timezone'].join(',')})

        if (!campaignObj) {
            throw new ValidationError('Campaign not found!');
        }

        if (campaignObj.status === 'cancelled' && (status === 'resume' || status === 'pause')) {
            throw new ValidationError(`Can not ${status} a cancelled campaign!`);
        }

        const scheduledTime = moment.tz(campaignObj.scheduledAt, campaignObj.timezone).utc().format();
        const currentTime = moment().utc().format();

        if (status === 'resume') {
            if (currentTime > scheduledTime) {
                statusToUpdate = 'running';
            } else {
                statusToUpdate = 'scheduled';
            }
        } else if( status === 'pause') {
            statusToUpdate = 'paused';
        } else if (status === 'cancel') {
            statusToUpdate = 'cancelled';
        }

        await campaignsDb.updateCampaignById({id: campaignId, valuesToUpdate: {
                status: statusToUpdate,
                'updated_at': currentTime,
            }});

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

module.exports = makeUpdateCampaignStatus;
