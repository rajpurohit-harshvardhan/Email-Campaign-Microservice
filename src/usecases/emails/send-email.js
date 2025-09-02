function makeSendEmail({Joi, config, ValidationError, emailQueue, convertEmailIntoCommonFormat}) {
    return async function sendEmail({linkname, userId, emailObj}) {
        // validate input
        validateInput({linkname, userId, emailObj});

        // convert emailObj into data and publish on sendEmail topic
        emailObj = convertEmailIntoCommonFormat({emailObj});

        return await emailQueue.add(config.redisQueues.sendEmail.topic, {linkname, userId, emailObj}, {
            attempts: 3,
            backoff: 10000, // retry after 10s
            removeOnComplete: true
        });
    };

    function validateInput({linkname, userId, emailObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            emailObj: Joi.object({
                from: Joi.object({
                    email: Joi.string().email().required(),
                    name: Joi.string().trim(),
                }),
                replyTo: Joi.string().email().required(),
                subject: Joi.string().trim(),
                body: Joi.object({
                    contentType: Joi.string().required(),
                    content: Joi.string().trim(),
                }),
                recipients: Joi.object({
                    to: Joi.array().items(Joi.object({
                        email: Joi.string().email().required(),
                        name: Joi.string().trim(),
                    })),
                    cc: Joi.array().items(Joi.object({
                        email: Joi.string().email(),
                        name: Joi.string().trim(),
                    })),
                    bcc: Joi.array().items(Joi.object({
                        email: Joi.string().email(),
                        name: Joi.string().trim(),
                    })),
                }),
                provider: Joi.object().unknown(true),
            }).unknown(true),
        });
        const {value, error} = schema.validate({linkname, userId, emailObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeSendEmail;
