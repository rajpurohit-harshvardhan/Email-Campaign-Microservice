function makeGetUsersByLinkname({Joi, ValidationError, usersDb}) {
    return async function getUsersByLinkname({linkname, fieldsToQuery}) {
        validateInput({linkname, fieldsToQuery});

        const result = await usersDb.listAllUsersByLinkname({linkname, fieldsToQuery});

        return result;
    };

    function validateInput({linkname, fieldsToQuery}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            fieldsToQuery: Joi.string().trim().allow(null),
        });
        const {value, error} = schema.validate({linkname, fieldsToQuery});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeGetUsersByLinkname;
