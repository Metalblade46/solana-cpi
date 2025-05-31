import { LiteSVM } from "litesvm";
import { test, expect } from "bun:test"
import path from "path"
import {
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

test("one transfer", () => {
    const svm = new LiteSVM();
    const contractKeypair = Keypair.generate();
    svm.addProgramFromFile(contractKeypair.publicKey, path.join(__dirname, "sol-counter.so"));
    const payer = new Keypair();
    svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
    const receiver = PublicKey.unique();
    const blockhash = svm.latestBlockhash();
    const transferLamports = 1_000_000n;
    const ixs = [
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: receiver,
            lamports: transferLamports,
        }),
    ];
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.add(...ixs);
    tx.sign(payer);
    svm.sendTransaction(tx);
    const balanceAfter = svm.getBalance(receiver);
    expect(balanceAfter).toBe(transferLamports);
});