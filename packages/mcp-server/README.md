# Digital Heroes MCP Server - Technical Design

This document outlines the technical architecture and implementation details for the "Digital Heroes" golf performance and charity platform MCP server.

## 1. Core Mechanics Implementation

### Rolling 5 Score Rule
- **Logic**: Only the 5 most recent Stableford scores (points 1-45) are maintained per user.
- **Validation**:
  - `DH_001`: Duplicate score for the same date.
  - `DH_002`: Score outside the 1-45 range.
- **State Transition**: Upon a new submission, the system checks the count of existing scores. If the count exceeds 5, the oldest score (by `played_at`) is pruned.

### Draw Engine (Monthly)
- **Prize Pool Split**: 40% (5-number match), 35% (4-number match), 25% (3-number match).
- **Simulation**: The `simulate_draw` tool provides a pre-analysis of the pool based on active subscribers.

### Charity Logic
- **Contribution**: Minimum 10% of the subscription fee.
- **Orchestration**: Managed via Stitch to map user profiles to their selected charity entity.

## 2. Supabase Backend & RLS
The database schema is designed with strict security roles:
- **Administrator**: Can publish draw results and manage platform-wide settings.
- **Registered Subscriber**: Can manage their own profile and golf scores.
- **RLS Policies**:
  - `Profiles`: Self-view/update only.
  - `Golf Scores`: Subscriber-only insertion with validation.
  - `Draw Results`: Publicly readable, but Administrator-only write access.

## 3. Error Handling & Edge Cases
Specific error codes implemented in the MCP server:
- `DH_001`: Date Duplicate Error (User already has a score for this date).
- `DH_002`: Invalid Stableford Number (Must be 1-45).
- `DH_003`: Insufficient Permissions (e.g., non-admin trying to publish results).
- `DH_004`: Rolling 5 Limit reached (if automatic pruning is disabled).

## 4. State Management: Winner Transition
The transition from `Pending` to `Paid` status for winners follows this flow:
1. **Trigger**: Admin publishes a `DrawResult` (Status: `Pending`).
2. **Verification**: Asynchronous background worker verifies bank details and identity via Stripe/Email webhooks.
3. **Update**: Upon successful verification, the MCP server updates the `draw_results` status to `Paid`.
4. **Notification**: Stitch triggers an automated email confirmation to the winner.

## 5. Project Structure
- `design/`: Stitch data mapping and orchestration schemas.
- `mcp/`: JSON definitions for MCP tools.
- `supabase/`: SQL schema and RLS policies.
- `src/`: TypeScript implementation of the MCP server.
