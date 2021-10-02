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

  it("Players can buy tickets and raffle can start", async () => {
    const program = anchor.workspace.Lottery;

    let player1 = anchor.web3.Keypair.generate();
    let player2 = anchor.web3.Keypair.generate();
    let lottery = anchor.web3.Keypair.generate();

    let startingAmount = 200000000000;
    let ticketPrice = 123


    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player1.publicKey, startingAmount)
      , "confirmed");
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player2.publicKey, startingAmount)
      , "confirmed");

      
    await program.rpc.initialize({
      accounts: {
        lottery: lottery.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }
    });

    await program.rpc.buyTicket(new anchor.BN(ticketPrice), {
      accounts: {
        buyer: player1.publicKey,
        lottery: lottery.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }
    });
    
    await program.rpc.buyTicket(new anchor.BN(ticketPrice), {
      accounts: {
        buyer: player2.publicKey,
        lottery: lottery.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      }
    });

    const player1Account = await provider.connection.getAccountInfo(player1.publicKey);
    const player2Account = await provider.connection.getAccountInfo(player2.publicKey);

    assert.equal(player1Account.lamports, startingAmount - ticketPrice);
    assert.equal(player2Account.lamports, startingAmount + 2 * ticketPrice);
  });
});
