const usersUsecases = require('./users')
const emailsUsecases = require('./emails')
const campaignsUsecases = require('./campaigns')

// Create Controller Object
module.exports = Object.freeze({
    users: usersUsecases,
    emails: emailsUsecases,
    campaigns: campaignsUsecases
});
