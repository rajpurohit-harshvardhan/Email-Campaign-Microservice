const controllers = require('./controllers')
const makeHttpCallback = require('./http-server-callback/http-callback');

class RestService {
    constructor(router, logger) {
        this.router = router;
        this.logger = logger;
    }

    start() {
        // this.router.get('/',
        //     makeHttpCallback({controller: controllers.greetAction}));
        // this.router.get('/health-check',
        //     makeHttpCallback({controller: controllers.greetAction}));
        this.users();
        this.emails();
        this.campaigns();

    }

    users() {
        this.router.get('/users',
            makeHttpCallback({controller: controllers.users.getUsersByLinknameController}));
        this.router.post('/users',
            makeHttpCallback({controller: controllers.users.createUserController}));
        this.router.put('/users/:id',
            makeHttpCallback({controller: controllers.users.updateUserByIdController}));
        this.router.delete('/users/:id',
            makeHttpCallback({controller: controllers.users.deleteUserByIdController}));
    }
    emails() {
        this.router.post('/emails/send',
            makeHttpCallback({controller: controllers.emails.sendEmailController}));
        this.router.get('/emails',
            makeHttpCallback({controller: controllers.emails.getEmailsByLinknameAndUserIdController}));
        this.router.delete('/emails/:id',
            makeHttpCallback({controller: controllers.emails.deleteEmailByIdController}));
    }

    campaigns() {
        this.router.post('/campaigns',
            makeHttpCallback({controller: controllers.campaigns.createCampaignController}));
        this.router.post('/campaigns/:id/recipients',
            makeHttpCallback({controller: controllers.campaigns.createRecipientsInBulkController}));
        this.router.post('/campaigns/:id/send',
            makeHttpCallback({controller: controllers.campaigns.sendCampaignController}));
        this.router.get('/campaigns/:id/status',
            makeHttpCallback({controller: controllers.campaigns.getCampaignStatusController}));
        this.router.put('/campaigns/:id/:status',
            makeHttpCallback({controller: controllers.campaigns.updateCampaignStatusController}));
    }

    getName() {
        return 'Email Campaign Micro service';
    }
}

module.exports = {RestService};
