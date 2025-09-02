function makeUpdateUserByIdController({Joi, formatResponse, formatError, ValidationError, updateUserById}) {
    return async function updateUserByIdController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            id: httpRequest.params.id,
            userObj: httpRequest.body,
        });

        try {
            const result = await updateUserById({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                id: httpRequest.params.id,
                userObj: httpRequest.body,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action updateUserByIdController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, id, userObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            id: Joi.string().guid().required(),
            userObj: Joi.object({
                email: Joi.string().email(),
                password: Joi.string().trim(),
                role: Joi.number().valid(1,2,3),
            }),
        });
        const {value, error} = schema.validate({linkname, userId, id, userObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeUpdateUserByIdController;
