const formatResponse = require('../format-response').formatResponse;
const formatError = require('../format-response').formatError;
const ValidationError = require('../../exceptions/validation.error');
const ForbiddenError = require('../../exceptions/forbidden.error');
const _ = require('lodash');
const Joi = require('@hapi/joi');

// Import useCases
const useCases = require('../../usecases');

const makeSendEmailController = require('./send-email');
const sendEmailController = makeSendEmailController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    sendEmail: useCases.emails.sendEmail,
});

const makeGetEmailsByLinknameAndUserIdController = require('./get-emails-by-linkname-and-userId');
const getEmailsByLinknameAndUserIdController = makeGetEmailsByLinknameAndUserIdController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    getEmailsByLinknameAndUserId: useCases.emails.getEmailsByLinknameAndUserId,
});

const makeDeleteEmailByIdController = require('./delete-email-by-id');
const deleteEmailByIdController = makeDeleteEmailByIdController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    deleteEmailById: useCases.emails.deleteEmailById,
});

// Create Controller Object
module.exports = Object.freeze({
    sendEmailController,
    getEmailsByLinknameAndUserIdController,
    deleteEmailByIdController,
});
