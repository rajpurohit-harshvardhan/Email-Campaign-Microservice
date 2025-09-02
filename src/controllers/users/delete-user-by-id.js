function makeDeleteUserByIdController({Joi, formatResponse, formatError, ValidationError, deleteUserById}) {
    return async function deleteUserByIdController(httpRequest) {
        validateInput({
            linkname: httpRequest.linkname,
            userId: httpRequest.user.id,
            id: httpRequest.params.id,
           });

        try {
            const result = await deleteUserById({
                userId: httpRequest.user.id,
                linkname: httpRequest.linkname,
                id: httpRequest.params.id,
            });
            return formatResponse({statusCode: 200, body: result});
        } catch (e) {
            httpRequest.logger.error('Got error processing action deleteUserByIdController', e);
            return formatError({error: e});
        }
    };

    function validateInput({linkname, userId, id}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            id: Joi.string().guid().required(),
        });
        const {value, error} = schema.validate({linkname, userId, id});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeDeleteUserByIdController;
