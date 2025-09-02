const TABLE_NAME = 'email_logs';

function makeEmailLogsDb({cockroach}) {
    return Object.freeze({
        createEmailLog,
        updateEmailLogByEmailId,
        getEmailLogByEmailId,
        deleteEmailLogByEmailId,
        getEmailLogByEmailIds,
    });

    async function createEmailLog({linkname, emailId, status, isDelivered, error, providerMessageId, sentAt}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, email_id, status, is_delivered, error, provider_message_id, sent_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            values: [linkname, emailId, status, isDelivered, error, providerMessageId, sentAt],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateEmailLogByEmailId({emailId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(emailId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getEmailLogByEmailId({emailId, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, email_id, linkname, status, is_delivered, error, sent_at'];
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

    async function deleteEmailLogByEmailId({emailId}) {
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

    async function getEmailLogByEmailIds({emailIds, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, email_id, linkname, status, is_delivered, error, sent_at'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE email_id = ANY($1)`,
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

module.exports = makeEmailLogsDb;
