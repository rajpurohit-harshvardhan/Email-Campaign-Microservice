function makeGetEmailsByLinknameAndUserIdController({Joi, formatResponse, formatError, ValidationError, getEmailsByLinknameAndUserId}) {
    return async function getEmailsByLinknameAndUserIdController(httpRequest) {
        const {fieldsToQuery} = httpRequest.query || null;
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            fieldsToQuery});

        try {
            const result = await getEmailsByLinknameAndUserId({
                linkname: httpRequest.linkname,
                userId: httpRequest.user.id,
                fieldsToQuery: fieldsToQuery,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action getEmailsByLinknameAndUserIdController', e);
            return formatError({e});
        }
    };

    function validateInput({linkname, userId, fieldsToQuery}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            fieldsToQuery: Joi.string().trim().allow(null),
        });
        const {value, error} = schema.validate({linkname, userId, fieldsToQuery});
        if (error) {
            throw formatError({error: new ValidationError(error.message)});
        }
    }
}

module.exports = makeGetEmailsByLinknameAndUserIdController;
