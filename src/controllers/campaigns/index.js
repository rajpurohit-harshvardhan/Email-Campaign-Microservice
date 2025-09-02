const formatResponse = require('../format-response').formatResponse;
const formatError = require('../format-response').formatError;
const ValidationError = require('../../exceptions/validation.error');
const ForbiddenError = require('../../exceptions/forbidden.error');
const _ = require('lodash');
const Joi = require('@hapi/joi');

// Import useCases
const useCases = require('../../usecases');

const makeCreateCampaignController = require('./create-campaign');
const createCampaignController = makeCreateCampaignController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    createCampaign: useCases.campaigns.createCampaign,
});

const makeCreateRecipientsInBulkController = require('./create-recipients-in-bulk');
const createRecipientsInBulkController = makeCreateRecipientsInBulkController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    createRecipientsInBulk: useCases.campaigns.createRecipientsInBulk,
});

const makeSendCampaignController = require('./send-campaign');
const sendCampaignController = makeSendCampaignController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    sendCampaign: useCases.campaigns.sendCampaign,
});

const makeGetCampaignStatusController = require('./get-campaign-status');
const getCampaignStatusController = makeGetCampaignStatusController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    getCampaignStatus: useCases.campaigns.getCampaignStatus,
});

const makeUpdateCampaignStatusController = require('./update-campaign-status');
const updateCampaignStatusController = makeUpdateCampaignStatusController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    updateCampaignStatus: useCases.campaigns.updateCampaignStatus,
});


// Create Controller Object
module.exports = Object.freeze({
    createCampaignController,
    createRecipientsInBulkController,
    sendCampaignController,
    getCampaignStatusController,
    updateCampaignStatusController,
});
