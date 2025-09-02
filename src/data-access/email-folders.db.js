const TABLE_NAME = 'email_folders';

function makeEmailFoldersDb({cockroach}) {
    return Object.freeze({
        // createEmailFolder,
        updateEmailFolderById,
        getEmailFolderById,
        deleteEmailFolderById,
        getEmailFoldersByLinknameAndUserId,
    });

    async function createEmailFolder({linkname, emailId, contentType, content, textData}) {
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

    async function updateEmailFolderById({id, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(id);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getEmailFolderById({id, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, name, sync_status'];
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

    async function deleteEmailFolderById({id}) {
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

    async function getEmailFoldersByLinknameAndUserId({linkname, userId, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, name, sync_status'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE linkname=$1 and user_id=$2`,
            values: [linkname, userId],
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

module.exports = makeEmailFoldersDb;
