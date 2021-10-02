use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod lottery {
    use super::*;
    // use anchor_lang::solana_program::{
    //     program::{invoke, invoke_signed},
    //     system_instruction,
    // };
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, amount: u64) -> ProgramResult {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.from.key,
            ctx.accounts.to.key,
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.from.to_account_info(),
                ctx.accounts.to.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn raffle(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Check's token vault.
    #[account(mut)]
    vault: AccountInfo<'info>,
    // Program derived address for the check.
    check_signer: AccountInfo<'info>,
    // Token account the check is made from.
    // #[account(mut, has_one = owner)]
    // from: Account<'info, TokenAccount>,
    // // Token account the check is made to.
    // #[account(constraint = from.mint == to.mint)]
    // to: Account<'info, TokenAccount>,
    // // Owner of the `from` token account.
    // owner: AccountInfo<'info>,
    // token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    from: Signer<'info>,
    #[account(mut)]
    to: AccountInfo<'info>,
    system_program: Program<'info, System>,
}
