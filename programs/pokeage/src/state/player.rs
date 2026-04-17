//! per-player progress account. badges packed into a 12-bit mask.

use anchor_lang::prelude::*;

#[account]
pub struct PlayerState {
    pub owner: Pubkey,
    pub agent_deployed: bool,
    pub total_caught: u64,
    pub gym_wins: u32,
    pub badges: u16,
    pub last_action: i64,
    pub bump: u8,
}

impl PlayerState {
    // 8 disc + 32 owner + 1 bool + 8 u64 + 4 u32 + 2 u16 + 8 i64 + 1 bump
    pub const LEN: usize = 8 + 32 + 1 + 8 + 4 + 2 + 8 + 1;

    /// true when badge i is owned. out-of-range index reads as false.
    pub fn has_badge(&self, i: u8) -> bool {
        if i >= 12 {
            return false;
        }
        self.badges & (1u16 << i) != 0
    }

    /// flips badge i on. caller validates range before calling.
    pub fn set_badge(&mut self, i: u8) {
        if i < 12 {
            self.badges |= 1u16 << i;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn blank() -> PlayerState {
        PlayerState {
            owner: Pubkey::default(),
            agent_deployed: false,
            total_caught: 0,
            gym_wins: 0,
            badges: 0,
            last_action: 0,
            bump: 0,
        }
    }

    #[test]
    fn badge_set_and_read() {
        let mut p = blank();
        assert!(!p.has_badge(0));
        p.set_badge(0);
        p.set_badge(11);
        assert!(p.has_badge(0));
        assert!(p.has_badge(11));
        assert!(!p.has_badge(5));
    }

    #[test]
    fn out_of_range_badge_is_noop() {
        let mut p = blank();
        p.set_badge(12);
        p.set_badge(200);
        assert_eq!(p.badges, 0);
        assert!(!p.has_badge(12));
    }
}
