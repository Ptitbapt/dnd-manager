// app/api/shops/route.js
import { NextResponse } from "next/server";
import { saveShop, getAllShops } from "../../lib/shopGenerator";

// Map pour le suivi des requêtes de sauvegarde en cours
const ongoingSaves = new Map();

export async function POST(request) {
  try {
    // Obtenir une forme d'identifiant pour l'utilisateur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";

    // Vérifier si l'utilisateur a déjà une sauvegarde en cours
    if (ongoingSaves.has(userIdentifier)) {
      return NextResponse.json(
        { error: "Une sauvegarde est déjà en cours. Veuillez patienter." },
        { status: 429 } // Too Many Requests
      );
    }

    // Marquer cette requête comme en cours
    ongoingSaves.set(userIdentifier, Date.now());

    // Récupérer et valider les données
    const data = await request.json();

    console.log("Données reçues pour sauvegarde:", data);

    // Validation des données
    if (!data.name || !data.name.trim()) {
      ongoingSaves.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Le nom de la boutique est requis" },
        { status: 400 }
      );
    }

    if (!data.items || data.items.length === 0) {
      ongoingSaves.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "La boutique doit contenir au moins un objet" },
        { status: 400 }
      );
    }

    // Vérification des doublons (optionnel - peut être commenté si non souhaité)
    try {
      const existingShops = await getAllShops();
      const duplicateShop = existingShops.find(
        (shop) => shop.name.toLowerCase() === data.name.trim().toLowerCase()
      );

      if (duplicateShop) {
        ongoingSaves.delete(userIdentifier);
        return NextResponse.json(
          { error: "Une boutique avec ce nom existe déjà" },
          { status: 409 } // Conflict
        );
      }
    } catch (duplicateCheckError) {
      console.warn("Impossible de vérifier les doublons:", duplicateCheckError);
      // Continuer même si la vérification échoue
    }

    // Sauvegarde de la boutique AVEC les objets modifiés
    // Au lieu de passer juste les IDs, on passe les objets complets avec leurs modifications
    const newShop = await saveShop(
      data.name,
      data.description || "",
      data.items // Maintenant on passe les objets complets avec leurs modifications
    );

    // Nettoyer après traitement
    ongoingSaves.delete(userIdentifier);

    return NextResponse.json({
      success: true,
      id: newShop.id,
      message: "Boutique sauvegardée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);

    // S'assurer de nettoyer en cas d'erreur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";
    ongoingSaves.delete(userIdentifier);

    return NextResponse.json(
      {
        error:
          "Erreur lors de la sauvegarde de la boutique: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("Récupération de toutes les boutiques");

    const shops = await getAllShops();
    console.log(`${shops?.length || 0} boutiques récupérées`);

    return NextResponse.json(shops || []);
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques:", error);
    return NextResponse.json(
      {
        error:
          "Erreur lors de la récupération des boutiques: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

// Nettoyer les requêtes abandonnées après un certain temps
function cleanupAbandonedSaves() {
  const now = Date.now();
  const timeout = 60000; // 1 minute

  for (const [id, timestamp] of ongoingSaves.entries()) {
    if (now - timestamp > timeout) {
      ongoingSaves.delete(id);
    }
  }
}

// Nettoyer périodiquement
setInterval(cleanupAbandonedSaves, 60000);
