const express = require('express');
const app = express();
const PORT = 3000;

const responseEnhancer = require('./response-enhancer');
app.use(responseEnhancer);

const router = express.Router();

const { RestService } = require('./rest-service');
const restService = new RestService(router, console);
restService.start();

app.use(express.json());
app.use((req, res, next) => {
    req.logger = console;
    next();
});


// Define a basic route
app.get('/', async (req, res) => {
    console.info(`GET /`);
    res.send('Hello, Email Campaign Microservice!');
});


app.use('/', router)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

