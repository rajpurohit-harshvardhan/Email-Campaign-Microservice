const ValidationError = require('../../exceptions/validation.error');
const config = require('../../config/environments');

const _ = require('lodash');
const Joi = require('@hapi/joi');
const moment = require('moment-timezone');

const dbs = require('../../data-access')
const {campaignSenderQueue} = require('../../jobs/initialize-queues');

const makeCreateCampaign = require('./create-campaign');
const createCampaign = makeCreateCampaign({
    Joi,
    ValidationError,
    campaignsDb: dbs.campaignsDb,
});

const makeCreateRecipientsInBulk = require('./create-recipients-in-bulk');
const createRecipientsInBulk = makeCreateRecipientsInBulk({
    _,
    Joi,
    ValidationError,
    campaignRecipientsDb: dbs.campaignRecipientsDb,
});

const makeSendCampaign = require('./send-campaign');
const sendCampaign = makeSendCampaign({
    _,
    Joi,
    moment,
    config,
    ValidationError,
    campaignSenderQueue,
    campaignsDb: dbs.campaignsDb,
});

const makeGetCampaignStatus = require('./get-campaign-status');
const getCampaignStatus = makeGetCampaignStatus({
    Joi,
    ValidationError,
    campaignsDb: dbs.campaignsDb,
});

const makeUpdateCampaignStatus = require('./update-campaign-status');
const updateCampaignStatus = makeUpdateCampaignStatus({
    Joi,
    moment,
    ValidationError,
    campaignsDb: dbs.campaignsDb,
});

// Create Controller Object
module.exports = Object.freeze({
    createCampaign,
    createRecipientsInBulk,
    sendCampaign,
    getCampaignStatus,
    updateCampaignStatus,
});

