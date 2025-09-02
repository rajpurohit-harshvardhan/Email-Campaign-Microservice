const TABLE_NAME = 'email_body';

function makeEmailBodyDb({cockroach}) {
    return Object.freeze({
        createEmailBody,
        updateEmailBodyByEmailId,
        getEmailBodyByEmailId,
        deleteEmailBodyByEmailId,
        getEmailBodyByEmailIds,
    });

    async function createEmailBody({linkname, emailId, contentType, content, textData}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, email_id, content_type, content, text_data) VALUES($1, $2, $3, $4, $5) RETURNING id`,
            values: [linkname, emailId, contentType, content, textData],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateEmailBodyByEmailId({emailId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(emailId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getEmailBodyByEmailId({emailId, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, email_id, content_type, content, text_data'];
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

    async function deleteEmailBodyByEmailId({emailId}) {
        const result = await cockroach.executeQuery({
            query: `DELETE from ${TABLE_NAME} WHERE email_id=$1`,
            values: [emailId],
        });11
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function getEmailBodyByEmailIds({emailIds, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, email_id, content_type, content, text_data'];
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

module.exports = makeEmailBodyDb;
