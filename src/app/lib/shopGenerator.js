// lib/shopGenerator.js - Version adaptée pour PostgreSQL
import { prisma } from "./db";

/**
 * Génère une boutique aléatoire basée sur les paramètres spécifiés
 *
 * @param {Object} config Configuration pour la génération de la boutique
 * @param {Object} config.itemsPerRarity Nombre d'objets par rareté
 * @param {Object} config.typeChances Pourcentage de chance pour chaque type
 * @returns {Promise<Array>} Liste d'objets générée pour la boutique
 */
export async function generateShop(config) {
  console.log("Génération de boutique avec la configuration:", config);

  // Configuration par défaut adaptée à votre DB
  const defaultConfig = {
    itemsPerRarity: {
      "0 - Neutre": 3,
      "1 - Commun": 5,
      "2 - Peu commun": 3,
      "3 - Rare": 2,
      "4 - Très rare": 1,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    typeChances: {
      Arme: 25,
      Armure: 20,
      Équipement: 20,
      Potion: 15,
      "Objet merveilleux": 10,
      Outils: 10,
    },
  };

  // Fusion de la configuration par défaut avec la configuration fournie
  const shopConfig = {
    itemsPerRarity: {
      ...defaultConfig.itemsPerRarity,
      ...config.itemsPerRarity,
    },
    typeChances: { ...defaultConfig.typeChances, ...config.typeChances },
  };

  const shopItems = [];
  const allRarities = Object.keys(shopConfig.itemsPerRarity);

  // Pour chaque rareté, sélectionner les objets correspondants
  for (const rarity of allRarities) {
    const count = shopConfig.itemsPerRarity[rarity];

    if (count > 0) {
      try {
        const items = await selectItemsByRarityAndType(
          rarity,
          count,
          shopConfig.typeChances
        );
        shopItems.push(...items);
      } catch (error) {
        console.error(
          `Erreur lors de la sélection d'objets pour la rareté ${rarity}:`,
          error
        );
      }
    }
  }

  console.log(`Boutique générée avec ${shopItems.length} objets`);
  return shopItems;
}

/**
 * Sélectionne des objets en fonction de la rareté et des chances de type
 *
 * @param {string} rarity Rareté des objets à sélectionner
 * @param {number} count Nombre d'objets à sélectionner
 * @param {Object} typeChances Pourcentage de chance pour chaque type
 * @returns {Promise<Array>} Liste des objets sélectionnés
 */
async function selectItemsByRarityAndType(rarity, count, typeChances) {
  // CORRECTION: Utiliser les noms PostgreSQL (minuscules)
  const itemsByRarity = await prisma.items.findMany({
    where: { rarete: rarity },
  });

  if (itemsByRarity.length === 0) {
    console.log(`Aucun objet trouvé pour la rareté: ${rarity}`);
    return [];
  }

  console.log(
    `${itemsByRarity.length} objets trouvés pour la rareté: ${rarity}`
  );

  const selectedItems = [];
  const selectedIds = new Set(); // Pour éviter les doublons

  // Calculer la chance totale
  const totalChance = Object.values(typeChances).reduce(
    (sum, chance) => sum + chance,
    0
  );

  // Normaliser les chances si elles ne totalisent pas 100%
  const normalizedChances = {};
  for (const [type, chance] of Object.entries(typeChances)) {
    normalizedChances[type] = (chance / totalChance) * 100;
  }

  // Essayer de sélectionner le nombre d'objets demandé
  for (let i = 0; i < count; i++) {
    // Déterminer le type en fonction des pourcentages de chance
    const selectedType = selectRandomType(normalizedChances);

    // Filtrer les objets par type sélectionné (CORRECTION: utiliser 'type' minuscule)
    const itemsByType = itemsByRarity.filter(
      (item) => item.type === selectedType
    );

    // S'il n'y a pas d'objets du type sélectionné, prendre n'importe quel objet de cette rareté
    const eligibleItems = itemsByType.length > 0 ? itemsByType : itemsByRarity;

    // Sélectionner un objet aléatoire parmi les objets éligibles (qui n'a pas déjà été sélectionné)
    // CORRECTION: utiliser 'index' minuscule
    const notSelectedItems = eligibleItems.filter(
      (item) => !selectedIds.has(item.index)
    );

    if (notSelectedItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * notSelectedItems.length);
      const selectedItem = notSelectedItems[randomIndex];
      selectedItems.push(selectedItem);
      selectedIds.add(selectedItem.index); // CORRECTION: utiliser 'index' minuscule
    } else if (eligibleItems.length > 0 && selectedItems.length < count) {
      // Si tous les objets ont déjà été sélectionnés mais que nous n'avons pas atteint le nombre demandé
      // Autoriser les doublons en dernier recours
      const randomIndex = Math.floor(Math.random() * eligibleItems.length);
      selectedItems.push(eligibleItems[randomIndex]);
    }
  }

  console.log(
    `${selectedItems.length} objets sélectionnés pour la rareté: ${rarity}`
  );
  return selectedItems;
}

/**
 * Sélectionne un type aléatoire en fonction des chances configurées
 *
 * @param {Object} typeChances Pourcentage de chance pour chaque type
 * @returns {string} Le type sélectionné
 */
function selectRandomType(typeChances) {
  const randomValue = Math.random() * 100;
  let cumulativeChance = 0;

  for (const [type, chance] of Object.entries(typeChances)) {
    cumulativeChance += chance;
    if (randomValue <= cumulativeChance) {
      return type;
    }
  }

  // Fallback sur le premier type (ne devrait pas arriver si les chances sont normalisées)
  return Object.keys(typeChances)[0];
}

/**
 * Sauvegarde une boutique générée avec les objets modifiés
 *
 * @param {string} name Nom de la boutique
 * @param {string} description Description de la boutique
 * @param {Array} items Liste des objets de la boutique (objets complets avec modifications)
 * @returns {Promise<Object>} La boutique sauvegardée
 */
export async function saveShop(name, description, items) {
  console.log("Début de la sauvegarde de la boutique:", {
    name,
    description,
    itemsCount: items.length,
  });

  try {
    // Validation des entrées
    if (!name || name.trim() === "") {
      console.error("Erreur: Nom de boutique manquant");
      throw new Error("Le nom de la boutique est obligatoire");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Erreur: Liste d'objets invalide", items);
      throw new Error("La liste des objets ne peut pas être vide");
    }

    // Sauvegarder les objets complets avec leurs modifications
    // Au lieu de sauvegarder juste les IDs, on sauvegarde les objets modifiés
    const itemsToSave = items.map((item) => {
      // CORRECTION: Adaptation pour PostgreSQL (noms en minuscules)
      return {
        id: item.index || item.id,
        name: item.nomobjet || item.name,
        type: item.type,
        subType: item.soustype || item.subType,
        rarity: item.rarete || item.rarity,
        value: item.valeur || item.value,
        weight: item.poids || item.weight,
        characteristics: item.caracteristiques || item.characteristics,
        additionalInfo: item.infosupplementaire || item.additionalInfo,
        source: item.source,
        proficiency: item.maitrise || item.proficiency,
      };
    });

    console.log("Objets formatés pour sauvegarde:", itemsToSave);

    // CORRECTION: Utiliser les noms de colonnes PostgreSQL
    const newShop = await prisma.shop.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : "",
        items: JSON.stringify(itemsToSave), // Sauvegarder les objets complets
        createdat: new Date(), // CORRECTION: 'createdat' minuscule
      },
    });

    console.log("Boutique sauvegardée avec succès:", newShop);
    return newShop;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);
    throw error; // Propager l'erreur pour la gérer dans l'API
  }
}

/**
 * Récupère une boutique sauvegardée avec ses objets
 *
 * @param {string} shopId ID de la boutique
 * @returns {Promise<Object>} La boutique avec ses objets
 */
export async function getShopWithItems(shopId) {
  console.log(`Récupération de la boutique avec ID: ${shopId}`);

  try {
    // CORRECTION: Utiliser 'shop' minuscule
    const shop = await prisma.shop.findUnique({
      where: { id: Number(shopId) },
    });

    if (!shop) {
      console.log(`Boutique avec ID ${shopId} non trouvée`);
      return null;
    }

    console.log(`Boutique trouvée:`, shop);

    // Récupérer les objets sauvegardés (maintenant des objets complets)
    let savedItems;
    try {
      savedItems = JSON.parse(shop.items);
    } catch (error) {
      console.error(`Erreur lors du parsing des objets:`, error);
      savedItems = [];
    }

    console.log(`${savedItems.length} objets récupérés de la sauvegarde`);

    // Les objets sont maintenant stockés avec leurs modifications
    // On les retourne directement au lieu de les chercher en base
    // CORRECTION: Mapper vers la structure PostgreSQL (minuscules)
    const items = savedItems.map((item) => ({
      index: item.id,
      id: item.id, // Pour la compatibilité
      nomobjet: item.name,
      name: item.name, // Pour la compatibilité
      type: item.type,
      soustype: item.subType,
      subType: item.subType, // Pour la compatibilité
      rarete: item.rarity,
      rarity: item.rarity, // Pour la compatibilité
      valeur: item.value,
      value: item.value, // Pour la compatibilité
      poids: item.weight,
      weight: item.weight, // Pour la compatibilité
      caracteristiques: item.characteristics,
      characteristics: item.characteristics, // Pour la compatibilité
      infosupplementaire: item.additionalInfo,
      additionalInfo: item.additionalInfo, // Pour la compatibilité
      source: item.source,
      maitrise: item.proficiency,
      proficiency: item.proficiency, // Pour la compatibilité
    }));

    return {
      ...shop,
      items,
    };
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la boutique ${shopId}:`,
      error
    );
    throw error;
  }
}

/**
 * Récupère toutes les boutiques sauvegardées
 *
 * @returns {Promise<Array>} Liste des boutiques
 */
export async function getAllShops() {
  console.log("Récupération de toutes les boutiques");

  try {
    // CORRECTION: Utiliser 'shop' minuscule et 'createdat'
    const shops = await prisma.shop.findMany({
      orderBy: {
        createdat: "desc",
      },
    });

    console.log(`${shops.length} boutiques récupérées`);
    return shops;
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques:", error);
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
  console.log(`Tentative de suppression de la boutique avec ID: ${shopId}`);

  try {
    // CORRECTION: Utiliser 'shop' minuscule
    await prisma.shop.delete({
      where: { id: Number(shopId) },
    });

    console.log(`Boutique avec ID ${shopId} supprimée avec succès`);
    return { success: true };
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la boutique ${shopId}:`,
      error
    );
    throw new Error(
      `Erreur lors de la suppression de la boutique: ${error.message}`
    );
  }
}
