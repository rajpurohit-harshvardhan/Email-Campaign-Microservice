const ValidationError = require('../../exceptions/validation.error');
const ForbiddenError = require('../../exceptions/forbidden.error');
const AuthorizationFailed = require('../../exceptions/authorization-failed.error');

const _ = require('lodash');
const Joi = require('@hapi/joi');

const dbs = require('../../data-access')


const makeGetUsersByLinkname = require('./get-users-by-linkname');
const getUsersByLinkname = makeGetUsersByLinkname({
    Joi,
    ValidationError,
    usersDb: dbs.usersDb,
});

const makeValidateUserPermissions = require('./validate-user-permissions');
const validateUserPermissions = makeValidateUserPermissions({
    Joi,
    ValidationError,
    ForbiddenError,
    AuthorizationFailed,
    usersDb: dbs.usersDb,
});


const makeCreateUser = require('./create-user');
const createUser = makeCreateUser({
    Joi,
    ValidationError,
    validateUserPermissions,
    usersDb: dbs.usersDb,
});

const makeUpdateUserById = require('./update-user-by-id');
const updateUserById = makeUpdateUserById({
    Joi,
    ValidationError,
    validateUserPermissions,
    usersDb: dbs.usersDb,
});

const makeDeleteUserById = require('./delete-user-by-id');
const deleteUserById = makeDeleteUserById({
    Joi,
    ValidationError,
    validateUserPermissions,
    usersDb: dbs.usersDb,
});


// Create Controller Object
module.exports = Object.freeze({
    getUsersByLinkname,
    createUser,
    updateUserById,
    validateUserPermissions,
    deleteUserById,
});

