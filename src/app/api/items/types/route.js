// app/api/items/types/route.js
import { NextResponse } from "next/server";
import { getUniqueTypes } from "../../../lib/db";

export async function GET() {
  try {
    console.log("API /api/items/types appelée");

    const types = await getUniqueTypes();
    console.log(`${types?.length || 0} types récupérés:`, types);

    // Vérifier que types est bien un tableau
    const safeTypes = Array.isArray(types) ? types : [];

    return NextResponse.json({
      success: true,
      types: safeTypes,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des types:", error);

    // Retourner des types par défaut en cas d'erreur
    const defaultTypes = [
      "Armes",
      "Armures",
      "Équipement",
      "Outils",
      "Objet merveilleux",
      "Baguette",
      "Bâton",
      "Potion",
      "Parchemin",
      "Anneau",
      "Sceptre",
    ];

    return NextResponse.json(
      {
        success: false,
        types: defaultTypes,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
