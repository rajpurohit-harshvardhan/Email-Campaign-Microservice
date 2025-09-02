function makeValidateUserPermissions({Joi, ValidationError, ForbiddenError, AuthorizationFailed, usersDb}) {
    return async function validateUserPermissions({linkname, userId, userObj}) {
        validateInput({linkname, userId, userObj});

        const currentUser = await usersDb.getUserByLinknameAndUserId({
            id: userId,
            linkname,
            fieldsToQuery: ['role', 'id']});

        let linknameToCheck = "";

        if (!userObj.id) {
            linknameToCheck = userObj.linkname;
        } else {
           const userToUpdate = await usersDb.getUserById({id: userObj.id, fieldsToQuery: ['linkname']});
           if (!userToUpdate) {
               throw new ValidationError('No such user exists!');
           }
           linknameToCheck = userToUpdate.linkname;
        }

        if (linkname !== linknameToCheck) {
            throw new ForbiddenError('You can only modify user for your own link!');
        }

        if (!currentUser) {
            throw new ValidationError(`No valid user found in the system with userId:${userId}`);
        }

        if(parseInt(currentUser.role)!==1) {
            throw new AuthorizationFailed('The current user is not authorized to perform this action!');
        }

        return currentUser;
    };

    function validateInput({linkname, userId, userObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            userObj: Joi.object({
                id: Joi.string().guid(),
                linkname: Joi.string().trim(),
            }).unknown(true),
        });
        const {value, error} = schema.validate({linkname, userId, userObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeValidateUserPermissions;
