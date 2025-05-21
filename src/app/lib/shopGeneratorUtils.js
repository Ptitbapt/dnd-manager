/**
 * Utilitaires pour la génération de boutiques
 * Ce fichier contient des fonctions qui peuvent être utilisées côté client
 * sans dépendre directement de Prisma
 */

/**
 * Récupère les types et raretés via l'API
 * @returns {Promise<Object>} { types, rarities }
 */
export async function fetchTypesAndRarities() {
  try {
    // Récupérer les types
    const typesResponse = await fetch("/api/items?action=types");
    if (!typesResponse.ok) {
      throw new Error(
        `Erreur lors de la récupération des types: ${typesResponse.status}`
      );
    }

    // Récupérer les raretés
    const raritiesResponse = await fetch("/api/items?action=rarities");
    if (!raritiesResponse.ok) {
      throw new Error(
        `Erreur lors de la récupération des raretés: ${raritiesResponse.status}`
      );
    }

    const typesData = await typesResponse.json();
    const raritiesData = await raritiesResponse.json();

    const types = Array.isArray(typesData.types) ? typesData.types : [];
    const rarities = Array.isArray(raritiesData.rarities)
      ? raritiesData.rarities
      : [];

    return { types, rarities };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types et raretés:",
      error
    );
    // Retourner des valeurs par défaut en cas d'erreur
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
 * Génère des objets de boutique basés sur la configuration
 * @param {Object} config - Configuration de la boutique
 * @returns {Promise<Array>} Liste des objets générés
 */
export async function generateShopItems(config) {
  try {
    const response = await fetch("/api/shops/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Erreur lors de la génération des objets:", error);
    throw error;
  }
}

/**
 * Sauvegarde une boutique dans la base de données
 * @param {string} name - Nom de la boutique
 * @param {string} description - Description de la boutique
 * @param {Array} items - Liste des objets de la boutique
 * @returns {Promise<Object>} Boutique sauvegardée
 */
export async function saveShopToDatabase(name, description, items) {
  try {
    const response = await fetch("/api/shops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        items,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    const data = await response.json();
    return data.shop;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);
    throw error;
  }
}

/**
 * Ajoute un objet à une boutique
 * @param {number} shopId - ID de la boutique
 * @param {Object} item - Objet à ajouter
 * @returns {Promise<Object>} Boutique mise à jour
 */
export async function addItemToShop(shopId, item) {
  try {
    const response = await fetch(`/api/shops/${shopId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
 * @param {number} shopId - ID de la boutique
 * @param {number} itemId - ID de l'objet à supprimer
 * @returns {Promise<Object>} Boutique mise à jour
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
 * Récupère les objets correspondant à certains critères
 * @param {Object} filters - Critères de recherche
 * @returns {Promise<Array>} Objets correspondants
 */
export async function searchItems(filters) {
  try {
    // Construire l'URL avec les paramètres de recherche
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
 * Construit une URL pour la documentation AideDD d'un objet
 * @param {string} itemName - Nom de l'objet
 * @returns {string} URL formatée
 */
export function buildAideDDUrl(itemName) {
  if (!itemName) return "#";

  // Normaliser le nom pour l'URL
  const normalizedName = itemName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ""); // Supprimer les tirets en début et fin

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
