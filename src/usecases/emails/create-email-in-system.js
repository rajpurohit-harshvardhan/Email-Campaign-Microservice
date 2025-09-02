function makeCreateEmailInSystem({_, Joi, ValidationError, emailsDb, emailBodyDb, emailRecipientsDb,}) {
    return async function createEmailInSystem({linkname, userId, emailObj}) {
        // validate input
        validateInput({linkname, userId, emailObj});


        // creating email
        const emailId = await emailsDb.createEmail({
            linkname,
            userId,
            subject: emailObj.subject,
            label: emailObj.label,
            hasAttachment: !!emailObj.attachments,
            fromEmail: emailObj.from.email,
            fromName: emailObj.from.name,
            folderId: emailObj.folderId,
        });

        // adding emailBody
        const emailBodyId = await emailBodyDb.createEmailBody({
            linkname,
            emailId,
            contentType: emailObj.body.contentType,
            content: emailObj.body.content,
            textData: emailObj.body.text,
        });

        // creating recipients
        await createRecipients({linkname, emailId, type: 'from', recipients: [emailObj.from]});
        await createRecipients({linkname, emailId, type: 'to', recipients: emailObj.to});
        await createRecipients({linkname, emailId, type: 'cc', recipients: emailObj.cc || []});
        await createRecipients({linkname, emailId, type: 'bcc', recipients: emailObj.bcc || []});

        return emailId;
    };

    function validateInput({linkname, userId, emailObj}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            emailObj: Joi.object({
                from: Joi.object({
                    email: Joi.string().email().required(),
                    name: Joi.string().trim(),
                }),
                replyTo: Joi.string().email().required(),
                subject: Joi.string().trim(),
                body: Joi.object({
                    contentType: Joi.string().required(),
                    content: Joi.string().trim(),
                    text: Joi.string().trim(),
                }),
                to: Joi.array().items(Joi.object({
                    email: Joi.string().email().required(),
                    name: Joi.string().trim(),
                })),
                cc: Joi.array().items(Joi.object({
                    email: Joi.string().email(),
                    name: Joi.string().trim(),
                })),
                bcc: Joi.array().items(Joi.object({
                    email: Joi.string().email(),
                    name: Joi.string().trim(),
                })),
                provider: Joi.object().unknown(true),
            }).unknown(true),
        });
        const {value, error} = schema.validate({linkname, userId, emailObj});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }

    async function createRecipients({linkname, emailId, recipients, type}){
        for (const recipient of recipients) {
            await emailRecipientsDb.createEmailRecipient({
                linkname,
                emailId,
                type,
                emailAddress: recipient.email,
                name: recipient.name,
            });
        }
    }
}

module.exports = makeCreateEmailInSystem;
