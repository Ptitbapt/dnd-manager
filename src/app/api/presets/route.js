// app/api/presets/route.js
import {
  getPresets,
  createPreset,
  deletePreset,
  getDefaultPresets,
} from "../../lib/presetUtils";
import { initDatabase } from "../../lib/db";
import { NextResponse } from "next/server";

// Map pour suivre les opérations de création de preset en cours
const ongoingCreations = new Map();

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
      {
        error:
          "Erreur lors de la récupération des présets: " +
          (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presets
 * Crée un nouveau preset OU initialise les presets par défaut
 */
export async function POST(request) {
  try {
    // Identifiant utilisateur pour le suivi des opérations en cours
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";

    // Vérifier si l'utilisateur a déjà une création en cours
    if (ongoingCreations.has(userIdentifier)) {
      return NextResponse.json(
        {
          error: "Une opération est déjà en cours. Veuillez patienter.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Marquer comme en cours
    ongoingCreations.set(userIdentifier, Date.now());

    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      ongoingCreations.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // Récupérer les données de la requête
    const data = await request.json();

    // Vérifier si c'est une demande d'initialisation des presets par défaut
    if (data.action === "initialize") {
      return await handleInitializePresets(userIdentifier);
    }

    // Sinon, traiter comme une création normale de preset
    return await handleCreatePreset(data, userIdentifier);
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error);

    // S'assurer de nettoyer en cas d'erreur
    const requestHeaders = new Headers(request.headers);
    const userIdentifier = requestHeaders.get("x-forwarded-for") || "anonymous";
    ongoingCreations.delete(userIdentifier);

    return NextResponse.json(
      {
        error:
          "Erreur lors du traitement: " + (error.message || "Erreur inconnue"),
      },
      { status: 500 }
    );
  }
}

/**
 * Gère l'initialisation des presets par défaut
 */
async function handleInitializePresets(userIdentifier) {
  try {
    // Récupérer tous les presets existants
    const existingPresets = await getPresets({});

    // Filtrer les presets par défaut existants
    const defaultPresets = existingPresets.filter((preset) => preset.isDefault);

    // Supprimer les anciens presets par défaut
    let deletedCount = 0;
    for (const preset of defaultPresets) {
      try {
        await deletePreset(preset.id);
        deletedCount++;
      } catch (error) {
        console.error(
          `Erreur lors de la suppression du preset ${preset.id}:`,
          error
        );
      }
    }

    // Créer les nouveaux presets par défaut
    const defaultPresetsData = getDefaultPresets();
    let createdCount = 0;

    for (const presetData of defaultPresetsData) {
      try {
        await createPreset({
          ...presetData,
          isDefault: true,
        });
        createdCount++;
      } catch (error) {
        console.error(
          `Erreur lors de la création du preset ${presetData.name}:`,
          error
        );
      }
    }

    // Nettoyer après traitement
    ongoingCreations.delete(userIdentifier);

    return NextResponse.json({
      message: "Presets par défaut mis à jour avec succès",
      deleted: deletedCount,
      created: createdCount,
    });
  } catch (error) {
    ongoingCreations.delete(userIdentifier);
    throw error;
  }
}

/**
 * Gère la création d'un preset normal
 */
async function handleCreatePreset(data, userIdentifier) {
  try {
    // Valider les données
    if (!data.name || !data.wealthLevel || !data.shopType) {
      ongoingCreations.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        {
          error:
            "Données incomplètes. Nom, niveau de richesse et type de boutique sont requis.",
        },
        { status: 400 }
      );
    }

    if (!data.typeChances || !data.rarityConfig) {
      ongoingCreations.delete(userIdentifier); // Nettoyer en cas d'erreur
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
      ongoingCreations.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Les pourcentages des types doivent totaliser 100%" },
        { status: 400 }
      );
    }

    // Vérifier si un preset avec le même nom existe déjà
    const existingPresets = await getPresets({});
    const duplicatePreset = existingPresets.find(
      (preset) => preset.name.toLowerCase() === data.name.trim().toLowerCase()
    );

    if (duplicatePreset) {
      ongoingCreations.delete(userIdentifier); // Nettoyer en cas d'erreur
      return NextResponse.json(
        { error: "Un preset avec ce nom existe déjà" },
        { status: 409 } // Conflict
      );
    }

    // Créer le preset
    const newPreset = await createPreset(data);

    // Nettoyer après traitement
    ongoingCreations.delete(userIdentifier);

    return NextResponse.json(
      {
        message: "Preset créé avec succès",
        preset: newPreset,
      },
      { status: 201 }
    );
  } catch (error) {
    ongoingCreations.delete(userIdentifier);
    throw error;
  }
}

// Nettoyer les requêtes abandonnées après un certain temps
function cleanupAbandonedCreations() {
  const now = Date.now();
  const timeout = 60000; // 1 minute

  for (const [id, timestamp] of ongoingCreations.entries()) {
    if (now - timestamp > timeout) {
      ongoingCreations.delete(id);
    }
  }
}

// Nettoyer périodiquement
setInterval(cleanupAbandonedCreations, 60000);
