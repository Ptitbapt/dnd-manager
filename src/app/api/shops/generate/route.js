// app/api/shops/generate/route.js
import { NextResponse } from "next/server";
import { generateShop } from "../../../lib/shopGenerator";

// Map pour le suivi des requêtes en cours
// Utilise l'IP ou un identifiant de session comme clé
const ongoingRequests = new Map();

export async function POST(request) {
  try {
    // Obtenir une forme d'identifiant pour l'utilisateur
    // Dans un environnement de production, utilisez un identifiant plus robuste
    // comme req.ip ou une session ID
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

    // Validation des paramètres
    if (!config.itemsPerRarity || !config.typeChances) {
      ongoingRequests.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Configuration de génération invalide" },
        { status: 400 }
      );
    }

    // Vérifier que la somme des pourcentages est à 100%
    const totalPercentage = Object.values(config.typeChances).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > 1) {
      // Tolérance de 1% pour les erreurs d'arrondi
      ongoingRequests.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Les pourcentages doivent totaliser 100%" },
        { status: 400 }
      );
    }

    // Génération des objets de la boutique
    const items = await generateShop(config);

    // Nettoyer après traitement
    ongoingRequests.delete(userIdentifier);

    // Retourner les résultats
    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la boutique:", error);

    // S'assurer de nettoyer en cas d'erreur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";
    ongoingRequests.delete(userIdentifier);

    return NextResponse.json(
      {
        error:
          "Erreur lors de la génération de la boutique: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

// Nettoyer les requêtes abandonnées après un certain temps
// Cette fonction peut être appelée régulièrement pour éviter les fuites de mémoire
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
