# Digital Heroes - Full-Stack Platform

This is a professional full-stack implementation of the "Digital Heroes" golf performance and charity platform, designed for the trainee selection process.

## Project Architecture

- `/apps/web`: Next.js frontend application.
- `/packages/mcp-server`: Node.js/TypeScript MCP server implementing core business logic and tool definitions.
- `/supabase`: Database migrations and Row Level Security (RLS) policies.

## Core Mechanics

### 1. Rolling 5 Score Rule
- Only the 5 most recent Stableford scores (1-45) are maintained.
- Logic is orchestrated via **Stitch** using a "Before-Insert" trigger to prune the oldest score when the limit is reached.

### 2. Monthly Draw Engine
- Prize pool is split 40/35/25 for 5, 4, and 3-number matches.
- The `simulate_draw` tool provides pre-analysis based on active subscriber counts.

### 3. Charity Contribution
- A minimum 10% contribution is automatically calculated and distributed to the user's selected charity.

## Security & Access Control

- **Supabase RLS**: 
  - Subscribers can only view and manage their own scores.
  - The `draw_results` table is restricted to `service_role` for publishing, ensuring only the Admin (via the MCP server) can trigger draw completions.
- **MCP Server**: Acts as the secure bridge, validating all inputs and managing state transitions from `Pending` to `Paid`.

## Deployment

1. **Environment Setup**: Copy `.env.example` to `.env` and fill in the required keys.
2. **Supabase**: Run migrations found in `/supabase/migrations`.
3. **MCP Server**:
   - `cd packages/mcp-server`
   - `npm install`
   - `npm run dev`
4. **Web App**:
   - `cd apps/web`
   - `npm install`
   - `npm run dev`

## Error Handling
The MCP server uses specific error codes:
- `DH_001`: Duplicate Score Date
- `DH_002`: Invalid Stableford Range (1-45)
- `DH_003`: Insufficient Permissions
- `DH_004`: Rolling 5 Limit Reached (if pruning is disabled)
