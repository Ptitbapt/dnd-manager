// app/api/debug/rarities/route.js
import { getUniqueRarities, getUniqueTypes } from "../../../lib/db";
import { initDatabase } from "../../../lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/debug/rarities
 * Debug des raretés et types dans la base de données
 */
export async function GET(request) {
  try {
    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // Récupérer les raretés et types uniques
    const rarities = await getUniqueRarities();
    const types = await getUniqueTypes();

    return NextResponse.json({
      rarities: {
        count: rarities.length,
        list: rarities,
      },
      types: {
        count: types.length,
        list: types,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur debug rarities:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des données debug",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
