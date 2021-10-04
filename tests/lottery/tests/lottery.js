const anchor = require('@project-serum/anchor');
const assert = require("assert");

describe('lottery', () => {

  // Use a local provider.
  const provider = anchor.Provider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Lottery;
  const lotteryID = anchor.web3.Keypair.generate();

  let lottery, lotteryBump;
  const ticketAmount = 2

  before(async () => {
    const [_lottery, _lotteryBump] = await anchor.web3.PublicKey.findProgramAddress(
      [lotteryID.publicKey.toBuffer()],
      program.programId
    );
    lottery = _lottery;
    lotteryBump = _lotteryBump;

    await program.rpc.initialize(
      new anchor.BN(lotteryBump),
      {
        accounts: {
          payer: provider.wallet.payer.publicKey,
          lotteryId: lotteryID.publicKey,
          lottery: lottery,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [lotteryID]
      }
    );

  });


  it('Is initialized!', async () => {
    const lotteryAccount = await program.account.lottery.fetch(lottery);
    assert.equal(lotteryAccount.ticketsRemaining, ticketAmount);
    const lotteryAccountInfo = await provider.connection.getAccountInfo(lottery);
  });

  it("Players can buy tickets and raffle starts when last ticket sold", async () => {
    const program = anchor.workspace.Lottery;

    let player1 = anchor.web3.Keypair.generate();
    let player2 = anchor.web3.Keypair.generate();

    let startingAmount = 200000000000;
    let ticketPrice = 50; 


    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player1.publicKey, startingAmount)
      , "confirmed");
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player2.publicKey, startingAmount)
      , "confirmed");

    await program.rpc.buyTicket({
      accounts: {
        buyer: player1.publicKey,
        lottery: lottery,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [player1]
    });

    await program.rpc.buyTicket({
      accounts: {
        buyer: player2.publicKey,
        lottery: lottery,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [player2]
    });

    const player1Account = await provider.connection.getAccountInfo(player1.publicKey);
    let player2Account = await provider.connection.getAccountInfo(player2.publicKey);

    assert.equal(player1Account.lamports, startingAmount - ticketPrice);
    assert.equal(player2Account.lamports, startingAmount - ticketPrice);

    await program.rpc.claimPrize({
      accounts: {
        claimer: player2.publicKey,
        lottery: lottery,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [player2]
    });

    player2Account = await provider.connection.getAccountInfo(player2.publicKey);
    assert.equal(player2Account.lamports, startingAmount + ticketPrice);
  });
});
