const crypto = require('crypto');
const buffer = require('buffer');
const {sign} = require("crypto");


function signAndReturn(content){
    // Create a private key
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });

    const data = Buffer.from(content);

    // Sign the data and returned signature in buffer
    const sign = crypto.sign("SHA256", data , privateKey);

    return (publicKey, sign)

    // Convert returned buffer to base64
    const signature = sign.toString('base64');
    console.log(signature)
    console.log(crypto.verify("SHA256",data, publicKey, sign))

    return (publicKey, sign)
}
signAndReturn("dsfdsfsdfsdfds")

