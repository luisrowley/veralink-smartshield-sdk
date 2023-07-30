const fs = require('fs');
const request = require('request');
const SERVER_URL = process.env.REMOTE_PUBLIC_KEY_ENDPOINT_URL;
const secretToken = 'secret-token';

let publicKey;

/**
 * TODO: implement getSecretTokenWithCredentials function
 * that fetchs a valid token to be used for calls to proxy server
 */

const getPublicKey = async () => {
  try {
    publicKey = fs.readFileSync('public.key');
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        publicKey = await getPublicKeyFromRemoteServer();
        fs.writeFileSync('public.key', publicKey);
        console.log(publicKey);
      } catch (error) {
        console.error('Failed to get public key:', error);
        throw error;
      }
    }
  }
  return publicKey;
};

const getPublicKeyFromRemoteServer = () => {
  return new Promise((resolve, reject) => {
    try {
      request.post(SERVER_URL, {
        form: {
          token: secretToken
        },
      }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          reject(error);
          return;
        }
        console.log('publicKey:', JSON.parse(response.body).publicKey);
        const publicKey = JSON.parse(response.body).publicKey;
        resolve(publicKey);
      });
    } catch (error) {
      // console.log('Failed to obtain public key');
      // console.log('Error:', error);
      reject(error);
    }
  });
};

module.exports = { getPublicKey };
