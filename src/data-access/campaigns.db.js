const TABLE_NAME = 'campaigns';
const CAMPAIGN_MESSAGES_TABLE_NAME = 'campaign_messages';

function makeCampaignsDb({cockroach}) {
    return Object.freeze({
        createCampaign,
        updateCampaignById,
        getCampaignById,
        deleteCampaignById,
        getScheduledCampaigns,
        getCampaignStatus,
    });

    async function createCampaign({linkname, userId, name, subject, fromEmail, fromName, templateId}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, user_id, name, subject, from_email, from_name, template_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            values: [linkname, userId, name, subject, fromEmail, fromName, templateId],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateCampaignById({id, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(id);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getCampaignById({id, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, name, subject, from_email, template_id'];
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

    async function deleteCampaignById({id}) {
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

    async function getScheduledCampaigns({fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, linkname, name, subject, from_email, template_id'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE status='scheduled' and scheduled_at <= now()`,
            values: [],
        });
        if (result) {
            return result.rows;
        } else {
            return null;
        }
    }

    async function getCampaignStatus({id}) {
        const result = await cockroach.executeQuery({
            query: `SELECT c.status, COUNT(*) AS total,
       SUM((m.status='queued')::INT) AS queued, SUM((m.status='sending')::INT) AS sending, SUM((m.status='sent')::INT) AS sent,
       SUM((m.status='delivered')::INT) AS delivered, SUM((m.status IN ('failed','bounced'))::INT) AS failed 
        from ${TABLE_NAME} c JOIN ${CAMPAIGN_MESSAGES_TABLE_NAME} m ON m.campaign_id = c.id WHERE c.id = $1 GROUP BY c.status`,
            values: [id],
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

module.exports = makeCampaignsDb;
