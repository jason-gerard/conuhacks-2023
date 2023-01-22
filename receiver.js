const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, FileCreateTransaction,
    FileContentsQuery, FileInfoQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function receive(fileId) {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    const receiverPrivateKey = new Uint8Array([7,   7, 214, 120,  40, 128, 200,  13, 68, 197,  61, 203, 121,  50, 247, 221, 183, 155, 237,  87,  76, 210, 206, 117, 145,  83, 203, 251, 246, 223, 244, 191])

    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    //Create new keys
    const newAccountPrivateKey = PrivateKey.fromBytes(receiverPrivateKey);
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
