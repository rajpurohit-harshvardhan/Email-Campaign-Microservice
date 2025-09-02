const TABLE_NAME = 'emails';

function makeEmailsDb({cockroach}) {
    return Object.freeze({
        createEmail,
        updateEmailById,
        getEmailsByLinknameAndUserId,
        getEmailById,
        deleteEmailById,
    });

    async function createEmail({linkname, userId,  subject, label, hasAttachment, fromEmail, fromName, replyTo, folderId}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, user_id, subject, label, has_attachment, from_email, from_name, reply_to, folder_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            values: [linkname, userId, subject, label, hasAttachment || false, fromEmail, fromName, replyTo, folderId],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateEmailById({id, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(id);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getEmailsByLinknameAndUserId({userId, linkname, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, subject, from_email, folder_id'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE linkname=$1 and user_id = $2`,
            values: [linkname, userId],
        });
        if (result) {
            return result.rows;
        } else {
            return null;
        }
    }

    async function getEmailById({id, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, subject, from_email, folder_id'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE id=$1`,
            values: [id],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function deleteEmailById({id}) {
        const result = await cockroach.executeQuery({
            query: `DELETE from ${TABLE_NAME} WHERE id=$1`,
            values: [id],
        });
        if (result) {
            return result.rows[0];
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

module.exports = makeEmailsDb;
