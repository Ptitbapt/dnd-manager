import { NextResponse } from "next/server";
import {
  getAllItems,
  getUniqueTypes,
  getUniqueRarities,
  createItem,
} from "../../lib/db";

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

        // Vérifier que types est bien un tableau
        const safeTypes = Array.isArray(types) ? types : [];

        return NextResponse.json({ types: safeTypes });
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

        // Vérifier que rarities est bien un tableau
        const safeRarities = Array.isArray(rarities) ? rarities : [];

        return NextResponse.json({ rarities: safeRarities });
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

// Méthode POST corrigée pour créer un nouvel objet
export async function POST(request) {
  try {
    console.log("Réception d'une requête POST pour créer un nouvel objet");

    // Récupérer et valider les données
    const itemData = await request.json();
    console.log("Données reçues:", itemData);

    // Vérification des champs obligatoires
    if (
      !itemData.name ||
      !itemData.type ||
      !itemData.rarity ||
      !itemData.source
    ) {
      console.error("Données incomplètes:", itemData);
      return NextResponse.json(
        { error: "Les champs nom, type, rareté et source sont obligatoires" },
        { status: 400 }
      );
    }

    // Créer l'objet dans la base de données
    try {
      const newItem = await createItem(itemData);
      console.log("Nouvel objet créé:", newItem);

      return NextResponse.json(
        { success: true, message: "Objet créé avec succès", item: newItem },
        { status: 201 }
      );
    } catch (dbError) {
      console.error(
        "Erreur lors de la création de l'objet dans la base de données:",
        dbError
      );
      return NextResponse.json(
        { error: "Erreur lors de la création de l'objet: " + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors du traitement de la requête POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur: " + error.message },
      { status: 500 }
    );
  }
}
