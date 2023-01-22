require("dotenv").config();
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileAppendTransaction
} = require("@hashgraph/sdk");
const fs = require('fs');

async function send(fileName, contents) {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const chunkSize = 1024;
    let startPointer = 0;
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

module.exports = {
    send,
}
