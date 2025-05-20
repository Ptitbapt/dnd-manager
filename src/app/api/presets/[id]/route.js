// src/app/api/presets/[id]/route.js
import {
  getPresetById,
  updatePreset,
  deletePreset,
} from "../../../lib/presetUtils";
import { initDatabase } from "../../../lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/presets/[id]
 * Récupère un preset spécifique par son ID
 */
export async function GET(request, context) {
  try {
    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // Récupérer l'ID de manière asynchrone
    const params = context.params;
    const id = params.id;

    // Récupérer le preset
    const preset = await getPresetById(id);

    if (!preset) {
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ preset });
  } catch (error) {
    console.error("Erreur lors de la récupération du preset:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du preset" },
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
    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // Récupérer l'ID de manière asynchrone
    const params = context.params;
    const id = params.id;

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

    // Vérifier que le preset existe
    const existingPreset = await getPresetById(id);
    if (!existingPreset) {
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 });
    }

    // Mettre à jour le preset (même les présets par défaut)
    const updatedPreset = await updatePreset(id, data);

    return NextResponse.json({
      message: "Preset mis à jour avec succès",
      preset: updatedPreset,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du preset:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du preset" },
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
    // Initialiser la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      );
    }

    // Récupérer l'ID de manière asynchrone
    const params = context.params;
    const id = params.id;

    // Vérifier que le preset existe
    const existingPreset = await getPresetById(id);
    if (!existingPreset) {
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 });
    }

    // Supprimer le preset (même les présets par défaut)
    await deletePreset(id);

    return NextResponse.json({ message: "Preset supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du preset:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du preset" },
      { status: 500 }
    );
  }
}
