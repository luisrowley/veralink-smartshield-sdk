const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const verifyRouter = require('./main/verifier/verify');
const authService = require('./main/authService');

const initializeListener = async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/veralink', verifyRouter);

    // get new public key from server if none exists
    await authService.getPublicKey();

    app.listen(3001, () => console.log('Server started on port 3001'));
}

module.exports = { initializeListener };