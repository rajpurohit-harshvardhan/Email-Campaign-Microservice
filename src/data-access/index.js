const config = require('../config/environments');
const CockroachDBUtil = require('../utils/cockroach-db-util');

const cockroach = new CockroachDBUtil({
    username: config.cockroach.username,
    host: config.cockroach.host,
    database: config.cockroach.dbName,
    password: config.cockroach.password,
    port: config.cockroach.port,
    poolSize: config.cockroach.poolSize,
    isSSL: config.cockroach.ssl,
});

// Make all DBs here
const makeUsersDb = require('./users.db');
const usersDb = makeUsersDb({cockroach});

const makeEmailsDb = require('./emails.db');
const emailsDb = makeEmailsDb({cockroach});

const makeEmailBodyDb = require('./email-body.db');
const emailBodyDb = makeEmailBodyDb({cockroach});

const makeEmailLogsDb = require('./email-logs.db');
const emailLogsDb = makeEmailLogsDb({cockroach});

const makeEmailRecipientsDb = require('./email-recipients.db');
const emailRecipientsDb = makeEmailRecipientsDb({cockroach});

const makeEmailFoldersDb = require('./email-folders.db');
const emailFoldersDb = makeEmailFoldersDb({cockroach});

const makeCampaignsDb = require('./campaigns.db');
const campaignsDb = makeCampaignsDb({cockroach});

const makeCampaignRecipientsDb = require('./campaign-recipients.db');
const campaignRecipientsDb = makeCampaignRecipientsDb({cockroach});

const makeCampaignMessagesDb = require('./campaign-messages.db');
const campaignMessagesDb = makeCampaignMessagesDb({cockroach});

const makeCampaignTemplatesDb = require('./campaign-templates.db');
const campaignTemplatesDb = makeCampaignTemplatesDb({cockroach});

// Export all DBs
const dbs = {
    usersDb,
    emailsDb,
    emailBodyDb,
    emailLogsDb,
    emailRecipientsDb,
    emailFoldersDb,
    campaignsDb,
    campaignRecipientsDb,
    campaignMessagesDb,
    campaignTemplatesDb,
};
module.exports = {...dbs};
