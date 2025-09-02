const _ = require('lodash');
const config = require('../config/environments');
const cheerio = require('cheerio');

const { Worker } = require('bullmq');
const { attachWorkerLogging } = require('./job-logs');
const { campaignEmailSentQueue} = require('./initialize-queues');


const createTransporter = require('../utils/node-mailer-util');

const dbs = require('../data-access');
const {emails} = require('../usecases');
const moment = require("moment-timezone");

function startEmailWorker() {
    const connection = {
        host: config.redis.host,
        port: config.redis.port,
        // password: config.redis.password,
    };

    const worker = new Worker(
        config.redisQueues.sendEmail.topic,
        processEmailJob,
        { connection }
    );

    // all logging for this worker (+ QueueEvents)
    const { queueEvents } = attachWorkerLogging(worker, { connection });

    // expose for graceful shutdown
    async function close() {
        try { await worker.close(); } catch {}
        try { await queueEvents?.close(); } catch {}
    }

    return { worker, queueEvents, close };
}

async function processEmailJob(job) {
    const {linkname, userId, emailObj, campaignObj} = job.data;
    console.log(`Processing ${job.name} job for linkname: ${linkname}, userId: ${userId},
     emailObj: ${JSON.stringify(emailObj)}, campaignObj: ${JSON.stringify(campaignObj)}`);

    const folderObj = {};
    const folders = await dbs.emailFoldersDb.getEmailFoldersByLinknameAndUserId({linkname, userId});
    _.forEach(folders, (folder) => {
        folderObj[folder.name] = folder.id;
    });
    emailObj['folderId'] = folderObj['OUTBOX'];

    const $ = cheerio.load(emailObj.body.content);
    emailObj.body['text'] = $('body').text();

    // make entries in DB
    const emailId = await emails.createEmailInSystem({linkname, userId, emailObj});

    let to = [];
    _.forEach(emailObj.to, (recipient) => {
        to.push(recipient.email);
    });

    let cc = [];
    if ('cc' in emailObj) {
        _.forEach(emailObj.cc, (recipient) => {
            cc.push(recipient.email);
        });
    }

    let bcc = [];
    if ('bcc' in emailObj) {
        _.forEach(emailObj.bcc, (recipient) => {
            bcc.push(recipient.email);
        });
    }

    const emailLog = {
        linkname, emailId,
        isDelivered: false,
        status: 'queued',
        error: null,
        providerMessageId: null,
        sentAt: null,
    }

    try {
        // send email
        const transporter = await createTransporter({transporterName: 'gmail'});

        const result = await transporter.sendMail({
            from: emailObj.from.email, // sender address
            to, cc, bcc, // list of receivers
            subject: emailObj.subject, // Subject line
            text: emailObj.body.text, // plain text body
            html: emailObj.body.content, // html body
            replyTo: emailObj.replyTo,
        });

        // console.info(result, responseStatus);
        const responseStatus = result.response.split(' ')[0];
        if (responseStatus >= 200 && responseStatus < 300) {
            await dbs.emailsDb.updateEmailById({id: emailId, valuesToUpdate: {
                    'folder_id': folderObj['SENT'],
                    'message_id': result.messageId,
                    'updated_at': new Date(),
                }});

            emailLog.isDelivered = true;
            emailLog.status='sent';
            emailLog.sentAt = moment().utc().format();
            emailLog.providerMessageId = result.messageId;
        }
    } catch (e) {
        console.error(`Error while sending email for linkname: ${linkname}, userId: ${userId} ; error: ${e.message}`);
        emailLog.error = e.message;
        emailLog.status='error';
    }

    // creating an emailLog with the necessary details
    await dbs.emailLogsDb.createEmailLog(emailLog);

     if (!!campaignObj) {
         return await campaignEmailSentQueue.add(config.redisQueues.campaignEmailSent.topic, {
             linkname,
             userId,
             emailObj: {id: emailId, messageId: emailLog.providerMessageId || null},
             campaignObj,
         }, {
             attempts: 3,
             backoff: 10000, // retry after 10s
             removeOnComplete: true
         });
     }
}

const { close } = startEmailWorker();

const stop = async () => {
    await close();
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
