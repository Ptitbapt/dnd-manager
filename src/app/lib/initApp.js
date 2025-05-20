// src/app/lib/initApp.js
import { initializeDefaultPresets } from "./presetUtils";

export async function initializeApp() {
  try {
    console.log("Initialisation de l'application...");

    // Initialiser les présets par défaut
    await initializeDefaultPresets();

    console.log("Initialisation terminée avec succès");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'application:", error);
    return { success: false, error };
  }
}
