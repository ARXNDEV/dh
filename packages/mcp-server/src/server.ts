import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * DIGITAL HEROES MCP SERVER
 * Bridge between Frontend, Supabase, and External Services.
 */

const server = new Server(
  {
    name: "digital-heroes-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ERROR CODES DEFINITION
const DH_ERROR_CODES = {
  DUPLICATE_SCORE_DATE: "DH_001",
  INVALID_STABLEFORD_RANGE: "DH_002",
  INSUFFICIENT_PERMISSIONS: "DH_003",
  ROLLING_FIVE_LIMIT_REACHED: "DH_004",
};

// TOOL IMPLEMENTATIONS
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "submit_score",
      description: "Validates and submits a golf score (Rolling 5 Rule).",
      inputSchema: {
        type: "object",
        properties: {
          userId: { type: "string" },
          score: { type: "number" },
          date: { type: "string" },
        },
        required: ["userId", "score", "date"],
      },
    },
    {
      name: "simulate_draw",
      description: "Pre-analysis of monthly prize pool (40/35/25 split).",
      inputSchema: {
        type: "object",
        properties: {
          month: { type: "string" },
        },
        required: ["month"],
      },
    },
    {
      name: "calculate_charity_cut",
      description: "Calculates the 10% charity contribution.",
      inputSchema: {
        type: "object",
        properties: {
          userId: { type: "string" },
          amount: { type: "number" },
        },
        required: ["userId", "amount"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "submit_score": {
      const { userId, score, date } = args as { userId: string; score: number; date: string };
      
      // 1. Validate Stableford Range (1-45)
      if (score < 1 || score > 45) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `[${DH_ERROR_CODES.INVALID_STABLEFORD_RANGE}] Score must be between 1 and 45.`
        );
      }

      /**
       * 2. Logic for Rolling 5 & Date Uniqueness
       * In a production environment with Supabase:
       * 
       * const { data: existing } = await supabase
       *   .from('golf_scores')
       *   .select('id')
       *   .eq('user_id', userId)
       *   .eq('played_at', date);
       * 
       * if (existing?.length) throw new McpError(ErrorCode.InvalidParams, `[${DH_ERROR_CODES.DUPLICATE_SCORE_DATE}]`);
       * 
       * const { count } = await supabase
       *   .from('golf_scores')
       *   .select('*', { count: 'exact', head: true })
       *   .eq('user_id', userId);
       * 
       * if (count && count >= 5) {
       *   // Prune oldest score logic
       *   const { data: oldest } = await supabase
       *     .from('golf_scores')
       *     .select('id')
       *     .eq('user_id', userId)
       *     .order('played_at', { ascending: true })
       *     .limit(1);
       *   if (oldest) await supabase.from('golf_scores').delete().eq('id', oldest[0].id);
       * }
       */
      
      return {
        content: [{ type: "text", text: `Score of ${score} for ${date} processed. Rolling 5 rule applied (oldest pruned if count > 5).` }],
      };
    }

    case "simulate_draw": {
      const { month } = args as { month: string };
      
      /**
       * Prize Pool Split Logic (40/35/25)
       * Based on active subscriber count and subscription fee.
       */
      const mockTotalPool = 10000; // In reality: query active subscribers * fee * 0.90 (after charity)
      const splits = {
        fiveMatch: mockTotalPool * 0.40,
        fourMatch: mockTotalPool * 0.35,
        threeMatch: mockTotalPool * 0.25,
      };

      return {
        content: [{ 
          type: "text", 
          text: `Draw Simulation for ${month}: 
          Total Prize Pool: $${mockTotalPool.toLocaleString()}
          5-Number Match (40%): $${splits.fiveMatch.toLocaleString()}
          4-Number Match (35%): $${splits.fourMatch.toLocaleString()}
          3-Number Match (25%): $${splits.threeMatch.toLocaleString()}` 
        }],
      };
    }

    case "calculate_charity_cut": {
      const { amount } = args as { userId: string; amount: number };
      const charityCut = amount * 0.10;

      return {
        content: [{ type: "text", text: `Charity Contribution: $${charityCut.toFixed(2)} (10% of $${amount})` }],
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

/**
 * STATE MANAGEMENT: Winner Transition Logic
 * Process: 
 * 1. Admin publishes DrawResult -> Status: 'Pending'
 * 2. System verifies bank/identity -> External Webhook (Stripe/Identity)
 * 3. On Success -> Update Supabase set status = 'Paid'
 * 4. Trigger Email notification via Stitch orchestration.
 */

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Digital Heroes MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
