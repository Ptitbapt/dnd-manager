// src/app/api/items/route.js - Fichier complet modifié

import { NextResponse } from "next/server";
import { getAllItems, getUniqueTypes, getUniqueRarities } from "../../lib/db";

export async function GET(request) {
  try {
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    console.log(`API /api/items appelée avec action: ${action}`);

    // Traitement des actions spéciales
    if (action === "types") {
      console.log("Récupération des types d'objets");
      try {
        const types = await getUniqueTypes();
        console.log(`${types.length} types récupérés:`, types);
        return NextResponse.json({ types });
      } catch (error) {
        console.error("Erreur lors de la récupération des types:", error);
        // Retourner des types par défaut en cas d'erreur
        const defaultTypes = [
          "Arme",
          "Armure",
          "Équipement",
          "Objet merveilleux",
          "Potion",
        ];
        return NextResponse.json({ types: defaultTypes, error: error.message });
      }
    }

    if (action === "rarities") {
      console.log("Récupération des raretés d'objets");
      try {
        const rarities = await getUniqueRarities();
        console.log(`${rarities.length} raretés récupérées:`, rarities);
        return NextResponse.json({ rarities });
      } catch (error) {
        console.error("Erreur lors de la récupération des raretés:", error);
        // Retourner des raretés par défaut en cas d'erreur
        const defaultRarities = [
          "Commun",
          "Peu commun",
          "Rare",
          "Très rare",
          "Légendaire",
        ];
        return NextResponse.json({
          rarities: defaultRarities,
          error: error.message,
        });
      }
    }

    // Récupérer tous les éléments avec filtrage potentiel
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const rarity = searchParams.get("rarity") || "";

    console.log(
      `Recherche d'items avec filtres - search: "${search}", type: "${type}", rarity: "${rarity}"`
    );

    try {
      const items = await getAllItems({ search, type, rarity });
      console.log(`${items.length} items trouvés`);
      return NextResponse.json(items);
    } catch (error) {
      console.error("Erreur lors de la récupération des items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error(`Erreur globale dans l'API /api/items:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Autres méthodes selon vos besoins (POST, etc.)
export async function POST(request) {
  try {
    const data = await request.json();
    // Logique pour créer un nouvel élément
    // ...
    return NextResponse.json(
      { message: "Item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error creating item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
