// src/app/api/presets/route.js
import { getPresets, createPreset } from "../../lib/presetUtils";
import { initDatabase } from "../../lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/presets
 * Récupère tous les présets avec options de filtrage
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const wealthLevel = searchParams.get("wealthLevel");
    const shopType = searchParams.get("shopType");

    // Récupérer les présets avec les filtres éventuels
    const presets = await getPresets({ wealthLevel, shopType });

    return NextResponse.json({ presets });
  } catch (error) {
    console.error("Erreur lors de la récupération des présets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des présets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presets
 * Crée un nouveau preset
 */
export async function POST(request) {
  try {
    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // Récupérer les données de la requête
    const data = await request.json();

    // Valider les données
    if (!data.name || !data.wealthLevel || !data.shopType) {
      return NextResponse.json(
        {
          error:
            "Données incomplètes. Nom, niveau de richesse et type de boutique sont requis.",
        },
        { status: 400 }
      );
    }

    if (!data.typeChances || !data.rarityConfig) {
      return NextResponse.json(
        {
          error:
            "Données incomplètes. Configuration des types et des raretés requise.",
        },
        { status: 400 }
      );
    }

    // Créer le preset
    const newPreset = await createPreset(data);

    return NextResponse.json(
      {
        message: "Preset créé avec succès",
        preset: newPreset,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du preset:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du preset" },
      { status: 500 }
    );
  }
}
