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

  try {
    const typesResponse = await fetch("/api/items/types");
    if (!typesResponse.ok) {
      throw new Error(
        `Erreur lors de la récupération des types: ${typesResponse.statusText}`
      );
    }

    const typesResult = await typesResponse.json();
    const typesData = Array.isArray(typesResult.types)
      ? typesResult.types
      : Array.isArray(typesResult)
      ? typesResult
      : [];

    const raritiesResponse = await fetch("/api/items/rarities");
    if (!raritiesResponse.ok) {
      throw new Error(
        `Erreur lors de la récupération des raretés: ${raritiesResponse.statusText}`
      );
    }

    const raritiesResult = await raritiesResponse.json();
    const raritiesData = Array.isArray(raritiesResult.rarities)
      ? raritiesResult.rarities
      : Array.isArray(raritiesResult)
      ? raritiesResult
      : [];

    typesCache = typesData;
    raritiesCache = raritiesData;

    return { types: typesData, rarities: raritiesData };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types et raretés:",
      error
    );
    return {
      types: [
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
      ],
      rarities: [
        "Neutre",
        "Commun",
        "Variable",
        "Peu commun",
        "Rare",
        "Très rare",
        "Légendaire",
      ],
    };
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

    const response = await fetch("/api/shops/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Erreur lors de la génération de la boutique"
      );
    }

    const data = await response.json();

    if (!data.success || !data.items) {
      throw new Error("Réponse invalide de l'API");
    }

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

/**
 * Initialise les présets de boutique par défaut
 * @returns {Promise<void>}
 */
export async function initializeDefaultPresets() {
  try {
    const response = await fetch("/api/presets/initialize", {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation des présets par défaut:",
      error
    );
    throw error;
  }
}

/**
 * Récupère toutes les boutiques
 * @returns {Promise<Array>}
 */
export async function getAllShops() {
  try {
    const response = await fetch("/api/shops");
    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des boutiques: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques:", error);
    return [];
  }
}
