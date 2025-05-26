/**
 * Utilitaires pour la configuration des boutiques
 */

/**
 * Fonction client-safe pour récupérer les types et raretés via API
 * @returns {Promise<Object>} Types et raretés disponibles
 */
export async function fetchTypesAndRarities() {
  try {
    const [typesResponse, raritiesResponse] = await Promise.all([
      fetch("/api/items?action=types"),
      fetch("/api/items?action=rarities"),
    ]);

    if (!typesResponse.ok || !raritiesResponse.ok) {
      throw new Error("Erreur lors de la récupération des données");
    }

    const typesData = await typesResponse.json();
    const raritiesData = await raritiesResponse.json();

    return {
      types: Array.isArray(typesData.types) ? typesData.types : [],
      rarities: Array.isArray(raritiesData.rarities)
        ? raritiesData.rarities
        : [],
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types et raretés:",
      error
    );
    return {
      types: ["Armes", "Armures", "Équipement", "Outils", "Objet merveilleux"],
      rarities: [
        "Neutre",
        "Commun",
        "Peu commun",
        "Rare",
        "Très rare",
        "Legendaire",
      ],
    };
  }
}

/**
 * Fonction client-safe pour récupérer un preset par ID via API
 * @param {string|number} presetId - ID du preset
 * @returns {Promise<Object|null>} Le preset ou null si non trouvé
 */
export async function fetchPresetById(presetId) {
  try {
    const response = await fetch(`/api/presets/${presetId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Preset non trouvé
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.preset;
  } catch (error) {
    console.error("Erreur lors de la récupération du preset:", error);
    return null;
  }
}

/**
 * Normalise les pourcentages pour qu'ils totalisent exactement 100%
 * @param {Object} typeChances - Les pourcentages par type
 * @returns {Object} La configuration normalisée
 */
export function normalizeTypePercentages(typeChances) {
  if (!typeChances || typeof typeChances !== "object") {
    return { normalizedTypeChances: {}, isNormalized: false };
  }

  // Créer une copie pour ne pas modifier l'original
  const normalizedTypeChances = { ...typeChances };

  // Vérifier si tous les pourcentages sont à 0
  const allZero = Object.values(normalizedTypeChances).every(
    (val) => parseInt(val) === 0 || !val
  );

  // Si tous sont à 0 et qu'il y a des types, faire une répartition équitable
  if (allZero && Object.keys(normalizedTypeChances).length > 0) {
    const baseValue = Math.floor(
      100 / Object.keys(normalizedTypeChances).length
    );
    let remaining = 100;

    Object.keys(normalizedTypeChances).forEach((type, index) => {
      if (index === Object.keys(normalizedTypeChances).length - 1) {
        normalizedTypeChances[type] = remaining;
      } else {
        normalizedTypeChances[type] = baseValue;
        remaining -= baseValue;
      }
    });

    return { normalizedTypeChances, isNormalized: true };
  }

  // Calculer le total actuel
  const total = Object.values(normalizedTypeChances).reduce(
    (sum, value) => sum + (parseInt(value) || 0),
    0
  );

  // Si déjà à 100%, retourner tel quel
  if (total === 100) {
    return { normalizedTypeChances, isNormalized: false };
  }

  // Si le total est différent de 0, normaliser
  if (total > 0) {
    const factor = 100 / total;

    Object.keys(normalizedTypeChances).forEach((type) => {
      normalizedTypeChances[type] = Math.round(
        (normalizedTypeChances[type] || 0) * factor
      );
    });

    // Ajuster pour atteindre exactement 100%
    const newTotal = Object.values(normalizedTypeChances).reduce(
      (sum, value) => sum + value,
      0
    );

    if (newTotal !== 100 && Object.keys(normalizedTypeChances).length > 0) {
      const lastType = Object.keys(normalizedTypeChances)[
        Object.keys(normalizedTypeChances).length - 1
      ];
      normalizedTypeChances[lastType] += 100 - newTotal;
    }

    return { normalizedTypeChances, isNormalized: true };
  }

  // Si on arrive ici, retourner simplement ce qu'on a
  return { normalizedTypeChances, isNormalized: false };
}

/**
 * Générer des pourcentages aléatoires pour les types
 * @param {Array} types - Liste des types disponibles
 * @returns {Object} - Les pourcentages générés (total = 100%)
 */
export function randomizeTypeChances(types) {
  if (!Array.isArray(types) || types.length === 0) return {};

  const newTypeChances = {};

  // Générer des valeurs aléatoires
  let total = 0;
  types.forEach((type) => {
    newTypeChances[type] = Math.floor(Math.random() * 30) + 5; // Entre 5 et 34
    total += newTypeChances[type];
  });

  // Normaliser pour obtenir un total de 100%
  types.forEach((type) => {
    newTypeChances[type] = Math.floor((newTypeChances[type] / total) * 100);
  });

  // Ajuster pour arriver exactement à 100%
  let newTotal = Object.values(newTypeChances).reduce(
    (sum, val) => sum + val,
    0
  );

  if (newTotal !== 100 && types.length > 0) {
    newTypeChances[types[0]] += 100 - newTotal;
  }

  return newTypeChances;
}

/**
 * Générer des valeurs aléatoires pour les raretés
 * @param {Array} rarities - Liste des raretés disponibles
 * @param {string} wealthLevel - Niveau de richesse pour ajuster les valeurs
 * @returns {Object} - Nouvelle configuration des raretés
 */
export function randomizeRarities(rarities, wealthLevel = "standard") {
  if (!Array.isArray(rarities) || rarities.length === 0) return {};

  const newItemsPerRarity = {};

  // Facteur de richesse pour ajuster les quantités
  const wealthFactor =
    {
      pauvre: 0.7,
      standard: 1,
      luxueux: 1.5,
    }[wealthLevel] || 1;

  rarities.forEach((rarity) => {
    // Extraire le niveau de rareté du format "0 - Neutre"
    const rarityMatch = rarity.match(/^(\d+)\s*-\s*(.+)$/);
    let rarityLevel = 0;

    if (rarityMatch) {
      rarityLevel = parseInt(rarityMatch[1]);
    } else {
      // Fallback pour les anciens formats
      const rarityLower = rarity.toLowerCase();
      if (rarityLower.includes("neutre")) rarityLevel = 0;
      else if (rarityLower.includes("commun") && !rarityLower.includes("peu"))
        rarityLevel = 1;
      else if (rarityLower.includes("peu commun")) rarityLevel = 2;
      else if (rarityLower.includes("rare") && !rarityLower.includes("très"))
        rarityLevel = 3;
      else if (rarityLower.includes("très rare")) rarityLevel = 4;
      else if (rarityLower.includes("légendaire")) rarityLevel = 5;
      else if (rarityLower.includes("artéfact")) rarityLevel = 6;
    }

    // Calculer les quantités selon le niveau de rareté
    switch (rarityLevel) {
      case 0: // Neutre
        newItemsPerRarity[rarity] = Math.floor(
          (Math.random() * 4 + 2) * wealthFactor
        ); // 2-5
        break;
      case 1: // Commun
        newItemsPerRarity[rarity] = Math.floor(
          (Math.random() * 6 + 3) * wealthFactor
        ); // 3-8
        break;
      case 2: // Peu commun
        newItemsPerRarity[rarity] = Math.floor(
          (Math.random() * 4 + 1) * wealthFactor
        ); // 1-4
        break;
      case 3: // Rare
        newItemsPerRarity[rarity] = Math.floor(
          Math.random() * 3 * wealthFactor
        ); // 0-2
        break;
      case 4: // Très rare
        const veryRareChance = wealthFactor >= 1.3 ? 0.4 : 0.2;
        newItemsPerRarity[rarity] = Math.random() < veryRareChance ? 1 : 0;
        break;
      case 5: // Légendaire
        const legendaryChance = wealthFactor >= 1.4 ? 0.3 : 0.1;
        newItemsPerRarity[rarity] = Math.random() < legendaryChance ? 1 : 0;
        break;
      case 6: // Artéfact
        const artifactChance = wealthFactor >= 1.5 ? 0.1 : 0.05;
        newItemsPerRarity[rarity] = Math.random() < artifactChance ? 1 : 0;
        break;
      default:
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 2);
    }
  });

  return newItemsPerRarity;
}

/**
 * Charge la configuration initiale pour la boutique
 * @param {string|null} presetId - ID du preset à charger (optionnel)
 * @returns {Promise<Object>} - Configuration initiale et métadonnées
 */
export async function loadInitialShopConfig(presetId = null) {
  try {
    // Récupérer les types et raretés disponibles via l'API
    const { types, rarities } = await fetchTypesAndRarities();

    // Si un preset est spécifié, essayer de le charger via l'API
    if (presetId) {
      try {
        const preset = await fetchPresetById(presetId);

        if (preset) {
          const { config, percentage } = await applyPreset(preset);
          return {
            config,
            percentage,
            types,
            rarities,
            preset, // Inclure le preset chargé pour référence
          };
        }
      } catch (error) {
        console.error("Erreur lors du chargement du preset:", error);
        // Continuer avec une configuration par défaut
      }
    }

    // Configuration par défaut si pas de preset
    const defaultConfig = createDefaultShopConfig(types, rarities);

    return {
      config: defaultConfig,
      percentage: 100,
      types,
      rarities,
      preset: null,
    };
  } catch (error) {
    console.error(
      "Erreur lors du chargement de la configuration initiale:",
      error
    );
    throw error;
  }
}

/**
 * Crée une configuration par défaut pour la boutique
 * @param {Array} types - Liste des types disponibles
 * @param {Array} rarities - Liste des raretés disponibles
 * @returns {Object} - Configuration par défaut
 */
export function createDefaultShopConfig(types, rarities) {
  console.log("createDefaultShopConfig appelé avec:", { types, rarities });

  // Vérification des entrées
  if (!Array.isArray(types)) {
    console.warn("Types n'est pas un tableau:", types);
    types = [];
  }
  if (!Array.isArray(rarities)) {
    console.warn("Rarities n'est pas un tableau:", rarities);
    rarities = [];
  }

  // Configuration par défaut pour les raretés
  const defaultItemsPerRarity = {};

  rarities.forEach((rarity) => {
    console.log("Traitement de la rareté:", rarity);

    // Extraire le niveau de rareté du format "0 - Neutre"
    const rarityMatch = rarity.match(/^(\d+)\s*-\s*(.+)$/);
    let rarityLevel = 0;

    if (rarityMatch) {
      rarityLevel = parseInt(rarityMatch[1]);
      console.log(`Rareté ${rarity} -> niveau ${rarityLevel}`);
    } else {
      // Fallback pour les anciens formats
      const rarityLower = rarity.toLowerCase();
      if (rarityLower.includes("neutre")) rarityLevel = 0;
      else if (rarityLower.includes("commun") && !rarityLower.includes("peu"))
        rarityLevel = 1;
      else if (rarityLower.includes("peu commun")) rarityLevel = 2;
      else if (rarityLower.includes("rare") && !rarityLower.includes("très"))
        rarityLevel = 3;
      else if (rarityLower.includes("très rare")) rarityLevel = 4;
      else if (rarityLower.includes("légendaire")) rarityLevel = 5;
      else if (rarityLower.includes("artéfact")) rarityLevel = 6;

      console.log(`Rareté ${rarity} (fallback) -> niveau ${rarityLevel}`);
    }

    // Assigner les valeurs par défaut selon le niveau
    switch (rarityLevel) {
      case 0: // Neutre
        defaultItemsPerRarity[rarity] = 3;
        break;
      case 1: // Commun
        defaultItemsPerRarity[rarity] = 5;
        break;
      case 2: // Peu commun
        defaultItemsPerRarity[rarity] = 3;
        break;
      case 3: // Rare
        defaultItemsPerRarity[rarity] = 2;
        break;
      case 4: // Très rare
        defaultItemsPerRarity[rarity] = 1;
        break;
      case 5: // Légendaire
        defaultItemsPerRarity[rarity] = 0;
        break;
      case 6: // Artéfact
        defaultItemsPerRarity[rarity] = 0;
        break;
      default:
        defaultItemsPerRarity[rarity] = 0;
    }
  });

  console.log("Configuration des raretés générée:", defaultItemsPerRarity);

  // Distribution équitable des pourcentages pour les types
  const defaultTypeChances = {};

  if (types.length > 0) {
    const baseValue = Math.floor(100 / types.length);
    let remaining = 100;

    types.forEach((type, index) => {
      if (index === types.length - 1) {
        // Le dernier type prend le reste pour atteindre exactement 100%
        defaultTypeChances[type] = remaining;
      } else {
        defaultTypeChances[type] = baseValue;
        remaining -= baseValue;
      }
    });
  }

  console.log("Configuration des types générée:", defaultTypeChances);

  const finalConfig = {
    itemsPerRarity: defaultItemsPerRarity,
    typeChances: defaultTypeChances,
  };

  console.log("Configuration finale:", finalConfig);
  return finalConfig;
}

/**
 * Applique un preset à la configuration de boutique
 * @param {Object} preset - Le preset à appliquer
 * @returns {Promise<Object>} - Configuration résultante
 */
export async function applyPreset(preset) {
  try {
    if (!preset) {
      throw new Error("Preset non défini");
    }

    // Extraire et parser typeChances
    let typeChances = preset.typeChances;
    if (typeof typeChances === "string") {
      try {
        typeChances = JSON.parse(typeChances);
      } catch (e) {
        console.error("Erreur lors du parsing de typeChances:", e);
        typeChances = {};
      }
    }

    // Extraire et parser rarityConfig
    let rarityConfig = preset.rarityConfig;
    if (typeof rarityConfig === "string") {
      try {
        rarityConfig = JSON.parse(rarityConfig);
      } catch (e) {
        console.error("Erreur lors du parsing de rarityConfig:", e);
        rarityConfig = {};
      }
    }

    // Normaliser les typeChances
    const { normalizedTypeChances } = normalizeTypePercentages(typeChances);

    // Créer la configuration finale
    const config = {
      itemsPerRarity: rarityConfig || {},
      typeChances: normalizedTypeChances,
    };

    return {
      config,
      percentage: 100, // Les pourcentages sont normalisés, donc toujours 100%
    };
  } catch (error) {
    console.error("Erreur lors de l'application du preset:", error);
    throw error;
  }
}

/**
 * Vérifie si une configuration est valide
 * @param {Object} shopConfig - Configuration à vérifier
 * @returns {Object} - Résultat de la validation
 */
export function validateShopConfig(shopConfig) {
  const errors = [];

  // Vérifier si la configuration est définie
  if (!shopConfig) {
    return {
      isValid: false,
      errors: ["Configuration non définie"],
    };
  }

  // Vérifier les typeChances
  if (!shopConfig.typeChances || typeof shopConfig.typeChances !== "object") {
    errors.push("Les chances de types ne sont pas définies correctement");
  } else {
    // Vérifier que les typeChances contiennent des entrées
    const typeCount = Object.keys(shopConfig.typeChances).length;
    if (typeCount === 0) {
      errors.push("Aucun type défini dans la configuration");
    }

    // Calculer le total des pourcentages
    const totalPercentage = Object.values(shopConfig.typeChances).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );

    if (totalPercentage !== 100) {
      errors.push(
        `Le total des pourcentages de types est de ${totalPercentage}%, il devrait être de 100%`
      );
    }
  }

  // Vérifier les itemsPerRarity
  if (
    !shopConfig.itemsPerRarity ||
    typeof shopConfig.itemsPerRarity !== "object"
  ) {
    errors.push("Les items par rareté ne sont pas définis correctement");
  } else {
    // Vérifier que des raretés sont définies
    const rarityCount = Object.keys(shopConfig.itemsPerRarity).length;
    if (rarityCount === 0) {
      errors.push("Aucune rareté définie dans la configuration");
    }

    // Vérifier que les valeurs sont des nombres positifs
    const hasNegativeValues = Object.values(shopConfig.itemsPerRarity).some(
      (value) => (parseInt(value) || 0) < 0
    );

    if (hasNegativeValues) {
      errors.push("Certaines raretés ont des valeurs négatives");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Charge tous les présets disponibles via l'API
 * @param {Object} filters - Filtres optionnels (wealthLevel, shopType)
 * @returns {Promise<Array>} - Liste des présets
 */
export async function fetchAllPresets(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (filters.wealthLevel) {
      queryParams.append("wealthLevel", filters.wealthLevel);
    }

    if (filters.shopType) {
      queryParams.append("shopType", filters.shopType);
    }

    const url = `/api/presets${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.presets || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des présets:", error);
    return [];
  }
}

/**
 * Sauvegarde un preset via l'API
 * @param {Object} presetData - Données du preset à sauvegarder
 * @returns {Promise<Object>} - Preset sauvegardé
 */
export async function savePreset(presetData) {
  try {
    const response = await fetch("/api/presets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.preset;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du preset:", error);
    throw error;
  }
}

/**
 * Met à jour un preset existant via l'API
 * @param {string|number} presetId - ID du preset à mettre à jour
 * @param {Object} presetData - Nouvelles données du preset
 * @returns {Promise<Object>} - Preset mis à jour
 */
export async function updatePreset(presetId, presetData) {
  try {
    const response = await fetch(`/api/presets/${presetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(presetData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.preset;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du preset:", error);
    throw error;
  }
}

/**
 * Supprime un preset via l'API
 * @param {string|number} presetId - ID du preset à supprimer
 * @returns {Promise<boolean>} - Succès de la suppression
 */
export async function deletePreset(presetId) {
  try {
    const response = await fetch(`/api/presets/${presetId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du preset:", error);
    throw error;
  }
}
