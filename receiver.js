const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileContentsQuery, FileInfoQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function receive(fileId) {
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

    //Create the query
    const query = new FileContentsQuery()
        .setFileId(fileId);

    //Sign with client operator private key and submit the query to a Hedera network
    const contents = (await query.execute(client)).toString();
    
    const splitIdx = contents.indexOf("\n\n");
    const fileName = "download-" + contents.substring(0, splitIdx);
    // Increment the index by 2 to skip both \n chars
    const fileContent = contents.substring(splitIdx + 2);

    console.log("Title::\n" + fileName);
    console.log("contents::\n" + fileContent);

    const fileInfoQuery = new FileInfoQuery()
        .setFileId(fileId);

    const getInfo = await fileInfoQuery.execute(client);
    console.log("File info response: " + getInfo.size);
    
    return [fileName, fileContent];
}

module.exports = {
    receive,
}
