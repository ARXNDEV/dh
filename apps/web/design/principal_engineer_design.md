# Digital Heroes: Principal Engineer Technical Design

## Phase 1: Advanced Data Architecture (Supabase & Stitch)

- **Database Schema**: Implemented in [003_principal_schema.sql](file:///Users/arunkumar/untitled%20folder/supabase/migrations/003_principal_schema.sql).
- **Rolling 5 Logic**: Automated via PostgreSQL trigger `trigger_rolling_five_v3` and function `orchestrate_rolling_five`. It replaces the oldest score with a new entry, ensuring only 5 scores exist per user.
- **Unique Date Constraint**: Enforced by a unique composite index on `(user_id, played_at)`.
- **Stitch Mapping**: Stitch orchestrates real-time subscription status from Stripe. It updates the `subscription_status` column in the `profiles` table. The `Active subscription required` RLS policy then blocks any `INSERT` on the `golf_scores` table for non-active users.

## Phase 2: The MCP "Engine" (Business Logic)

- **submit_score Tool**: Validates Stableford scores (1–45) and returns an "Impact Message" (e.g., "Your entry just contributed to [Charity Name]!").
- **run_draw_simulation Tool**: Implemented in [run_draw_simulation/route.ts](file:///Users/arunkumar/untitled%20folder/apps/web/app/api/mcp/run_draw_simulation/route.ts).
    - **Prize Pool**: Calculated as `(activeCount * 50) * 0.90` (10% charity cut).
    - **Splits**: 40/35/25 for 5, 4, and 3-number matches.
    - **Jackpot Rollover**: If no 5-match winners exist, the 40% value rolls into the next cycle.
    - **Admin Simulation**: Allows the Admin to preview the pool and winners before publishing.

## Phase 3: Standing Out (UI/UX & Scalability)

- **Non-Golf Design**:
    1.  **"Lives Touched" Ticker**: A live, animated counter showing the total community impact.
    2.  **"Purpose Path" Progress Bar**: Visualizes the journey from round submission to charity contribution.
    3.  **"Impact Receipt" Card**: Replaces traditional leaderboard cards with a breakdown of which lives were impacted by the user's play.
- **Multi-Country Scalability**:
    - The schema includes `region_code` and `currency_code` for both `charities` and `profiles`.
    - `draw_results` tracks currency, allowing for localized prize pools or regional charity regulations.
- **Winner Verification Workflow**:
    1.  **Winner Upload**: Winners are notified and prompted to upload a screenshot of their golf score via the dashboard (`proof_url` in `golf_scores`).
    2.  **Admin Review**: Admin reviews the proof in the "Winner Verification" dashboard.
    3.  **Status Update**: Upon approval, the `verification_status` in the `winners` table is set to `Approved`, triggering the payout orchestration.
