const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ENV_VARS = require('../env/env-prod.js');
const SERVER_URL = ENV_VARS.REMOTE_PUBLIC_KEY_ENDPOINT_URL;

function initializeListener() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/veralink', (req, res) => {
        const urlToVerify = req.body.url;
        const signature = req.body.signature;

        // get new public key from server if none exists
        const publicKey = getPublicKeyFromRemoteServer(request);

        // Save public key to local file system
        fs.writeFileSync('public.key', publicKey);

        // verify the signature
        const isSignatureValid = verifySignature(urlToVerify, signature, publicKey);
        
        // Check the result of the verification
        if (isSignatureValid) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
        } else {
            // The signature is invalid
            res.end('Invalid signature.');
        }

    });

    app.listen(3001, () => console.log('Server started on port 3001'));
}

function getPublicKeyFromRemoteServer(request) {
    let publicKey;
    try {
        publicKey = fs.readFileSync('public.key');
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Request public key from remote server
            request.get(SERVER_URL, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                console.log('Failed to obtain public key');
                return;
            }
            publicKey = body;
            });
        }
    }
    return publicKey;
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
    // console.log(`URL redirect: ${urlToVerify}`);
    // res.redirect(urlToVerify);
}

module.exports = { initializeListener };