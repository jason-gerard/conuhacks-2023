const crypto = require('crypto');
const buffer = require('buffer');
const {sign} = require("crypto");
const CryptoJS = require("crypto-js");

const secretKey="CryptifyLOL";


async function signAndEncrypt(content){
    // Create a private key
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });

    const data = Buffer.from(content);

    // Sign the data and returned signature in buffer
    const signature = crypto.sign("SHA256", data , privateKey);

    // Convert returned buffer to base64
    // const signature = sign.toString('base64');

    // encrypt the data
    const encrypted = CryptoJS.AES.encrypt(content, secretKey);
    return {"publicKey": publicKey, "Signature": signature, "encryptedData": encrypted}

}

function decryptAndValidate(publicKey, sign, encrypted){
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, secretKey)
    const plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);
    const isValid = crypto.verify("SHA256",Buffer.from(plaintext), publicKey, sign)

    return {"data": plaintext, "valid": isValid}
}


signAndEncrypt("dsfdsfsdfsdfdsdfsfweeeeeee").then(
    (res) => {
    const {data, isValid} = decryptAndValidate(res.publicKey, res.Signature, res.encryptedData);
    console.log(data);
    console.log(isValid);
    }
)




