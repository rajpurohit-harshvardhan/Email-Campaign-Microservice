const TABLE_NAME = 'users';

function makeUserDb({cockroach}) {
    return Object.freeze({
        createUser,
        updateUserById,
        listAllUsersByLinkname,
        getUserByLinknameAndUserId,
        getUserById,
        deleteUserById,
    });

    async function createUser({linkname, userId, email, password, role}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, user_id, email, password, role) VALUES($1, $2, $3, $4, $5) RETURNING id`,
            values: [linkname, userId, email, password, role],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateUserById({id, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(id);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function listAllUsersByLinkname({linkname, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, email, user_id'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE linkname = $1`,
            values: [linkname],
        });
        if (result) {
            return result.rows;
        } else {
            return null;
        }
    }

    async function getUserByLinknameAndUserId({id, linkname, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, email, user_id'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE linkname=$1 and user_id = $2`,
            values: [linkname, id],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function getUserById({id, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, email, user_id'];
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

    async function deleteUserById({id}) {
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

module.exports = makeUserDb;
