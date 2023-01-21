require("dotenv").config();
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileAppendTransaction
} = require("@hashgraph/sdk");
const fs = require('fs');

async function send(fileName, contents) {
    
    console.log(fileName);
    console.log(contents);
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // 5000 kilobits / 8 to get number of kilobytes
    const chunkSize = Math.floor(5000 / 8);
    let startPointer = 0;
    const endPointer = Buffer.byteLength(contents, 'utf8');
    const chunks = [];

    while (startPointer < endPointer){
        let newStartPointer = startPointer + chunkSize;
        chunks.push(contents.slice(startPointer, newStartPointer));
        startPointer = newStartPointer;
    }
    
    const fileNameHeader = `${fileName}\n\n`;
    // Create the transaction file with the file name as the first transaction
    const fileNameTransaction = await new FileCreateTransaction()
        .setKeys([newAccountPublicKey])
        .setContents(fileNameHeader)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

    const fileNameSignTx = await fileNameTransaction.sign(newAccountPrivateKey);
    const fileNameSubmitTx = await fileNameSignTx.execute(client);
    const fileNameTxnReceipt = await fileNameSubmitTx.getReceipt(client);
    
    console.log(fileNameTxnReceipt);
    console.log("The new file ID is: " + fileNameTxnReceipt.fileId);

    for (const chunk of chunks) {
        const transaction = await new FileAppendTransaction()
            .setFileId(fileNameTxnReceipt.fileId)
            .setContents(chunk)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);

        const signTx = await transaction.sign(newAccountPrivateKey);
        const txResponse = await signTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        console.log(receipt); 
    }
}

module.exports = {
    send,
}
