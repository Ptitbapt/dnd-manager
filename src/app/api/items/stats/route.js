// app/api/items/stats/route.js
import { NextResponse } from "next/server";
import { getStats } from "../../../lib/db";

export async function GET() {
  try {
    console.log("API /api/items/stats appelée");

    const stats = await getStats();
    console.log("Stats récupérées:", stats);

    return NextResponse.json(stats || {});
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats: " + error.message },
      { status: 500 }
    );
  }
}
