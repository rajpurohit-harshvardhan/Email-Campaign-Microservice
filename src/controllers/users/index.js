const formatResponse = require('../format-response').formatResponse;
const formatError = require('../format-response').formatError;
const ValidationError = require('../../exceptions/validation.error');
const ForbiddenError = require('../../exceptions/forbidden.error');
const _ = require('lodash');
const Joi = require('@hapi/joi');

// Import useCases
const useCases = require('../../usecases');

const makeGetUsersByLinknameController = require('./get-users-by-linkname');
const getUsersByLinknameController = makeGetUsersByLinknameController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    getUsersByLinkname: useCases.users.getUsersByLinkname,
});

const makeCreateUserController = require('./create-user');
const createUserController = makeCreateUserController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    createUser: useCases.users.createUser,
});

const makeUpdateUserByIdController = require('./update-user-by-id');
const updateUserByIdController = makeUpdateUserByIdController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    updateUserById: useCases.users.updateUserById,
});

const makeDeleteUserByIdController = require('./delete-user-by-id');
const deleteUserByIdController = makeDeleteUserByIdController({
    Joi,
    formatError,
    formatResponse,
    ValidationError,
    deleteUserById: useCases.users.deleteUserById,
});

// Create Controller Object
module.exports = Object.freeze({
    getUsersByLinknameController,
    createUserController,
    updateUserByIdController,
    deleteUserByIdController,
});
