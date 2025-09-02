function makeDeleteUserById({Joi, ValidationError, validateUserPermissions, usersDb}) {
    return async function deleteUserById({linkname, userId, id}) {
        validateInput({linkname, userId, id});

        const currentUser = await validateUserPermissions({linkname, userId, userObj:{id}});

        if (currentUser.id === id) {
            throw new ValidationError("Invalid Operation for the given Id!");
        }

        return await usersDb.deleteUserById({id});
    };a

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

module.exports = makeDeleteUserById;
