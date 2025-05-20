// src/app/lib/shopGeneratorUtils.js - Fichier complet modifié

import { getPresetById } from "./presetUtils";

/**
 * Récupère les types et raretés disponibles depuis l'API
 *
 * @returns {Promise<{types: Array, rarities: Array}>} Les types et raretés disponibles
 */
export async function fetchTypesAndRarities() {
  console.log("Récupération des types et raretés...");

  try {
    // Ajout de logs détaillés pour identifier le problème
    console.log(
      "Tentative de récupération des types à l'URL: /api/items?action=types"
    );
    console.log(
      "Tentative de récupération des raretés à l'URL: /api/items?action=rarities"
    );

    const [typesResponse, raritiesResponse] = await Promise.all([
      fetch("/api/items?action=types"),
      fetch("/api/items?action=rarities"),
    ]);

    console.log(
      "Statut de la réponse types:",
      typesResponse.status,
      typesResponse.statusText
    );
    console.log(
      "Statut de la réponse raretés:",
      raritiesResponse.status,
      raritiesResponse.statusText
    );

    if (!typesResponse.ok) {
      const errorText = await typesResponse.text();
      console.error("Réponse d'erreur pour les types:", errorText);
      throw new Error(`Erreur lors de la récupération des types: ${errorText}`);
    }

    if (!raritiesResponse.ok) {
      const errorText = await raritiesResponse.text();
      console.error("Réponse d'erreur pour les raretés:", errorText);
      throw new Error(
        `Erreur lors de la récupération des raretés: ${errorText}`
      );
    }

    // Analyse des réponses avec gestion d'erreur
    let typesData, raritiesData;

    try {
      const typesText = await typesResponse.text();
      console.log("Réponse brute des types:", typesText);
      typesData = typesText ? JSON.parse(typesText) : { types: [] };
    } catch (error) {
      console.error("Erreur lors du parsing de la réponse des types:", error);
      typesData = { types: [] };
    }

    try {
      const raritiesText = await raritiesResponse.text();
      console.log("Réponse brute des raretés:", raritiesText);
      raritiesData = raritiesText ? JSON.parse(raritiesText) : { rarities: [] };
    } catch (error) {
      console.error("Erreur lors du parsing de la réponse des raretés:", error);
      raritiesData = { rarities: [] };
    }

    // Vérification de la structure des données
    const types = Array.isArray(typesData.types) ? typesData.types : [];
    const rarities = Array.isArray(raritiesData.rarities)
      ? raritiesData.rarities
      : [];

    console.log(
      `${types.length} types et ${rarities.length} raretés récupérés`
    );

    // Utiliser des valeurs par défaut si nécessaire
    if (types.length === 0) {
      console.warn("Aucun type récupéré, utilisation de valeurs par défaut");
      // Ajouter quelques types par défaut
      return {
        types: ["Arme", "Armure", "Équipement", "Objet merveilleux", "Potion"],
        rarities,
      };
    }

    if (rarities.length === 0) {
      console.warn(
        "Aucune rareté récupérée, utilisation de valeurs par défaut"
      );
      // Ajouter quelques raretés par défaut
      return {
        types,
        rarities: ["Commun", "Peu commun", "Rare", "Très rare", "Légendaire"],
      };
    }

    return { types, rarities };
  } catch (error) {
    console.error("Erreur lors de la récupération des options:", error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      types: ["Arme", "Armure", "Équipement", "Objet merveilleux", "Potion"],
      rarities: ["Commun", "Peu commun", "Rare", "Très rare", "Légendaire"],
    };
  }
}

/**
 * Initialise la configuration de la boutique à partir des types et raretés
 * Si un presetId est fourni, charge la configuration à partir de ce preset
 *
 * @param {Array} types Liste des types d'objets
 * @param {Array} rarities Liste des raretés d'objets
 * @param {Number} presetId ID du preset à utiliser (optionnel)
 * @returns {Promise<Object>} Configuration initiale et pourcentage total
 */
export async function initialiseShopConfig(types, rarities, presetId = null) {
  console.log("Initialisation de la configuration de la boutique...");
  console.log("Types reçus:", types);
  console.log("Raretés reçues:", rarities);

  // Si un preset est spécifié, essayer de le charger d'abord
  if (presetId) {
    try {
      console.log(`Chargement du preset avec ID: ${presetId}`);
      const preset = await getPresetById(presetId);

      if (preset) {
        console.log(`Preset "${preset.name}" chargé avec succès`);

        // Créer la configuration à partir du preset
        const shopConfig = {
          itemsPerRarity: { ...preset.rarityConfig },
          typeChances: { ...preset.typeChances },
        };

        // Calculer le pourcentage total
        const totalPercentage = Object.values(preset.typeChances).reduce(
          (sum, value) => sum + (parseInt(value) || 0),
          0
        );

        return { shopConfig, totalPercentage };
      } else {
        console.warn(`Preset avec ID ${presetId} non trouvé`);
        // Continuer avec la configuration par défaut
      }
    } catch (error) {
      console.error("Erreur lors du chargement du preset:", error);
      // Continuer avec la configuration par défaut
    }
  }

  // Vérifier que rarities est un tableau
  if (!Array.isArray(rarities)) {
    console.error("Les raretés ne sont pas un tableau:", rarities);
    // Si ce n'est pas un tableau, créons un tableau vide pour éviter les erreurs
    rarities = [];
  }

  // Vérifier que types est un tableau
  if (!Array.isArray(types)) {
    console.error("Les types ne sont pas un tableau:", types);
    // Si ce n'est pas un tableau, créons un tableau vide pour éviter les erreurs
    types = [];
  }

  // Initialisation des valeurs par défaut pour les raretés
  let communValue = 5; // Valeur par défaut pour Commun
  const defaultItemsPerRarity = {};

  // Première passe pour déterminer la valeur de Commun
  rarities.forEach((rarity) => {
    if (
      rarity.toLowerCase().includes("commun") &&
      rarity.toLowerCase() !== "peu commun"
    ) {
      communValue = 5;
    }
  });

  // Deuxième passe pour attribuer les valeurs à toutes les raretés
  rarities.forEach((rarity) => {
    if (
      rarity.toLowerCase() === "neutre" ||
      rarity.toLowerCase() === "variable"
    ) {
      defaultItemsPerRarity[rarity] = communValue;
    } else if (
      rarity.toLowerCase().includes("commun") &&
      rarity.toLowerCase() !== "peu commun"
    ) {
      defaultItemsPerRarity[rarity] = communValue;
    } else {
      defaultItemsPerRarity[rarity] =
        rarity.toLowerCase().includes("peu commun") ||
        rarity.toLowerCase() === "peu commun"
          ? 3
          : rarity.toLowerCase().includes("rare") ||
            rarity.toLowerCase() === "rare"
          ? 2
          : rarity.toLowerCase().includes("très rare") ||
            rarity.toLowerCase() === "très rare"
          ? 1
          : 0;
    }
  });

  // Initialisation des pourcentages de type pour qu'ils totalisent exactement 100%
  const defaultTypeChances = {};

  // Répartition équitable entre tous les types
  const baseValue = types.length > 0 ? Math.floor(100 / types.length) : 0;
  let remaining = 100;

  types.forEach((type, index) => {
    if (index === types.length - 1) {
      // Le dernier type prend tout ce qui reste pour arriver à 100%
      defaultTypeChances[type] = remaining;
    } else {
      defaultTypeChances[type] = baseValue;
      remaining -= baseValue;
    }
  });

  const shopConfig = {
    itemsPerRarity: defaultItemsPerRarity,
    typeChances: defaultTypeChances,
  };

  console.log("Configuration initiale créée:", shopConfig);
  return { shopConfig, totalPercentage: 100 };
}

/**
 * Génère les données de la boutique à partir de la configuration
 *
 * @param {Object} shopConfig Configuration de la boutique
 * @returns {Promise<Array>} Liste des objets générés
 */
export async function generateShopData(shopConfig) {
  console.log("Génération des données de la boutique...");
  console.log("Configuration:", shopConfig);

  try {
    const response = await fetch("/api/shops/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemsPerRarity: shopConfig.itemsPerRarity,
        typeChances: shopConfig.typeChances,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Échec de la génération de la boutique: ${errorData}`);
    }

    const data = await response.json();
    if (!data.success || !data.items) {
      throw new Error("Données de génération invalides");
    }

    console.log(`${data.items.length} objets générés avec succès`);
    return data.items;
  } catch (error) {
    console.error("Erreur lors de la génération de la boutique:", error);
    throw error;
  }
}

/**
 * Sauvegarde les données de la boutique
 *
 * @param {string} name Nom de la boutique
 * @param {string} description Description de la boutique
 * @param {Array} items Liste des objets de la boutique
 * @returns {Promise<Object>} Données de la boutique sauvegardée
 */
export async function saveShopData(name, description, items) {
  console.log("Sauvegarde des données de la boutique...");

  try {
    // Préparation des données à envoyer
    const shopData = {
      name: name.trim(),
      description: description.trim(),
      items: items.map((item) => item.IDX),
    };

    console.log("Données à sauvegarder:", shopData);

    const response = await fetch("/api/shops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shopData),
    });

    // Lire le corps de la réponse même en cas d'erreur
    const responseText = await response.text();
    let data;

    try {
      // Essayer de parser la réponse comme JSON
      data = JSON.parse(responseText);
    } catch (err) {
      console.error("Réponse non-JSON:", responseText);
      throw new Error(`Format de réponse invalide: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(
        `Échec de la sauvegarde: ${data.error || "Erreur inconnue"}`
      );
    }

    console.log("Boutique sauvegardée avec succès:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);
    throw error;
  }
}

/**
 * Sauvegarde la configuration actuelle comme un nouveau preset
 *
 * @param {string} name Nom du preset
 * @param {string} description Description du preset
 * @param {string} wealthLevel Niveau de richesse
 * @param {string} shopType Type de boutique
 * @param {Object} shopConfig Configuration de la boutique
 * @returns {Promise<Object>} Données du preset sauvegardé
 */
export async function saveAsPreset(
  name,
  description,
  wealthLevel,
  shopType,
  shopConfig
) {
  console.log("Sauvegarde de la configuration comme preset...");

  try {
    const presetData = {
      name: name.trim(),
      description: description.trim(),
      wealthLevel,
      shopType,
      typeChances: shopConfig.typeChances,
      rarityConfig: shopConfig.itemsPerRarity,
      isDefault: false,
    };

    console.log("Données du preset à sauvegarder:", presetData);

    const response = await fetch("/api/presets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Échec de la sauvegarde du preset: ${
          errorData.error || "Erreur inconnue"
        }`
      );
    }

    const data = await response.json();
    console.log("Preset sauvegardé avec succès:", data);
    return data.preset;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du preset:", error);
    throw error;
  }
}
