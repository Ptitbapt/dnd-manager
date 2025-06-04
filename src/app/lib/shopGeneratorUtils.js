/**
 * Utilitaires pour la génération et la gestion des boutiques - Version client-safe
 * Ce fichier contient des fonctions qui peuvent être utilisées côté client
 * sans dépendre directement de Prisma
 */

// Cache pour réduire les requêtes réseau
let typesCache = null;
let raritiesCache = null;

// Protection contre les appels multiples
let isGenerating = false;
let isSaving = false;

/**
 * Récupère les types et raretés d'objets depuis l'API
 * @returns {Promise<{types: string[], rarities: string[]}>}
 */
export async function fetchTypesAndRarities() {
  if (typesCache && raritiesCache) {
    return { types: typesCache, rarities: raritiesCache };
  }

  // CORRECTION : Gestion d'erreur plus robuste avec valeurs par défaut
  let typesData = [];
  let raritiesData = [];

  try {
    // Tentative de récupération des types
    try {
      const typesResponse = await fetch("/api/items/types");
      if (typesResponse.ok) {
        const typesResult = await typesResponse.json();
        typesData = Array.isArray(typesResult.types)
          ? typesResult.types
          : Array.isArray(typesResult)
          ? typesResult
          : [];
      } else {
        console.warn("API types non disponible, statut:", typesResponse.status);
      }
    } catch (error) {
      console.warn("Impossible de récupérer les types:", error.message);
    }

    // Tentative de récupération des raretés
    try {
      const raritiesResponse = await fetch("/api/items/rarities");
      if (raritiesResponse.ok) {
        const raritiesResult = await raritiesResponse.json();
        raritiesData = Array.isArray(raritiesResult.rarities)
          ? raritiesResult.rarities
          : Array.isArray(raritiesResult)
          ? raritiesResult
          : [];
      } else {
        console.warn(
          "API rarities non disponible, statut:",
          raritiesResponse.status
        );
      }
    } catch (error) {
      console.warn("Impossible de récupérer les raretés:", error.message);
    }

    // Si aucune donnée n'a pu être récupérée, utiliser les valeurs par défaut
    if (typesData.length === 0) {
      console.info("Utilisation des types par défaut");
      typesData = [
        "Armes",
        "Armures",
        "Équipement",
        "Outils",
        "Objet merveilleux",
        "Baguette",
        "Bâton",
        "Potion",
        "Parchemin",
        "Anneau",
        "Sceptre",
      ];
    }

    if (raritiesData.length === 0) {
      console.info("Utilisation des raretés par défaut");
      raritiesData = [
        "Neutre",
        "Commun",
        "Variable",
        "Peu commun",
        "Rare",
        "Très rare",
        "Légendaire",
      ];
    }

    typesCache = typesData;
    raritiesCache = raritiesData;

    return { types: typesData, rarities: raritiesData };
  } catch (error) {
    console.error(
      "Erreur générale lors de la récupération des types et raretés:",
      error
    );

    // Retourner les valeurs par défaut en cas d'erreur totale
    const defaultTypes = [
      "Armes",
      "Armures",
      "Équipement",
      "Outils",
      "Objet merveilleux",
      "Baguette",
      "Bâton",
      "Potion",
      "Parchemin",
      "Anneau",
      "Sceptre",
    ];

    const defaultRarities = [
      "Neutre",
      "Commun",
      "Variable",
      "Peu commun",
      "Rare",
      "Très rare",
      "Légendaire",
    ];

    typesCache = defaultTypes;
    raritiesCache = defaultRarities;

    return { types: defaultTypes, rarities: defaultRarities };
  }
}

/**
 * Génère les objets d'une boutique en fonction de la configuration
 * @param {Object} config
 * @returns {Promise<Array>}
 */
export async function generateShopItems(config) {
  if (isGenerating) {
    throw new Error("Génération déjà en cours");
  }

  try {
    isGenerating = true;

    // CORRECTION : Ajouter des logs pour déboguer
    console.log("Configuration envoyée à l'API de génération:", config);
    console.log("itemsPerRarity:", config.itemsPerRarity);
    console.log("typeChances:", config.typeChances);

    const response = await fetch("/api/shops/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `Erreur HTTP ${response.status}: ${errorText}` };
      }
      throw new Error(
        errorData.error ||
          `Erreur lors de la génération de la boutique (${response.status})`
      );
    }

    const data = await response.json();

    if (!data.success || !data.items) {
      throw new Error("Réponse invalide de l'API de génération");
    }

    console.log("Objets générés:", data.items);
    return data.items;
  } catch (error) {
    console.error("Erreur lors de la génération des objets:", error);
    throw error;
  } finally {
    isGenerating = false;
  }
}

/**
 * Sauvegarde une boutique dans la base de données
 * @param {string} name
 * @param {string} description
 * @param {Array} items
 * @returns {Promise<Object>}
 */
export async function saveShopToDatabase(name, description, items) {
  if (isSaving) {
    throw new Error("Sauvegarde déjà en cours");
  }

  try {
    isSaving = true;

    const response = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, items }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Erreur lors de la sauvegarde de la boutique"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);
    throw error;
  } finally {
    isSaving = false;
  }
}

/**
 * Ajoute un objet à une boutique existante
 * @param {number} shopId
 * @param {Object} item
 * @returns {Promise<Object>}
 */
export async function addItemToShop(shopId, item) {
  try {
    const response = await fetch(`/api/shops/${shopId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.shop;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'objet à la boutique:", error);
    throw error;
  }
}

/**
 * Supprime un objet d'une boutique
 * @param {number} shopId
 * @param {number} itemId
 * @returns {Promise<Object>}
 */
export async function removeItemFromShop(shopId, itemId) {
  try {
    const response = await fetch(`/api/shops/${shopId}/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.shop;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'objet de la boutique:",
      error
    );
    throw error;
  }
}

/**
 * Récupère les objets en fonction de filtres
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
export async function searchItems(filters) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.rarity) queryParams.append("rarity", filters.rarity);

    const response = await fetch(`/api/items/search?${queryParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Erreur lors de la recherche d'objets:", error);
    throw error;
  }
}

/**
 * Construit l'URL vers la fiche AideDD d'un objet
 * @param {string} itemName
 * @returns {string}
 */
export function buildAideDDUrl(itemName) {
  if (!itemName) return "#";

  const normalizedName = itemName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `https://aidedd.org/dnd/om.php?vf=${normalizedName}`;
}
