const TABLE_NAME = 'campaign_messages';

function makeCampaignMessagesDb({cockroach}) {
    return Object.freeze({
        createCampaignMessage,
        createCampaignMessagesInBulk,
        getCampaignMessagesByCampaignId,
        getCampaignMessagesByCampaignIds,
        deleteCampaignMessagesByCampaignId,
        updateCampaignMessageByCampaignIdAndCampaignRecipientId,
        updateCampaignMessageByCampaignId,
    });

    async function createCampaignMessage({linkname, campaignId, campaignRecipientId, emailId, status}) {
        const result = await cockroach.executeQuery({
            query: `INSERT INTO ${TABLE_NAME} (linkname, campaign_id, campaign_recipient_id, email_id, status) VALUES($1, $2, $3, $4, $5) RETURNING id`,
            values: [linkname, campaignId, campaignRecipientId, emailId, status],
        });
        if (result) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }

    async function getCampaignMessagesByCampaignId({campaignId, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, campaign_id, campaign_recipient_id, email_id, status'];
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

    async function deleteCampaignMessagesByCampaignId({campaignId}) {
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

    async function getCampaignMessagesByCampaignIds({campaignIds, fieldsToQuery}) {
        if (!fieldsToQuery) {
            fieldsToQuery = ['id, campaign_id, campaign_recipient_id, email_id, status'];
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

    async function createCampaignMessagesInBulk(messages) {
        if (!messages || messages.length === 0) {
            return [];
        }

        const valuePlaceholders = messages
            .map((_, i) =>
                `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
            ).join(", ");

        const values = messages.flatMap(r => [r.linkname, r.campaignId, r.campaignRecipientId, r.status]);

        const query = `INSERT INTO ${TABLE_NAME} (linkname, campaign_id, campaign_recipient_id, status)
        VALUES ${valuePlaceholders} RETURNING id`;

        const result = await cockroach.executeQuery({ query, values });

        if (result && result.rows.length > 0) {
            return result.rows.map(row => row.id);
        } else {
            return [];
        }
    }


    async function updateCampaignMessageByCampaignIdAndCampaignRecipientId({campaignId, campaignRecipientId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(campaignId);
        values.push(campaignRecipientId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where campaign_id=$${values.length-1} and campaign_recipient_id=$${values.length}`,
            values,
        });
        return !!result;
    }

    async function updateCampaignMessageByCampaignId({campaignId, valuesToUpdate}) {
        const {setClause, values} = prepareSetClauseForUpdate({valuesToUpdate});
        values.push(campaignId);
        const result = await cockroach.executeQuery({
            query: `UPDATE ${TABLE_NAME} SET ${setClause} where campaign_id=$${values.length}`,
            values,
        });
        return !!result;
    }

    function prepareSetClauseForUpdate({valuesToUpdate}) {
        const keys = Object.keys(valuesToUpdate);
        const values = Object.values(valuesToUpdate);

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        return {setClause, values};
    }
}

module.exports = makeCampaignMessagesDb;
