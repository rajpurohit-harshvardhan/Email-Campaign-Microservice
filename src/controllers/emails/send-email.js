function makeSendEmailController({Joi, formatResponse, formatError, ValidationError, sendEmail}) {
    return async function sendEmailController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            emailObj: httpRequest.body,
        });

        try {
            const result = await sendEmail({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                emailObj: httpRequest.body,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action sendEmailController', e);
            return formatError({error: e});
        }
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

module.exports = makeSendEmailController;
