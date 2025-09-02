function makeCreateUser({Joi, ValidationError, validateUserPermissions, usersDb}) {
    return async function createUser({linkname, userId, userObj}) {
        validateInput({linkname, userId, userObj});

        await validateUserPermissions({linkname, userId, userObj});

        return await usersDb.createUser(userObj);
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

module.exports = makeCreateUser;
