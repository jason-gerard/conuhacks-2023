require("dotenv").config();
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileAppendTransaction
} = require("@hashgraph/sdk");
const fs = require('fs');
const crypto = require("crypto");

async function send(fileName, contents) {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    const senderPrivateKey = new Uint8Array([121, 134, 128, 152, 243, 145, 121, 6, 111, 119,  69,  69,  52,  34,  87,  62, 62,  32,  96, 121,  57,  43, 239,  77, 124,  68, 116,  89,  97,  76, 185, 154]);
    const { privateKeySign, publicKeySign } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });
    crypto.createPrivateKey()
    console.log(privateKeySign)
    console.log(publicKeySign)

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const newAccountPrivateKey = PrivateKey.fromBytes(senderPrivateKey);
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const chunkSize = 1024;
    let startPointer = 0;

    // const sign = crypto.sign("SHA256", contents , crypto.createPrivateKey(Buffer.from(senderPrivateKey)));
    // console.log(crypto.verify("SHA256",contents, crypto.createPublicKey(Buffer.from(newAccountPublicKey.toBytes())), sign))


    const endPointer = Buffer.byteLength(contents, 'utf8');
    const chunks = [];

    while (startPointer < endPointer) {
        let newStartPointer = startPointer + chunkSize;
        chunks.push(contents.slice(startPointer, newStartPointer));
        startPointer = newStartPointer;
    }
    
    console.log(`Processing ${chunks.length} chunks`);
    
    const start = +new Date();
    // Create a new file for each chunk and store a list of the file ids in order
    let fileIds = [];
    const batchSize = 50;
    for (let i = 0; i < chunks.length / batchSize; i++) {
        const batchFileIds = await Promise.all(
            chunks
                .slice(i * batchSize, (i+1) * batchSize)
                .map(async (chunk) => {
                    const transaction = await new FileCreateTransaction()
                        .setKeys([newAccountPublicKey])
                        .setContents(chunk)
                        .setMaxTransactionFee(new Hbar(2))
                        .freezeWith(client);

                    const signTx = await transaction.sign(newAccountPrivateKey);
                    const submitTx = await signTx.execute(client);
                    const receipt = await submitTx.getReceipt(client);
                    return receipt.fileId.toString();
                })
        );
        console.log(batchFileIds);
        fileIds.push(batchFileIds);
    }

    fileIds = fileIds.flat();
    console.log(fileIds);
    
    const end = +new Date();
    console.log(`Time elapsed ${(end - start) / 1000} seconds`);
    
    // Create manifest file containing the file name and the in order list of file ids
    const fileNameHeader = `${fileName}\n\n`;
    const manifestFile = fileNameHeader + fileIds.join("\n");
    console.log(manifestFile);
    const manifestFileTransaction = await new FileCreateTransaction()
        .setKeys([newAccountPublicKey])
        .setContents(manifestFile)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

    const signTx = await manifestFileTransaction.sign(newAccountPrivateKey);
    const submitTx = await signTx.execute(client);
    const receipt = await submitTx.getReceipt(client);
    
    console.log(`Manifest file id: ${receipt.fileId.toString()}`);
}
send('test.json', "Hello world")

module.exports = {
    send,
}
