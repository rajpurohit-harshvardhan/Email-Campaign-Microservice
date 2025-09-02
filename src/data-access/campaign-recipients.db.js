const TABLE_NAME = 'campaign_recipients';
const CAMPAIGN_MESSAGES_TABLE_NAME = 'campaign_messages';

function makeCampaignRecipientsDb({cockroach}) {
    return Object.freeze({
        createCampaignRecipient,
        // updateCampaignRecipientsByCampaignId,
        getCampaignRecipientsByCampaignId,
        deleteCampaignRecipientsByCampaignId,
        getCampaignRecipientsByCampaignIds,
        createCampaignRecipientsInBulk,
        getRecipientsToEnroll,
        getRecipientsToEnrollCount,
    });

    async function createCampaignRecipient({linkname, campaignId, emailAddress, name, variables}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, campaign_id, email_address, name, variables) VALUES($1, $2, $3, $4, $5) RETURNING id`,
            values: [linkname, campaignId, emailAddress, name, variables],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function updateCampaignRecipientsByCampaignId({campaignId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(campaignId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function getCampaignRecipientsByCampaignId({campaignId, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, campaign_id, email_address, name, variables'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE campaign_id=$1`,
            values: [campaignId],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function deleteCampaignRecipientsByCampaignId({campaignId}) {
        const result = await cockroach.executeQuery({
            query: `DELETE from ${TABLE_NAME} WHERE campaign_id=$1`,
            values: [campaignId],
        });
        if (result) {
            return result.rows[0];
        } else {
            return null;
        }
    }

    async function getCampaignRecipientsByCampaignIds({campaignIds, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, campaign_id, email_address, name, variables'];
        }
        const result = await cockroach.executeQuery({
            query: `SELECT ${fieldsToQuery} from ${TABLE_NAME} WHERE campaign_id=ANY($1)`,
            values: [campaignIds],
        });
        if (result) {
            return result.rows;
        } else {
            return null;
        }
    }

    async function createCampaignRecipientsInBulk(recipients) {
        if (!recipients || recipients.length === 0) {
            return [];
        }

        const valuePlaceholders = recipients
            .map((_, i) =>
                `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
            )
            .join(", ");

        const values = recipients.flatMap(r => [
            r.linkname,
            r.campaignId,
            r.emailAddress,
            r.name,
            r.variables
        ]);

        const query = `INSERT INTO ${TABLE_NAME} (linkname, campaign_id, email_address, name, variables)
        VALUES ${valuePlaceholders} RETURNING id`;

        const result = await cockroach.executeQuery({ query, values });

        if (result && result.rows.length > 0) {
            return result.rows.map(row => row.id);
        } else {
            return [];
        }
    }

    async function getRecipientsToEnroll({ campaignId, fieldsToQuery, limit = 100 }) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['r.id', 'r.campaign_id', 'r.email_address', 'r.name', 'r.variables'];
        }

        const query= `SELECT ${fieldsToQuery.join(', ')} FROM campaign_recipients r LEFT JOIN campaign_messages m
          ON r.id = m.campaign_recipient_id AND r.campaign_id = m.campaign_id WHERE r.campaign_id = $1
          AND ( m.id IS NULL OR (m.status IN ('failed', 'bounced') AND m.attempt < 3) ) ORDER BY r.created_at LIMIT $2`;

        const result = await cockroach.executeQuery({
            query,
            values: [campaignId, limit],
        });
        return result ? result.rows : null;
    }

    async function getRecipientsToEnrollCount({ campaignId, limit = 100 }) {
        const query= `SELECT COUNT(r.id) FROM campaign_recipients r LEFT JOIN campaign_messages m
          ON r.id = m.campaign_recipient_id AND r.campaign_id = m.campaign_id WHERE r.campaign_id = $1
          AND ( m.id IS NULL OR (m.status IN ('failed', 'bounced') AND m.attempt < 3)) ORDER BY r.created_at LIMIT $2`;

        const result = await cockroach.executeQuery({
            query,
            values: [campaignId, limit],
        });
        return result ? result.rows[0] : null;
    }



    function prepareSetClauseForUpdate({valuesToUpdate}) {
        const keys = Object.keys(valuesToUpdate);
        const values = Object.values(valuesToUpdate);

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        return {setClause, values};
    }
}

module.exports = makeCampaignRecipientsDb;
