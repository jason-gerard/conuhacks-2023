require("dotenv").config();
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileAppendTransaction
} = require("@hashgraph/sdk");
const fs = require('fs');

async function send(filePath) {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    //Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const contents = fs.readFileSync(filePath, 'utf8');
    
    //Create the transaction
    let transaction = await new FileCreateTransaction()
        .setKeys([newAccountPublicKey])
        .setContents(contents)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

    //Sign with the file private key
    let signTx = await transaction.sign(newAccountPrivateKey);

    //Sign with the client operator private key and submit to a Hedera network
    let submitTx = await signTx.execute(client);

    //Request the receipt
    let receipt = await submitTx.getReceipt(client);

    console.log(receipt);

    //Get the file ID
    let newFileId = receipt.fileId;

    console.log("The new file ID is: " + newFileId);

    //Create the transaction
    transaction = await new FileAppendTransaction()
        .setFileId(receipt.fileId)
        .setContents(contents)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

    //Sign with the file private key
    signTx = await transaction.sign(newAccountPrivateKey);

    //Sign with the client operator key and submit to a Hedera network
    txResponse = await signTx.execute(client);

    //Request the receipt
    receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    transactionStatus = receipt.status;

    console.log("The transaction consensus status is " +transactionStatus);
}

module.exports = {
    send,
}
