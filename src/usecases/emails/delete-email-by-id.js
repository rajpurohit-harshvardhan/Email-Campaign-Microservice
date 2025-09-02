function makeDeleteEmailById({Joi, ValidationError, emailsDb}) {
    return async function deleteEmailById({linkname, userId, id}) {
        validateInput({linkname, userId, id});

        return await emailsDb.deleteEmailById({id});
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

module.exports = makeDeleteEmailById;
