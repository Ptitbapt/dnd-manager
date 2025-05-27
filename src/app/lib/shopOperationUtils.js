/**
 * Utilitaires pour les opérations sur les boutiques (génération, sauvegarde, etc.)
 * Version adaptée pour PostgreSQL
 */
import { generateShopData, saveShopData } from "./shopGeneratorUtils";
import {
  normalizeTypePercentages,
  validateShopConfig,
} from "./shopConfigUtils";

/**
 * Génère les objets pour une boutique à partir d'une configuration
 * @param {Object} shopConfig - Configuration de la boutique
 * @returns {Promise<Array>} - Liste des objets générés
 */
export async function generateShopItems(shopConfig) {
  console.log("Génération des objets de la boutique...");

  try {
    // Valider la configuration
    const { isValid, errors } = validateShopConfig(shopConfig);

    if (!isValid) {
      throw new Error(`Configuration invalide: ${errors.join(", ")}`);
    }

    // S'assurer que les pourcentages totalisent 100%
    const { normalizedTypeChances, isNormalized } = normalizeTypePercentages(
      shopConfig.typeChances
    );

    // Si une normalisation a été nécessaire, mettre à jour la configuration
    const configToUse = isNormalized
      ? { ...shopConfig, typeChances: normalizedTypeChances }
      : shopConfig;

    // Appeler l'API pour générer les objets
    const items = await generateShopData(configToUse);

    console.log(`${items.length} objets générés avec succès`);
    return items;
  } catch (error) {
    console.error("Erreur lors de la génération des objets:", error);
    throw new Error(`Échec de la génération de la boutique: ${error.message}`);
  }
}

/**
 * Sauvegarde une boutique dans la base de données
 * @param {string} name - Nom de la boutique
 * @param {string} description - Description de la boutique
 * @param {Array} items - Liste des objets de la boutique
 * @returns {Promise<Object>} - Résultat de la sauvegarde
 */
export async function saveShopToDatabase(name, description, items) {
  console.log("Sauvegarde de la boutique dans la base de données...");

  // Validation des entrées
  if (!name || name.trim() === "") {
    throw new Error("Le nom de la boutique est obligatoire");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Aucun objet à sauvegarder");
  }

  try {
    // Appeler l'API pour sauvegarder la boutique
    const result = await saveShopData(name, description, items);

    console.log("Boutique sauvegardée avec succès:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);
    throw new Error(`Échec de la sauvegarde: ${error.message}`);
  }
}

/**
 * Exporte les données de la boutique au format JSON
 * @param {string} name - Nom de la boutique
 * @param {string} description - Description de la boutique
 * @param {Array} items - Liste des objets de la boutique
 * @returns {string} - Données au format JSON
 */
export function exportShopToJson(name, description, items) {
  try {
    const shopData = {
      name,
      description,
      items: items.map((item) => ({
        // CORRECTION: Adaptation pour PostgreSQL (noms minuscules)
        id: item.index || item.id,
        name: item.nomobjet || item.name,
        type: item.type,
        subType: item.soustype || item.subType,
        rarity: item.rarete || item.rarity,
        value: item.valeur || item.value,
        source: item.source,
        weight: item.poids || item.weight,
        characteristics: item.caracteristiques || item.characteristics,
        additionalInfo: item.infosupplementaire || item.additionalInfo,
        proficiency: item.maitrise || item.proficiency,
      })),
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(shopData, null, 2);
  } catch (error) {
    console.error("Erreur lors de l'exportation de la boutique:", error);
    throw new Error(`Échec de l'exportation: ${error.message}`);
  }
}

/**
 * Calcule des statistiques sur la boutique générée
 * @param {Array} items - Liste des objets de la boutique
 * @returns {Object} - Statistiques de la boutique
 */
export function calculateShopStats(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      totalValue: 0,
      typeDistribution: {},
      rarityDistribution: {},
    };
  }

  try {
    // Total des objets
    const totalItems = items.length;

    // Valeur totale - CORRECTION: utiliser 'valeur' minuscule
    const totalValue = items.reduce(
      (sum, item) => sum + (parseFloat(item.valeur || item.value) || 0),
      0
    );

    // Distribution par type - CORRECTION: utiliser 'type' minuscule
    const typeDistribution = {};
    items.forEach((item) => {
      const type = item.type || "Non défini";
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // Distribution par rareté - CORRECTION: utiliser 'rarete' minuscule
    const rarityDistribution = {};
    items.forEach((item) => {
      const rarity = item.rarete || item.rarity || "Non défini";
      rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + 1;
    });

    return {
      totalItems,
      totalValue,
      typeDistribution,
      rarityDistribution,
    };
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    throw new Error(`Échec du calcul des statistiques: ${error.message}`);
  }
}

/**
 * Filtre les objets par type, rareté ou terme de recherche
 * @param {Array} items - Liste des objets à filtrer
 * @param {Object} filters - Critères de filtrage
 * @returns {Array} - Liste des objets filtrés
 */
export function filterShopItems(items, filters) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  if (!filters || typeof filters !== "object") {
    return items;
  }

  try {
    const { typeFilter, rarityFilter, searchTerm } = filters;

    return items.filter((item) => {
      // Filtre par type - CORRECTION: utiliser 'type' minuscule
      const typeMatches = !typeFilter || item.type === typeFilter;

      // Filtre par rareté - CORRECTION: utiliser 'rarete' minuscule
      const rarityMatches = !rarityFilter || item.rarete === rarityFilter;

      // Filtre par terme de recherche - CORRECTION: utiliser 'nomobjet' minuscule
      const searchMatches =
        !searchTerm ||
        (item.nomobjet &&
          item.nomobjet.toLowerCase().includes(searchTerm.toLowerCase()));

      return typeMatches && rarityMatches && searchMatches;
    });
  } catch (error) {
    console.error("Erreur lors du filtrage des objets:", error);
    return items; // En cas d'erreur, retourner la liste d'origine
  }
}

/**
 * Trie les objets par différents critères
 * @param {Array} items - Liste des objets à trier
 * @param {string} sortBy - Critère de tri (name, type, rarity, value)
 * @param {string} sortOrder - Ordre de tri (asc, desc)
 * @returns {Array} - Liste des objets triés
 */
export function sortShopItems(items, sortBy = "name", sortOrder = "asc") {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  try {
    const sortedItems = [...items]; // Copie pour ne pas modifier l'original

    sortedItems.sort((a, b) => {
      let valueA, valueB;

      // Déterminer les valeurs à comparer selon le critère
      // CORRECTION: Adaptation pour PostgreSQL (noms minuscules)
      switch (sortBy) {
        case "name":
          valueA = a.nomobjet || a.name || "";
          valueB = b.nomobjet || b.name || "";
          break;
        case "type":
          valueA = a.type || "";
          valueB = b.type || "";
          break;
        case "rarity":
          valueA = a.rarete || a.rarity || "";
          valueB = b.rarete || b.rarity || "";
          break;
        case "value":
          valueA = parseFloat(a.valeur || a.value) || 0;
          valueB = parseFloat(b.valeur || b.value) || 0;
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        default:
          valueA = a.nomobjet || a.name || "";
          valueB = b.nomobjet || b.name || "";
      }

      // Comparaison lexicographique pour les chaînes
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB, "fr", { sensitivity: "base" })
          : valueB.localeCompare(valueA, "fr", { sensitivity: "base" });
      }

      // Comparaison numérique pour les nombres
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });

    return sortedItems;
  } catch (error) {
    console.error("Erreur lors du tri des objets:", error);
    return items; // En cas d'erreur, retourner la liste d'origine
  }
}

/**
 * Groupe les objets par type ou rareté
 * @param {Array} items - Liste des objets à grouper
 * @param {string} groupBy - Critère de groupement (type, rarity)
 * @returns {Object} - Objets groupés par critère
 */
export function groupShopItems(items, groupBy = "type") {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {};
  }

  try {
    const groupedItems = {};

    items.forEach((item) => {
      let key;

      // Déterminer la clé de groupement
      // CORRECTION: Adaptation pour PostgreSQL (noms minuscules)
      switch (groupBy) {
        case "type":
          key = item.type || "Non défini";
          break;
        case "rarity":
          key = item.rarete || item.rarity || "Non défini";
          break;
        default:
          key = item.type || "Non défini";
      }

      // Initialiser le groupe s'il n'existe pas encore
      if (!groupedItems[key]) {
        groupedItems[key] = [];
      }

      // Ajouter l'objet au groupe
      groupedItems[key].push(item);
    });

    return groupedItems;
  } catch (error) {
    console.error("Erreur lors du groupement des objets:", error);
    return {}; // En cas d'erreur, retourner un objet vide
  }
}

/**
 * Vérifie si un objet peut être ajouté à la boutique (pas de doublon)
 * @param {Object} item - Objet à vérifier
 * @param {Array} existingItems - Liste des objets existants
 * @returns {boolean} - True si l'objet peut être ajouté
 */
export function canAddItemToShop(item, existingItems) {
  // CORRECTION: utiliser 'index' minuscule
  if (!item || !item.index) {
    return false;
  }

  if (!existingItems || !Array.isArray(existingItems)) {
    return true;
  }

  // Vérifier si l'objet existe déjà dans la liste
  // CORRECTION: utiliser 'index' minuscule
  return !existingItems.some(
    (existingItem) => existingItem.index === item.index
  );
}
