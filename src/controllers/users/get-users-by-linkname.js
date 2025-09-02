function makeGetUsersByLinknameController({Joi, formatResponse, formatError, ValidationError, getUsersByLinkname}) {
    return async function getUsersByLinknameController(httpRequest) {
        const {fieldsToQuery} = httpRequest.query || null;
        validateInput({linkname: httpRequest.linkname, fieldsToQuery});

        try {
            const result = await getUsersByLinkname({
                linkname: httpRequest.linkname,
                fieldsToQuery: fieldsToQuery ,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action getUsersByLinknameController', e);
            return formatError({e});
        }
    };

    function validateInput({linkname, fieldsToQuery}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            fieldsToQuery: Joi.string().trim().allow(null),
        });
        const {value, error} = schema.validate({linkname, fieldsToQuery});
        if (error) {
            throw formatError({error: new ValidationError(error.message)});
        }
    }
}

module.exports = makeGetUsersByLinknameController;
