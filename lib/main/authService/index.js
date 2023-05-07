const fs = require('fs');
const request = require('request');
const ENV_VARS = require('../../../env/env-prod.js');
const SERVER_URL = ENV_VARS.REMOTE_PUBLIC_KEY_ENDPOINT_URL;

let publicKey;

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
      request.get(SERVER_URL, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          // console.error('Failed to obtain public key');
          // console.error('Error:', error);
          // console.error('Status code:', response.statusCode);
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
