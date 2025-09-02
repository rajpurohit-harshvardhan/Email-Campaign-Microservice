const ValidationError = require('../../exceptions/validation.error');
const ForbiddenError = require('../../exceptions/forbidden.error');
const AuthorizationFailed = require('../../exceptions/authorization-failed.error');

const _ = require('lodash');
const Joi = require('@hapi/joi');
const cheerio = require('cheerio');

const dbs = require('../../data-access')
const config = require('../../config/environments');
const {emailQueue} = require('../../jobs/initialize-queues')

const makeConvertEmailIntoCommonFormat = require('./convert-email-into-common format');
const convertEmailIntoCommonFormat = makeConvertEmailIntoCommonFormat({
    _,
    Joi,
    ValidationError,
});

const makeSendEmail = require('./send-email');
const sendEmail = makeSendEmail({
    Joi,
    config,
    emailQueue,
    ValidationError,
    convertEmailIntoCommonFormat,
});

const makeCreateEmailInSystem = require('./create-email-in-system');
const createEmailInSystem = makeCreateEmailInSystem({
    _,
    Joi,
    cheerio,
    ValidationError,
    emailsDb: dbs.emailsDb,
    emailBodyDb: dbs.emailBodyDb,
    emailFoldersDb: dbs.emailFoldersDb,
    emailRecipientsDb: dbs.emailRecipientsDb,
});

const makeGetEmailsByLinknameAndUserId = require('./get-emails-by-linkname-and-userId');
const getEmailsByLinknameAndUserId = makeGetEmailsByLinknameAndUserId({
    _,
    Joi,
    ValidationError,
    emailsDb: dbs.emailsDb,
    emailBodyDb: dbs.emailBodyDb,
    emailLogsDb: dbs.emailLogsDb,
    emailFoldersDb: dbs.emailFoldersDb,
    emailRecipientsDb: dbs.emailRecipientsDb,
});

const makeDeleteEmailById = require('./delete-email-by-id');
const deleteEmailById  = makeDeleteEmailById({
    Joi,
    ValidationError,
    emailsDb: dbs.emailsDb,
});

const makeBuildEmailFromTemplate = require('./build-email-from-template');
const buildEmailFromTemplate  = makeBuildEmailFromTemplate({
    Joi,
    ValidationError,
});


// Create Controller Object
module.exports = Object.freeze({
    sendEmail,
    convertEmailIntoCommonFormat,
    createEmailInSystem,
    getEmailsByLinknameAndUserId,
    deleteEmailById,
    buildEmailFromTemplate,
});

