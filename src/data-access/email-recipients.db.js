const TABLE_NAME = 'email_recipients';

function makeEmailRecipientsDb({cockroach}) {
    return Object.freeze({
        createEmailRecipient,
        // updateEmailRecipientsByEmailId,
        getEmailRecipientsByEmailId,
        deleteEmailRecipientsByEmailId,
        getEmailRecipientsByEmailIds,
    });

    async function createEmailRecipient({linkname, emailId, type, emailAddress, name}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, email_id, type, email_address, name) VALUES($1, $2, $3, $4, $5) RETURNING id`,
            values: [linkname, emailId, type, emailAddress, name],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateEmailRecipientsByEmailId({emailId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(emailId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getEmailRecipientsByEmailId({emailId, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, email_id, type, email_address, name'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE email_id=$1`,
            values: [emailId],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function deleteEmailRecipientsByEmailId({emailId}) {
        const result = await cockroach.executeQuery({
            query: `DELETE from ${TABLE_NAME} WHERE email_id=$1`,
            values: [emailId],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function getEmailRecipientsByEmailIds({emailIds, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, email_id, type, email_address, name'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE email_id=ANY($1)`,
            values: [emailIds],
        });
        if (result) {
            return result.rows;
        } else {
            return null;
        }
    }

    function prepareSetClauseForUpdate({valuesToUpdate}) {
        const keys = Object.keys(valuesToUpdate);
        const values = Object.values(valuesToUpdate);

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        return {setClause, values};
    }
}

module.exports = makeEmailRecipientsDb;
