// app/utils/shopApiUtils.js

/**
 * Récupère toutes les boutiques
 *
 * @returns {Promise<Array>} Liste des boutiques
 */
export async function fetchShops() {
  console.log("Récupération des boutiques...");

  try {
    const response = await fetch("/api/shops");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Échec du chargement des boutiques: ${errorText}`);
    }

    const shops = await response.json();
    console.log(`${shops.length} boutiques récupérées`);
    return shops;
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques:", error);
    throw error;
  }
}

/**
 * Récupère les objets d'une boutique spécifique
 *
 * @param {number} shopId ID de la boutique
 * @returns {Promise<Object>} Données de la boutique avec ses objets
 */
export async function fetchShopItems(shopId) {
  console.log(`Récupération des objets de la boutique ${shopId}...`);

  try {
    // Utiliser la route API correcte avec le pattern dynamique /[id]
    const response = await fetch(`/api/shops/${shopId}`);

    if (!response.ok) {
      // Essayer de lire l'erreur comme JSON
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || "Erreur inconnue";
      } catch (e) {
        // Si ce n'est pas du JSON, lire comme texte
        errorMessage = await response.text();
      }

      throw new Error(`Échec du chargement des objets: ${errorMessage}`);
    }

    const shopData = await response.json();
    console.log(
      `Boutique récupérée avec ${shopData.items?.length || 0} objets`
    );
    return shopData;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des objets de la boutique:",
      error
    );
    throw error;
  }
}

/**
 * Supprime une boutique
 *
 * @param {number} shopId ID de la boutique à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 */
export async function deleteShop(shopId) {
  console.log(`Suppression de la boutique ${shopId}...`);

  try {
    // Utiliser la route API correcte avec le pattern dynamique /[id]
    const response = await fetch(`/api/shops/${shopId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Essayer de lire l'erreur comme JSON
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || "Erreur inconnue";
      } catch (e) {
        // Si ce n'est pas du JSON, lire comme texte
        errorMessage = await response.text();
      }

      throw new Error(`Échec de la suppression: ${errorMessage}`);
    }

    const result = await response.json();
    console.log("Résultat de la suppression:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors de la suppression de la boutique:", error);
    throw error;
  }
}

/**
 * Génère une nouvelle boutique
 *
 * @param {Object} config Configuration de la boutique
 * @returns {Promise<Array>} Liste des objets générés
 */
export async function generateShop(config) {
  console.log("Génération d'une nouvelle boutique...");

  try {
    const response = await fetch("/api/shops/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      // Essayer de lire l'erreur comme JSON
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || "Erreur inconnue";
      } catch (e) {
        // Si ce n'est pas du JSON, lire comme texte
        errorMessage = await response.text();
      }

      throw new Error(`Échec de la génération: ${errorMessage}`);
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
 * Crée une nouvelle boutique
 *
 * @param {Object} shopData Données de la boutique à créer
 * @returns {Promise<Object>} La boutique créée
 */
export async function createShop(shopData) {
  console.log("Création d'une nouvelle boutique...");

  try {
    const response = await fetch("/api/shops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shopData),
    });

    if (!response.ok) {
      // Essayer de lire l'erreur comme JSON
      let errorMessage = "";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || "Erreur inconnue";
      } catch (e) {
        // Si ce n'est pas du JSON, lire comme texte
        errorMessage = await response.text();
      }

      throw new Error(`Échec de la création: ${errorMessage}`);
    }

    const result = await response.json();
    console.log("Boutique créée:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors de la création de la boutique:", error);
    throw error;
  }
}
