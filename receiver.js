const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileContentsQuery, FileInfoQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function receive(fileId) {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const query = new FileContentsQuery()
        .setFileId(fileId);
    const response = (await query.execute(client)).toString();

    const splitIdx = response.indexOf("\n\n");
    // Get file name
    const fileName = "download-" + response.substring(0, splitIdx);
    console.log("Title::\n" + fileName);
    // Get list of file ids in order
    // Increment the index by 2 to skip both \n chars
    const fileIds = response
        .substring(splitIdx + 2)
        .split("\n");
    console.log("contents::\n" + fileIds);
    
    const batchContents = [];
    const batchSize = 50;
    for (let i = 0; i < fileIds.length / batchSize; i++) {
        // Promise.all and fetch contents for each file chunk
        const chunkContent = await Promise.all(
            fileIds
                .slice(i * batchSize, (i+1) * batchSize)
                .map(async (id) => {
                    const query = new FileContentsQuery()
                        .setFileId(id);

                    return (await query.execute(client)).toString();
                })
        );
        console.log(chunkContent);
        batchContents.push(chunkContent);
    }

    // Concatenate chunks into single file with file name
    const fileContent = batchContents.flat().join();
    console.log(fileContent);

    return [fileName, fileContent];
}

module.exports = {
    receive,
}
