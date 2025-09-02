const nodemailer = require('nodemailer');
const config = require ('../config/environments');

async function main({transporterName}) {
    let transporter;
    if (!transporterName || transporterName === 'test') {
        transporter = await testTransporter();
    }

    if (transporterName === 'google' || transporterName === 'gmail') {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: config.smtps.gmail.user,
                clientId: config.smtps.gmail.client.id,
                clientSecret: config.smtps.gmail.client.secret,
                refreshToken: config.smtps.gmail.client.refreshToken,
            },
        }, {logger: true, debug: true});
    } else if (transporterName === 'brevo') {
        transporter = nodemailer.createTransport({
            host: config.smtps.brevo.host,
            port: config.smtps.brevo.port,
            secure: false,
            auth: {
                user: config.smtps.brevo.auth.user,
                pass: config.smtps.brevo.auth.user,
            },
        }, {logger: true, debug: true});
    }

    await transporter.verify();
    console.log("Transporter is ready!");
    return transporter;
}

async function testTransporter() {
    let testAccount = await nodemailer.createTestAccount(); // creates an ethereal account

    return nodemailer.createTransport({
        host: config.smtps.ethereal.host,
        port: config.smtps.ethereal.port,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

module.exports = main;
