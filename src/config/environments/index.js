require('dotenv').config(); // load .env in dev/compose

const read = (v) => (v ?? '').trim();

const env=process.env.NODE_ENV?process.env.NODE_ENV:'development';
const config = require(`./${env}.js`).config;

config.cockroach.dbName=process.env.DB_NAME;
config.cockroach.username=process.env.DB_USERNAME;
config.cockroach.password=process.env.DB_PASSWORD;
config.smtps.brevo.auth.pass=process.env.BREVO_PASS;
config.smtps.gmail.username=process.env.GMAIL_USER;
config.smtps.gmail.client.id=process.env.GMAIL_CLIENT_ID;
config.smtps.gmail.client.secret=process.env.GMAIL_CLIENT_SECRET;
config.smtps.gmail.client.refreshToken=process.env.GMAIL_REFRESH_TOKEN;

module.exports=config;