// app/api/shops/generate/route.js
import { NextResponse } from "next/server";
import { generateShop } from "../../../lib/shopGenerator";

export async function POST(request) {
  try {
    const config = await request.json();

    // Validation des paramètres
    if (!config.itemsPerRarity || !config.typeChances) {
      return NextResponse.json(
        { error: "Configuration de génération invalide" },
        { status: 400 }
      );
    }

    // Génération des objets de la boutique
    const items = await generateShop(config);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la boutique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la boutique" },
      { status: 500 }
    );
  }
}
