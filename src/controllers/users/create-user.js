function makeCreateUserController({Joi, formatResponse, formatError, ValidationError, createUser}) {
    return async function createUserController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            userObj: httpRequest.body,
        });

        try {
            const result = await createUser({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                userObj: httpRequest.body,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action createUserController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, userObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            userObj: Joi.object({
                linkname: Joi.string().trim().required(),
                userId: Joi.number().required(),
                email: Joi.string().email().required(),
                password: Joi.string().trim().required(),
                role: Joi.number().valid(1,2,3).required(),
            }),
        });
        const {value, error} = schema.validate({linkname, userId, userObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeCreateUserController;
