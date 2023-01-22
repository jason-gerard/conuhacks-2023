const Cryptify = require('cryptify');
const Blob = require('blob');
var fs = require('fs');
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");

// const filePath = './test.json'; // This can also be an array of paths.
// const password = "SAdwaefasf12";



async function encryptFile(filePath, password){
    const instance = new Cryptify(filePath, password, undefined, undefined, false, true);
    const encrypted = await instance.encrypt()
    return encrypted[0]

}

async function decryptFile(filePath, password){
    const instance = new Cryptify(filePath, password, undefined, undefined, false, true);
    const encrypted = await instance.decrypt()
    return encrypted[0]

}

async function encryptString(string, password){
    return CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
}

async function decryptString(string, password){

}

// encryptFile('./test.json', "SAdwaefasf1sdfsdfsdfsdf2").then(
//     (res) => {
//         // fs.writeFile('test.encrypted', res,  function (err) {
//         //     if (err) throw err;
//         //     console.log('Saved!');
//         // });
//         console.log(res)
//
//     }
// )
decryptFile('./test.json', "SAdwaefasf1sdfsdfsdfsdf2").then(
    (res) => {
        // fs.writeFile('test.encrypted', res,  function (err) {
        //     if (err) throw err;
        //     console.log('Saved!');
        // });
        console.log(res)

    }
)