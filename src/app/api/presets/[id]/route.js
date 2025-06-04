// app/api/presets/[id]/route.js
import {
  getPresetById,
  updatePreset,
  deletePreset,
  getPresets,
} from "../../../lib/presetUtils";
import { initDatabase } from "../../../lib/db";
import { NextResponse } from "next/server";

// Maps pour suivre les opérations en cours par utilisateur
const ongoingUpdates = new Map();
const ongoingDeletions = new Map();

/**
 * GET /api/presets/[id]
 * Récupère un preset spécifique par son ID
 */
export async function GET(request, context) {
  try {
    console.log("API /api/presets/[id] GET appelée");

    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // CORRECTION : Récupérer l'ID de manière asynchrone (Next.js 15+)
    const params = await context.params;
    const id = params.id;

    console.log(`Récupération du preset ID: ${id}`);

    // Récupérer le preset
    const preset = await getPresetById(id);

    if (!preset) {
      console.log(`Preset avec ID ${id} non trouvé`);
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 });
    }

    console.log(`Preset avec ID ${id} récupéré avec succès`);
    return NextResponse.json({
      success: true,
      preset,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du preset:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Erreur lors de la récupération du preset: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/presets/[id]
 * Met à jour un preset existant
 */
export async function PUT(request, context) {
  try {
    // Identifiant utilisateur pour le suivi des opérations en cours
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";

    // Vérifier si l'utilisateur a déjà une mise à jour en cours
    if (ongoingUpdates.has(userIdentifier)) {
      return NextResponse.json(
        {
          error:
            "Une mise à jour de preset est déjà en cours. Veuillez patienter.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Marquer comme en cours
    ongoingUpdates.set(userIdentifier, Date.now());

    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      ongoingUpdates.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // CORRECTION : Récupérer l'ID de manière asynchrone (Next.js 15+)
    const params = await context.params;
    const id = params.id;

    const data = await request.json();

    console.log(`Mise à jour du preset ID: ${id}`, data);

    // Valider les données
    if (!data.name || !data.wealthLevel || !data.shopType) {
      ongoingUpdates.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        {
          error:
            "Données incomplètes. Nom, niveau de richesse et type de boutique sont requis.",
        },
        { status: 400 }
      );
    }

    if (!data.typeChances || !data.rarityConfig) {
      ongoingUpdates.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        {
          error:
            "Données incomplètes. Configuration des types et des raretés requise.",
        },
        { status: 400 }
      );
    }

    // Vérifier que la somme des pourcentages est bien de 100%
    const totalPercentage = Object.values(data.typeChances).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > 1) {
      // Tolérance de 1% pour les erreurs d'arrondi
      ongoingUpdates.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Les pourcentages des types doivent totaliser 100%" },
        { status: 400 }
      );
    }

    // Vérifier que le preset existe
    const existingPreset = await getPresetById(id);
    if (!existingPreset) {
      ongoingUpdates.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 });
    }

    // Vérifier si un autre preset a déjà le même nom (sauf lui-même)
    const existingPresets = await getPresets({});
    const duplicatePreset = existingPresets.find(
      (preset) =>
        preset.name.toLowerCase() === data.name.trim().toLowerCase() &&
        preset.id.toString() !== id.toString()
    );

    if (duplicatePreset) {
      ongoingUpdates.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Un autre preset avec ce nom existe déjà" },
        { status: 409 } // Conflict
      );
    }

    // Mettre à jour le preset (même les presets par défaut)
    const updatedPreset = await updatePreset(id, data);

    // Nettoyer après traitement
    ongoingUpdates.delete(userIdentifier);

    console.log(`Preset ID ${id} mis à jour avec succès`);

    return NextResponse.json({
      success: true,
      message: "Preset mis à jour avec succès",
      preset: updatedPreset,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du preset:", error);

    // S'assurer de nettoyer en cas d'erreur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";
    ongoingUpdates.delete(userIdentifier);

    return NextResponse.json(
      {
        success: false,
        error:
          "Erreur lors de la mise à jour du preset: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presets/[id]
 * Supprime un preset existant
 */
export async function DELETE(request, context) {
  try {
    // Identifiant utilisateur pour le suivi des opérations en cours
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";

    // Vérifier si l'utilisateur a déjà une suppression en cours
    if (ongoingDeletions.has(userIdentifier)) {
      return NextResponse.json(
        {
          error:
            "Une suppression de preset est déjà en cours. Veuillez patienter.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Marquer comme en cours
    ongoingDeletions.set(userIdentifier, Date.now());

    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      ongoingDeletions.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // CORRECTION : Récupérer l'ID de manière asynchrone (Next.js 15+)
    const params = await context.params;
    const id = params.id;

    console.log(`Suppression du preset ID: ${id}`);

    // Vérifier que le preset existe
    const existingPreset = await getPresetById(id);
    if (!existingPreset) {
      ongoingDeletions.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 });
    }

    // Supprimer le preset (même les presets par défaut)
    await deletePreset(id);

    // Nettoyer après traitement
    ongoingDeletions.delete(userIdentifier);

    console.log(`Preset ID ${id} supprimé avec succès`);

    return NextResponse.json({
      success: true,
      message: "Preset supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du preset:", error);

    // S'assurer de nettoyer en cas d'erreur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";
    ongoingDeletions.delete(userIdentifier);

    return NextResponse.json(
      {
        success: false,
        error:
          "Erreur lors de la suppression du preset: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

// Nettoyer les requêtes abandonnées après un certain temps
function cleanupAbandonedRequests() {
  const now = Date.now();
  const timeout = 60000; // 1 minute

  for (const [id, timestamp] of ongoingUpdates.entries()) {
    if (now - timestamp > timeout) {
      ongoingUpdates.delete(id);
    }
  }

  for (const [id, timestamp] of ongoingDeletions.entries()) {
    if (now - timestamp > timeout) {
      ongoingDeletions.delete(id);
    }
  }
}

// Nettoyer périodiquement
setInterval(cleanupAbandonedRequests, 60000);
