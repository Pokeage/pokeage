//! `pokeage sim`: runs the local economy projection and prints a daily table.
//! pure local, no rpc.

use anyhow::Result;

use crate::economy::{self as e, DailyProfile};

/// runs project() and renders a projection table plus totals.
pub fn run(days: u32, users: u64) -> Result<()> {
    let profile = DailyProfile::default();
    let proj = e::project(days, users, profile)?;

    println!("pokeage economy projection");
    println!("  horizon          {} days", proj.days);
    println!("  daily active     {} users", proj.daily_active);
    println!();
    println!("per-user daily profile (defaults)");
    println!("  deploy share     {:.0}% of actives/day", profile.deploy_share * 100.0);
    println!("  catches          {} common, {} rare, {} legendary", profile.catches_common, profile.catches_rare, profile.catches_legendary);
    println!("  gym runs         {}/day", profile.gym_runs);
    println!("  force evolves    {}/1000 actives/day", profile.force_evolves_per_1000);
    println!();

    let daily = proj.rows.first().expect("non-zero days guaranteed by project()");
    println!("daily totals (constant under flat actives)");
    println!("  sink             {} $PAGE", e::fmt_page(daily.daily_sink));
    println!("  burn (70%)       {} $PAGE", e::fmt_page(daily.daily_burn));
    println!("  pool (30%)       {} $PAGE", e::fmt_page(daily.daily_pool));
    println!();

    // pick a sampling stride so long horizons stay readable.
    let stride = sample_stride(proj.days);
    println!("{:>5}  {:>16}  {:>16}  {:>18}  {:>18}", "day", "burn/day", "pool/day", "cum burn", "cum pool");
    println!("{:>5}  {:>16}  {:>16}  {:>18}  {:>18}", "---", "----------------", "----------------", "------------------", "------------------");

    for row in &proj.rows {
        let is_last = row.day == proj.days;
        if row.day % stride == 0 || row.day == 1 || is_last {
            println!(
                "{:>5}  {:>16}  {:>16}  {:>18}  {:>18}",
                row.day,
                e::fmt_page(row.daily_burn),
                e::fmt_page(row.daily_pool),
                e::fmt_page(row.cum_burn),
                e::fmt_page(row.cum_pool),
            );
        }
    }
    println!();

    println!("horizon totals");
    println!("  total sink       {} $PAGE", e::fmt_page(proj.total_sink));
    println!("  total burned     {} $PAGE", e::fmt_page(proj.total_burn));
    println!("  pool accrued     {} $PAGE", e::fmt_page(proj.total_pool));
    println!();
    println!("note pool accrual is in $PAGE at 30% of every sink. sol-denominated");
    println!("buyback capacity depends on the live floor, see `pokeage pool`.");

    Ok(())
}

/// rows to skip between printed lines so the table stays compact.
fn sample_stride(days: u32) -> u32 {
    match days {
        0..=14 => 1,
        15..=60 => 5,
        61..=180 => 15,
        181..=400 => 30,
        _ => 90,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stride_grows_with_horizon() {
        assert_eq!(sample_stride(7), 1);
        assert_eq!(sample_stride(30), 5);
        assert_eq!(sample_stride(90), 15);
        assert_eq!(sample_stride(365), 30);
        assert_eq!(sample_stride(1000), 90);
    }
}
