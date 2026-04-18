import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tool, arguments: args } = await request.json();
    
    switch (tool) {
      case "submit_score":
        // Orchestrate via Stitch: Validate -> Check Rolling 5 -> Insert
        const scoreRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        const scoreData = await scoreRes.json();
        return NextResponse.json(scoreData);

      case "simulate_draw":
        // Orchestrate via Stitch: Query Subscribers -> Calculate Pool -> Split
        const drawRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/draws`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        const drawData = await drawRes.json();
        return NextResponse.json({
          status: "success",
          prizePool: {
            total: drawData.totalPool,
            fiveMatch: drawData.splits.fiveMatch,
            fourMatch: drawData.splits.fourMatch,
            threeMatch: drawData.splits.threeMatch
          }
        });

      case "calculate_charity_cut":
        const charityRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/charity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        const charityData = await charityRes.json();
        return NextResponse.json(charityData);

      default:
        return NextResponse.json({ error: "Unknown Stitch tool" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
