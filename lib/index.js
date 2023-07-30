require('dotenv').config({ path: `env/.env.${process.env.NODE_ENV}` });
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const verifyRouter = require('./main/verifier/verify');
const authService = require('./main/authService');

const ENV_DEV = true;

const initializeListener = async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/veralink', verifyRouter);

    // get new public key from server if none exists
    await authService.getPublicKey();

    // Route handler for the root route
    if (ENV_DEV) {
        app.get('/', (req, res) => {
            res.send('Hello, World!');
        });
    }

    app.listen(3001, () => console.log('Server started on port 3001'));
}

module.exports = { initializeListener };