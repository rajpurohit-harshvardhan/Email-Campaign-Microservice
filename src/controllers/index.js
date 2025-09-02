const usersControllers = require('./users')
const emailsControllers = require('./emails')
const campaignsControllers = require('./campaigns')

// Export Controller
module.exports  = Object.freeze({
    users: usersControllers,
    emails: emailsControllers,
    campaigns: campaignsControllers,
});


