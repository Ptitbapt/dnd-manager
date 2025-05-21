/**
 * Utilitaires pour la configuration des boutiques
 */
import { fetchPresetById, fetchTypesAndRarities } from "./db";

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
 * @param {Object} currentRarities - Configuration actuelle des raretés
 * @returns {Object} - Nouvelle configuration des raretés
 */
export function randomizeRarities(rarities, currentRarities = {}) {
  if (!Array.isArray(rarities) || rarities.length === 0) return {};

  const newItemsPerRarity = { ...currentRarities };

  rarities.forEach((rarity) => {
    const rarityLower = rarity.toLowerCase();

    // Plus la rareté est élevée, moins il y aura d'objets
    if (
      (rarityLower.includes("commun") && rarityLower !== "peu commun") ||
      rarityLower === "neutre" ||
      rarityLower === "variable"
    ) {
      newItemsPerRarity[rarity] = Math.floor(Math.random() * 6) + 3; // 3-8 pour Commun, Neutre, Variable
    } else if (rarityLower.includes("peu commun")) {
      newItemsPerRarity[rarity] = Math.floor(Math.random() * 4) + 1; // 1-4
    } else if (rarityLower.includes("rare")) {
      newItemsPerRarity[rarity] = Math.floor(Math.random() * 3); // 0-2
    } else if (rarityLower.includes("très rare")) {
      newItemsPerRarity[rarity] = Math.floor(Math.random() * 2); // 0-1
    } else if (rarityLower.includes("légendaire")) {
      newItemsPerRarity[rarity] = Math.random() < 0.2 ? 1 : 0; // 20% chance d'avoir 1
    } else {
      newItemsPerRarity[rarity] = Math.floor(Math.random() * 3); // 0-2
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
  // Vérification des entrées
  if (!Array.isArray(types)) types = [];
  if (!Array.isArray(rarities)) rarities = [];

  // Configuration par défaut pour les raretés
  const defaultItemsPerRarity = {};

  rarities.forEach((rarity) => {
    const rarityLower = rarity.toLowerCase();

    if (
      rarityLower === "neutre" ||
      rarityLower === "variable" ||
      (rarityLower.includes("commun") && rarityLower !== "peu commun")
    ) {
      defaultItemsPerRarity[rarity] = 5; // Par défaut pour Commun, Neutre, Variable
    } else if (rarityLower.includes("peu commun")) {
      defaultItemsPerRarity[rarity] = 3;
    } else if (rarityLower.includes("rare")) {
      defaultItemsPerRarity[rarity] = 2;
    } else if (rarityLower.includes("très rare")) {
      defaultItemsPerRarity[rarity] = 1;
    } else if (rarityLower.includes("légendaire")) {
      defaultItemsPerRarity[rarity] = 0;
    } else {
      defaultItemsPerRarity[rarity] = 0;
    }
  });

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

  return {
    itemsPerRarity: defaultItemsPerRarity,
    typeChances: defaultTypeChances,
  };
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
