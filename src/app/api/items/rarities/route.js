// app/api/items/rarities/route.js
import { NextResponse } from "next/server";
import { getUniqueRarities } from "../../../lib/db";

export async function GET() {
  try {
    console.log("API /api/items/rarities appelée");

    const rarities = await getUniqueRarities();
    console.log(`${rarities?.length || 0} raretés récupérées:`, rarities);

    // Vérifier que rarities est bien un tableau
    const safeRarities = Array.isArray(rarities) ? rarities : [];

    return NextResponse.json({
      success: true,
      rarities: safeRarities,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des raretés:", error);

    // Retourner des raretés par défaut en cas d'erreur
    const defaultRarities = [
      "Neutre",
      "Commun",
      "Variable",
      "Peu commun",
      "Rare",
      "Très rare",
      "Légendaire",
    ];

    return NextResponse.json(
      {
        success: false,
        rarities: defaultRarities,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
