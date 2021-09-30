const anchor = require('@project-serum/anchor');
const assert = require("assert");

describe('lottery', () => {

    // Use a local provider.
  const provider = anchor.Provider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  // it('Is initialized!', async () => {
  //   // Add your test here.
  //   const program = anchor.workspace.Lottery;
  //   const tx = await program.rpc.initialize();
  //   await program.rpc.createCheck(new anchor.BN(100), "Hello world", nonce, {
  //     accounts: {
  //       vault: vault.publicKey,
  //       from: god,
  //       to: receiver,
  //       owner: program.provider.wallet.publicKey,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     },
  //     signers: [check, vault],
  //     instructions: [
  //       await program.account.check.createInstruction(check, 300),
  //       ...(await serumCmn.createTokenAccountInstrs(
  //         program.provider,
  //         vault.publicKey,
  //         mint,
  //         checkSigner
  //       )),
  //     ],
  //   });
  //   console.log("Your transaction signature", tx);
  // });

  it("Can tranfer lamports", async () => {
    const program = anchor.workspace.Lottery;

    let from = anchor.web3.Keypair.generate();
    let to = anchor.web3.Keypair.generate();

    let startingAmount = 200000000000;
    let transferAmount = 123


    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(from.publicKey, startingAmount)
      , "confirmed");
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(to.publicKey, startingAmount)
      , "confirmed");


    await program.rpc.buyTicket(new anchor.BN(transferAmount), {
      accounts: {
        from: from.publicKey,
        to: to.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [from]
    });

    const fromAccount = await provider.connection.getAccountInfo(from.publicKey);
    const toAccount = await provider.connection.getAccountInfo(to.publicKey);

    assert.equal(fromAccount.lamports, startingAmount - transferAmount);
    assert.equal(toAccount.lamports, transferAmount + startingAmount);
  });
});
