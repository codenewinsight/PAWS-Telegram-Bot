const fs = require("fs");
const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");

const tonweb = new TonWeb();

async function generateTonWallet(seedPhrase) {
    const isValid = await tonMnemonic.validateMnemonic(seedPhrase);
    if (!isValid) {
        console.error("Seed phrase invalid:", seedPhrase.join(" "));
        return null;
    }

    const keyPair = await tonMnemonic.mnemonicToKeyPair(seedPhrase);

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0,
    });

    return await wallet.getAddress();
}

async function processSeedPhrasesFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf-8");

        const seedPhrases = data.split("\n").filter(line => line.trim() !== "");

        fs.writeFileSync("wallet.txt", "");

        for (const seed of seedPhrases) {
            const seedPhrase = seed.trim().split(" ");
            const walletAddress = await generateTonWallet(seedPhrase);

            if (walletAddress) {
                const addressString = walletAddress.toString(true, true, false);
                console.log("Wallet Address:", addressString);

                fs.appendFileSync("wallet.txt", addressString + "\n");
            }
        }
    } catch (error) {
        console.error("Read file failed:", error);
    }
}

processSeedPhrasesFromFile("key.txt");
