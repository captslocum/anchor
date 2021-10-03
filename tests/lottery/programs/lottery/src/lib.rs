use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const TOTAL_TICKETS: u64 = 2;
const TICKET_PRICE: u64 = 50;

#[program]
pub mod lottery {
    use super::*;
    use anchor_lang::solana_program::{program::{invoke, invoke_signed}, system_instruction};
    pub fn initialize(ctx: Context<Initialize>, lottery_bump: u8) -> ProgramResult {
        ctx.accounts.lottery.bump = lottery_bump;
        ctx.accounts.lottery.tickets_remaining = TOTAL_TICKETS;
        ctx.accounts.lottery.winner = -1;
        Ok(())
    }

    #[access_control(tickets_left(&ctx.accounts.to))]
    pub fn buy_ticket(ctx: Context<BuyTicket>) -> ProgramResult {
        let ix = system_instruction::transfer(
            ctx.accounts.from.key,
            ctx.accounts.to.to_account_info().key,
            TICKET_PRICE,
        );
        invoke(
            &ix,
            &[
                ctx.accounts.from.to_account_info(),
                ctx.accounts.to.to_account_info(),
            ],
        )?;
        let lottery = &mut ctx.accounts.to;
        let index = lottery.tickets_remaining - 1;
        lottery.entrants[index as usize] = *ctx.accounts.from.key;
        lottery.tickets_remaining -= 1;

        if lottery.tickets_remaining == 0 {
            // start raffle
            // let winner: Option<Pubkey> = Some(lottery.entrants[1]);
            // lottery.winner = Some(lottery.entrants[1]);

             //pretend this is a random number
            lottery.winner = 1;
        }

        Ok(())
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> ProgramResult {
        let prize_pool = TICKET_PRICE * TOTAL_TICKETS;
        let lottery = &mut ctx.accounts.lottery;
        let winner = lottery.entrants[lottery.winner as usize];
        let seeds = &[
            ctx.accounts.lottery_id.to_account_info().key.as_ref(),
            &[lottery.bump],
        ];
        let signer = &[&seeds[..]];
        // if ctx.accounts.claimer.key.to_bytes() == winner.to_bytes() {
            let ix = system_instruction::transfer(
                ctx.accounts.lottery.to_account_info().key,
                ctx.accounts.claimer.to_account_info().key,
                prize_pool,
            );
            invoke_signed(
                &ix,
                &[
                    ctx.accounts.lottery.to_account_info(),
                    ctx.accounts.claimer.to_account_info(),
                ],
                signer,
            )?;
        // }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(lottery_bump: u8)]
pub struct Initialize<'info> {
    payer: Signer<'info>,
    lottery_id: Signer<'info>,
    #[account(init, seeds = [lottery_id.key.as_ref()], bump = lottery_bump, payer = payer, space = 64 + 32 + 8)]
    lottery: Account<'info, Lottery>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    from: Signer<'info>,
    #[account(mut)]
    to: Account<'info, Lottery>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    claimer: Signer<'info>,
    lottery_id: AccountInfo<'info>,
    #[account(mut)]
    lottery: Account<'info, Lottery>,
    system_program: Program<'info, System>,
}

#[account]
pub struct Lottery {
    tickets_remaining: u64,
    // entrants: [Pubkey; TOTAL_TICKETS as usize],
    entrants: [Pubkey; 2],
    // winner: Option<Pubkey>,
    winner: i64,
    bump: u8,
}

#[error]
pub enum ErrorCode {
    #[msg("Tickets are all sold out.")]
    NoTicketsLeft,
}

fn tickets_left(lottery: &Lottery) -> Result<()> {
    if lottery.tickets_remaining == 0 {
        return Err(ErrorCode::NoTicketsLeft.into());
    }
    Ok(())
}
