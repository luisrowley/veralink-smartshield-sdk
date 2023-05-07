const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authService = require('../authService');

router.post('/', async (req, res) => {
    const urlToVerify = req.body.url;
    const signature = req.body.signature;
    const publicKey = await authService.getPublicKey();
    let isSignatureValid = false;

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

module.exports = router;