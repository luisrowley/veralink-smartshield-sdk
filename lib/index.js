const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const request = require('request');
const ENV_VARS = require('../env/env-prod.js');
const SERVER_URL = ENV_VARS.REMOTE_PUBLIC_KEY_ENDPOINT_URL;

const initializeListener = async () => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    let publicKey;

    // get new public key from server if none exists
    try {
        publicKey = fs.readFileSync('public.key');
    } catch (err) {
        if (err.code === 'ENOENT') {
            try {
                publicKey = await getPublicKeyFromRemoteServer();
                fs.writeFileSync('public.key', publicKey);
                // verify the signature
                console.log(publicKey);
            } catch (error) {
                console.error('Failed to get public key:', error);
                return;
            }
        }
    }

    app.post('/veralink', (req, res) => {
        const urlToVerify = req.body.url;
        const signature = req.body.signature;
        let isSignatureValid = false;

        // get new public key from server if none exists
        try {
            // verify the signature
            console.log('verify the signature', publicKey);
            isSignatureValid = verifySignature(urlToVerify, signature, publicKey);
            console.log(isSignatureValid);

            // Check the result of the verification
            if (isSignatureValid) {
                console.log('OK!');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
            } else {
                // The signature is invalid
                res.end('Invalid signature.');
            }
        } catch (error) {
            console.error('Failed to get public key:', error);
            return;
        }

    });

    app.listen(3001, () => console.log('Server started on port 3001'));
}

const getPublicKeyFromRemoteServer = () => {
    // Request public key from remote server
    return new Promise((resolve, reject) => {
        try {
            request.get(SERVER_URL, (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    console.error('Failed to obtain public key');
                    console.error('Error:', error);
                    console.error('Status code:', response.statusCode);
                    reject(error);
                    return;
                }
                console.log('publicKey:', JSON.parse(response.body).publicKey);
                const publicKey = JSON.parse(response.body).publicKey;
                resolve(publicKey);
            });
        } catch (error) {
            console.log('Failed to obtain public key');
            console.log('Error:', error);
            reject(error);
        }
    });
}

function verifySignature(data, signature, publicKey) {
    // Create a verifier and update it with the URL
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.write(data);
    verifier.end();
    const isSignatureValid = verifier.verify(publicKey, signature, 'base64');
    if (!isSignatureValid) {
      console.log('Invalid signature');
      res.status(500).send('Invalid signature');
      return false;
    }
    return true;
}

module.exports = { initializeListener };