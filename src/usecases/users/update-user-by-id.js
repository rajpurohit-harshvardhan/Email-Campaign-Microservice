function makeUpdateUserById({Joi, ValidationError, validateUserPermissions, usersDb}) {
    return async function updateUserById({linkname, userId, id, userObj}) {
        validateInput({linkname, userId, id, userObj});

        const currentUser = await validateUserPermissions({linkname, userId, userObj:{id}});

        if (currentUser.id === id && !!userObj.role && userObj.role !== 1) {
            throw new ValidationError("Invalid information to update for the given Id!");
        }

        return await usersDb.updateUserById({id, valuesToUpdate: userObj});
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

module.exports = makeUpdateUserById;
