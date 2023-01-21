const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileContentsQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

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
        .setFileId("0.0.49364027");

    //Sign with client operator private key and submit the query to a Hedera network
    const contents = await query.execute(client);

    console.log(contents.toString());
}

main();
