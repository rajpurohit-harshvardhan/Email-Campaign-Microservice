function makeConvertEmailIntoCommonFormat({_, Joi, ValidationError}) {
    return function convertEmailIntoCommonFormat({emailObj}) {
        // validate input
        validateInput({emailObj});

        let to = [],cc = [],bcc = []
        _.forEach(Object.keys(emailObj.recipients), function(value) {
            switch (value.toLowerCase()) {
                case 'to': to = emailObj.recipients[value]; break;
                case 'cc': cc = emailObj.recipients[value]; break;
                case 'bcc': bcc = emailObj.recipients[value]; break;
            }
        });

        return {
            from: emailObj.from,
            replyTo: emailObj.replyTo,
            subject: emailObj.subject,
            body: emailObj.body,
            to, cc, bcc,
            provider: emailObj.provider,
        }
    };

    function validateInput({emailObj}) {
        const schema = Joi.object({
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
        const {value, error} = schema.validate({emailObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeConvertEmailIntoCommonFormat;
