# Digital Heroes: Solutions Architecture - Phase 2

## Step 4: Stitch Orchestration (Stripe & Supabase)

To combine data from Stripe and Supabase into a single context for the MCP server, we use **Stitch** as the orchestration layer:

1.  **Identity Mapping**: Stitch maps the `stripe_customer_id` to the `supabase_user_id` using a centralized identity table.
2.  **Context Aggregation**: When an MCP tool (e.g., `process_score_entry`) is called, Stitch:
    -   Fetches the current subscription status from **Stripe** (via webhook or API).
    -   Fetches the user's current score count and charity ID from **Supabase**.
3.  **Unified Schema**: Stitch passes a unified JSON context to the MCP server:
    ```json
    {
      "user": {
        "id": "uuid",
        "subscription": { "active": true, "period_end": "timestamp" },
        "scores": { "count": 4, "last_played": "date" },
        "charity": { "id": "uuid", "impact_multiplier": 1.2 }
      }
    }
    ```

## Step 5: "Non-Golf" UI/UX Strategy

We avoid golf clichés by focusing on **Impact** and **Modernity**:

1.  **Charity Impact Progress Bar**: A rose-themed progress bar in the dashboard that visualizes the "Path to Next Life Impacted." It grows with every score entry.
2.  **Motion-Enhanced Draw Reveal**: A full-screen, high-contrast modal with `zoom-in` and `fade-in` animations. It reveals the prize pool numbers with a "matrix-style" countdown to avoid standard lottery visuals.
3.  **Lives Impacted Dashboard**: The primary metric is "Lives Impacted" (calculated based on total donations), shifting focus from "Payment Status" to "Human Value."

## Step 6: Edge Case Handling

### 1. Mid-Month Cancellation
-   **Logic**: Users who cancel mid-month remain **Active** in the draw until the end of their current billing period (`current_period_end`). 
-   **Enforcement**: The RLS policy and Stitch check the `subscription_status` AND the `period_end` date. Once the period expires, the user is removed from future draw eligibility.

### 2. Prize Tie-Breaks
-   **Logic**: If multiple users match the same amount of numbers (e.g., three 5-match winners), the split is calculated as: `(Pool_Percentage_Value / Winner_Count)`.
-   **Algorithm**:
    ```typescript
    const share = totalCurrentPool * splitPercentage;
    const perWinner = share / winners.length;
    // Distribution is handled as atomic transactions per winner
    ```
-   **Transparency**: Each winner receives a breakdown of the total pool and the number of other winners they shared it with.
