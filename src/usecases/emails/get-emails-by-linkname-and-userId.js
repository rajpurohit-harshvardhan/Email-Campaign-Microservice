function makeGetEmailsByLinknameAndUserId({_, Joi, ValidationError, emailsDb, emailBodyDb, emailLogsDb, emailFoldersDb, emailRecipientsDb}) {
    return async function getEmailsByLinknameAndUserId({linkname, userId, fieldsToQuery}) {
        validateInput({linkname, userId, fieldsToQuery});

        const folderObj = {};
        const folders = await emailFoldersDb.getEmailFoldersByLinknameAndUserId({linkname, userId});
        _.forEach(folders, (folder) => {
            folderObj[folder.id] = folder.name;
        });

        const emailMapping = {}
        const emails = await emailsDb.getEmailsByLinknameAndUserId({linkname, userId, fieldsToQuery});

        _.forEach(emails, email => {
            emailMapping[email.id] = email;
            emailMapping[email.id]['folder'] = folderObj[email['folder_id']];
            delete email['folder_id'];
        });

        const emailBody = await emailBodyDb.getEmailBodyByEmailIds({emailIds: Object.keys(emailMapping), fieldsToQuery: ['*']});
        _.forEach(emailBody, body => {
            if (!!emailMapping[body['email_id']]) {
                emailMapping[body['email_id']]['body'] = {
                    contentType: body['content_type'],
                    content: body['content'],
                    text: body['text_data'],
                };
            }
        });

        const emailRecipients = await emailRecipientsDb.getEmailRecipientsByEmailIds({emailIds: Object.keys(emailMapping), fieldsToQuery: ['*']});
        _.forEach(emailRecipients, recipient => {
            if (!!emailMapping[recipient['email_id']]) {
                if (recipient.type === 'from') {
                    emailMapping[recipient['email_id']]['fromName'] = recipient.name;
                    emailMapping[recipient['email_id']]['fromEmail'] = recipient['email_address'];
                } else {
                    if (!!emailMapping[recipient['email_id']][recipient.type]) {
                        emailMapping[recipient['email_id']][recipient.type].push({
                            name: recipient.name,
                            email: recipient['email_address'],
                        })
                    } else {
                        emailMapping[recipient['email_id']][recipient.type]= [{
                            name: recipient.name,
                            email: recipient['email_address'],
                        }];
                    }
                }
            }
        });

        const emailLogs = await emailLogsDb.getEmailLogByEmailIds({emailIds: Object.keys(emailMapping), fieldsToQuery: ['*']});
        _.forEach(emailLogs, log => {
            if (!!emailMapping[log['email_id']]) {
                emailMapping[log['email_id']]['status'] = log.status;
                emailMapping[log['email_id']]['isDelivered'] = log['is_delivered'];
                emailMapping[log['email_id']]['error'] = log.error;
                emailMapping[log['email_id']]['sentAt'] = log['sent_at'];
            }
        });

        return Object.values(emailMapping);
    };

    function validateInput({linkname, userId, fieldsToQuery}) {
        const schema = Joi.object({
            linkname: Joi.string().trim().required(),
            userId: Joi.number().required(),
            fieldsToQuery: Joi.string().trim().allow(null),
        });
        const {value, error} = schema.validate({linkname, userId, fieldsToQuery});
        if (error) {
            throw  new ValidationError(error.message);
        }
    }
}

module.exports = makeGetEmailsByLinknameAndUserId;
