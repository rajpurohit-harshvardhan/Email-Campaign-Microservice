let config;
config = {
    cockroach: {
        host: '127.0.0.1',
        port: 26257,
        dbName: '',
        username: '',
        password: '',
        poolSize: 10,
    },
    kafka: {
        host: '127.0.0.1',
        port: 9092,
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
    gcpStorage: {
        projectId: '',
        bucketName: '',
        keyFile: '',
    },
    redisQueues: {
        sendEmail: {
            topic: 'send-email'
        },
        sendCampaign: {
            topic: 'send-campaign'
        },
        campaignEmailSent: {
            topic: 'campaign-email-sent',
        }
    },
    smtps: {
        ethereal: {
            host: 'smtp.ethereal.email',
            port: 587,
        },
        brevo: {
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: {
                user: 'apikey',
                pass: '',
            },
        },
        gmail: {
            user: '',
            port: 587,
            client: {
                id: '',
                secret: '',
                refreshToken: '',
            },
        },
    }
};
module.exports = {config};
