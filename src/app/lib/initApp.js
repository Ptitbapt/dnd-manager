// src/app/lib/initApp.js
import { initDatabase } from "../lib/db";
import { initializeDefaultPresets } from "../lib/presetUtils";

/**
 * Initialise l'application au démarrage
 * - Vérifie la connexion à la base de données
 * - Initialise les présets par défaut si nécessaire
 */
export async function initializeApp() {
  try {
    console.log("🚀 Initialisation de l'application...");

    // Vérifier la connexion à la base de données
    const dbInit = await initDatabase();
    if (!dbInit.success) {
      throw new Error("Impossible de se connecter à la base de données");
    }
    console.log("✅ Base de données connectée");

    // Initialiser les présets par défaut si nécessaire
    // Cette fonction vérifie automatiquement s'ils existent déjà
    try {
      await initializeDefaultPresets();
      console.log("✅ Présets par défaut vérifiés/initialisés");
    } catch (error) {
      // Ne pas faire échouer l'application si les présets ne peuvent pas être initialisés
      console.warn(
        "⚠️ Impossible d'initialiser les présets par défaut:",
        error.message
      );
    }

    console.log("🎉 Application initialisée avec succès");
    return { success: true };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de l'application:",
      error
    );
    return { success: false, error };
  }
}
