// app/api/shops/generate/route.js
import { NextResponse } from "next/server";
import { generateShop } from "../../../lib/shopGenerator";

// Map pour le suivi des requêtes en cours
const ongoingRequests = new Map();

export async function POST(request) {
  try {
    // Obtenir une forme d'identifiant pour l'utilisateur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";

    // Vérifier si l'utilisateur a déjà une génération en cours
    if (ongoingRequests.has(userIdentifier)) {
      return NextResponse.json(
        { error: "Une génération est déjà en cours. Veuillez patienter." },
        { status: 429 } // Too Many Requests
      );
    }

    // Marquer cette requête comme en cours
    ongoingRequests.set(userIdentifier, Date.now());

    // Récupérer et valider les données de configuration
    const config = await request.json();

    console.log("=== API GÉNÉRATION BOUTIQUE ===");
    console.log("Configuration reçue:", config);
    console.log("itemsPerRarity:", config.itemsPerRarity);
    console.log("typeChances:", config.typeChances);

    // CORRECTION : Validation plus stricte des paramètres
    if (!config) {
      ongoingRequests.delete(userIdentifier);
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 400 }
      );
    }

    if (!config.itemsPerRarity || typeof config.itemsPerRarity !== "object") {
      ongoingRequests.delete(userIdentifier);
      return NextResponse.json(
        { error: "Configuration itemsPerRarity manquante ou invalide" },
        { status: 400 }
      );
    }

    if (!config.typeChances || typeof config.typeChances !== "object") {
      ongoingRequests.delete(userIdentifier);
      return NextResponse.json(
        { error: "Configuration typeChances manquante ou invalide" },
        { status: 400 }
      );
    }

    // Vérifier que la somme des pourcentages est à 100%
    const totalPercentage = Object.values(config.typeChances).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );

    console.log("Pourcentage total calculé:", totalPercentage);

    if (Math.abs(totalPercentage - 100) > 1) {
      // Tolérance de 1% pour les erreurs d'arrondi
      ongoingRequests.delete(userIdentifier);
      return NextResponse.json(
        { error: "Les pourcentages doivent totaliser 100%" },
        { status: 400 }
      );
    }

    // CORRECTION : Vérifier qu'il y a au moins un objet à générer
    const totalItems = Object.values(config.itemsPerRarity).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );

    if (totalItems === 0) {
      ongoingRequests.delete(userIdentifier);
      return NextResponse.json(
        {
          error:
            "Aucun objet à générer. Configurez au moins une rareté avec une valeur > 0.",
        },
        { status: 400 }
      );
    }

    console.log("Total d'objets à générer:", totalItems);

    // Génération des objets de la boutique
    const items = await generateShop(config);

    console.log("Objets générés par l'API:", items?.length || 0, "objets");

    // Nettoyer après traitement
    ongoingRequests.delete(userIdentifier);

    // Retourner les résultats
    return NextResponse.json({
      success: true,
      items: items || [],
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la boutique:", error);

    // S'assurer de nettoyer en cas d'erreur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";
    ongoingRequests.delete(userIdentifier);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la génération de la boutique",
        items: [],
      },
      { status: 500 }
    );
  }
}

// Nettoyer les requêtes abandonnées après un certain temps
function cleanupAbandonedRequests() {
  const now = Date.now();
  const timeout = 60000; // 1 minute

  for (const [id, timestamp] of ongoingRequests.entries()) {
    if (now - timestamp > timeout) {
      ongoingRequests.delete(id);
    }
  }
}

// Nettoyer périodiquement
setInterval(cleanupAbandonedRequests, 60000);
