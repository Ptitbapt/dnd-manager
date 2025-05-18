// lib/shopGenerator.js
import { prisma } from "./db";

/**
 * Génère une boutique aléatoire basée sur les paramètres spécifiés
 *
 * @param {Object} config Configuration pour la génération de la boutique
 * @param {Object} config.itemsPerRarity Nombre d'objets par rareté (ex: { 'Common': 5, 'Rare': 2 })
 * @param {Object} config.typeChances Pourcentage de chance pour chaque type (ex: { 'Weapon': 30, 'Potion': 20 })
 * @returns {Promise<Array>} Liste d'objets générée pour la boutique
 */
export async function generateShop(config) {
  // Configuration par défaut
  const defaultConfig = {
    itemsPerRarity: {
      Common: 5,
      Uncommon: 3,
      Rare: 2,
      "Very Rare": 1,
      Legendary: 0,
      Artifact: 0,
    },
    typeChances: {
      Weapon: 30,
      Armor: 20,
      Potion: 20,
      Scroll: 15,
      "Wondrous Item": 15,
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
      const items = await selectItemsByRarityAndType(
        rarity,
        count,
        shopConfig.typeChances
      );
      shopItems.push(...items);
    }
  }

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
  // Récupérer tous les objets de la rareté spécifiée
  const itemsByRarity = await prisma.iTEMS.findMany({
    where: { Rarete: rarity },
  });

  if (itemsByRarity.length === 0) {
    return [];
  }

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

    // Filtrer les objets par type sélectionné
    const itemsByType = itemsByRarity.filter(
      (item) => item.Type === selectedType
    );

    // S'il n'y a pas d'objets du type sélectionné, prendre n'importe quel objet de cette rareté
    const eligibleItems = itemsByType.length > 0 ? itemsByType : itemsByRarity;

    // Sélectionner un objet aléatoire parmi les objets éligibles (qui n'a pas déjà été sélectionné)
    const notSelectedItems = eligibleItems.filter(
      (item) => !selectedIds.has(item.IDX)
    );

    if (notSelectedItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * notSelectedItems.length);
      const selectedItem = notSelectedItems[randomIndex];
      selectedItems.push(selectedItem);
      selectedIds.add(selectedItem.IDX);
    } else if (eligibleItems.length > 0 && selectedItems.length < count) {
      // Si tous les objets ont déjà été sélectionnés mais que nous n'avons pas atteint le nombre demandé
      // Autoriser les doublons en dernier recours
      const randomIndex = Math.floor(Math.random() * eligibleItems.length);
      selectedItems.push(eligibleItems[randomIndex]);
    }
  }

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

// Stockage simple en mémoire pour les boutiques jusqu'à ce que nous ayons une table de boutiques appropriée dans la base de données
const inMemoryShops = [];
let shopIdCounter = 1;

/**
 * Sauvegarde une boutique générée
 *
 * @param {string} name Nom de la boutique
 * @param {string} description Description de la boutique
 * @param {Array} items Liste des objets de la boutique
 * @returns {Promise<Object>} La boutique sauvegardée
 */
export async function saveShop(name, description, items) {
  // Extraire uniquement les ID des objets pour le stockage
  const itemIds = items.map((item) => item.IDX);

  // Créer une nouvelle boutique en mémoire
  const newShop = {
    id: shopIdCounter++,
    name,
    description,
    items: JSON.stringify(itemIds),
    createdAt: new Date(),
  };

  inMemoryShops.push(newShop);
  return newShop;
}

/**
 * Récupère une boutique sauvegardée avec ses objets
 *
 * @param {string} shopId ID de la boutique
 * @returns {Promise<Object>} La boutique avec ses objets
 */
export async function getShopWithItems(shopId) {
  const shop = inMemoryShops.find((shop) => shop.id === Number(shopId));

  if (!shop) {
    return null;
  }

  // Récupérer les objets à partir des ID stockés
  const itemIds = JSON.parse(shop.items);
  const items = await prisma.iTEMS.findMany({
    where: {
      IDX: { in: itemIds.map((id) => Number(id)) },
    },
  });

  return {
    ...shop,
    items,
  };
}

/**
 * Récupère toutes les boutiques sauvegardées
 *
 * @returns {Promise<Array>} Liste des boutiques
 */
export async function getAllShops() {
  return inMemoryShops.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Supprime une boutique
 *
 * @param {number} shopId ID de la boutique à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 */
export async function deleteShop(shopId) {
  const index = inMemoryShops.findIndex((shop) => shop.id === Number(shopId));

  if (index === -1) {
    throw new Error("Boutique non trouvée");
  }

  inMemoryShops.splice(index, 1);
  return { success: true };
}
