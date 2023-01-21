require("dotenv").config();
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar } = require("@hashgraph/sdk");
const { receive } = require("./receiver");
const {send} = require("./sender");

async function main() {
    if (process.argv[2] === "receive") {
        const fileId = process.argv[3]
        await receive(fileId)
    } else if (process.argv[2] === "send") {
        const filePath = process.argv[3]
        await send(filePath)
    } else {
        console.log("Please enter a valid input for the command line driver...");
    }
}

main();
