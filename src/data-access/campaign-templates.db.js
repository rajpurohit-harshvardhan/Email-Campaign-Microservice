const TABLE_NAME = 'campaign_templates';

function makeCampaignTemplatesDb({cockroach}) {
    return Object.freeze({
        createCampaignTemplate,
        // updateCampaignTemplatesByEmailId,
        getCampaignTemplatesById,
        deleteCampaignTemplatesById,
    });

    async function createCampaignTemplate({linkname, userId, name, subject, fromEmail, fromName, html, text, defaultVar, isActive}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, user_id, name, subject, from_email, from_name, html_content, text_content, default_vars, is_active) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            values: [linkname, userId, name, subject, fromEmail, fromName, html, text, defaultVar, isActive],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateCampaignTemplatesByEmailId({emailId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(emailId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getCampaignTemplatesById({id, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, user_id, name, subject, from_email, is_active'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE  id=$1`,
            values: [id],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function deleteCampaignTemplatesById({id}) {
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

module.exports = makeCampaignTemplatesDb;
