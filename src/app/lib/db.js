// src/app/lib/db.js - Fichier complet modifié

import { PrismaClient } from "@prisma/client";

// Avoid creating multiple Prisma instances in development
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Initialize database connection
 */
export async function initDatabase() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");

    return { success: true };
  } catch (error) {
    console.error("Database connection error:", error);
    return { success: false, error };
  }
}

/**
 * Get all items from the database
 */
export async function getAllItems() {
  return await prisma.iTEMS.findMany();
}

/**
 * Get an item by ID
 * @param {number} id - The ID of the item to retrieve
 */
export async function getItemById(id) {
  return await prisma.iTEMS.findUnique({
    where: { IDX: Number(id) },
  });
}

/**
 * Add a new item to the database
 * @param {Object} item - The item to add
 */
export async function createItem(item) {
  return await prisma.iTEMS.create({
    data: {
      Nomobjet: item.name,
      Type: item.type,
      Soustype: item.subType || null,
      Maitrise: item.proficiency || null,
      Rarete: item.rarity,
      Caractéristiques: item.characteristics || null,
      Valeur: item.value ? parseFloat(item.value) : null,
      Infosupplémentaire: item.additionalInfo || null,
      Poids: item.weight || null,
      Source: item.source,
    },
  });
}

/**
 * Update an existing item
 * @param {number} id - The ID of the item to update
 * @param {Object} item - The new item data
 */
export async function updateItem(id, item) {
  return await prisma.iTEMS.update({
    where: { IDX: Number(id) },
    data: {
      Nomobjet: item.name,
      Type: item.type,
      Soustype: item.subType || null,
      Maitrise: item.proficiency || null,
      Rarete: item.rarity,
      Caractéristiques: item.characteristics || null,
      Valeur: item.value ? parseFloat(item.value) : null,
      Infosupplémentaire: item.additionalInfo || null,
      Poids: item.weight || null,
      Source: item.source,
    },
  });
}

/**
 * Delete an item from the database
 * @param {number} id - The ID of the item to delete
 */
export async function deleteItem(id) {
  return await prisma.iTEMS.delete({
    where: { IDX: Number(id) },
  });
}

/**
 * Get statistics about items and shops
 */
export async function getStats() {
  const itemCount = await prisma.iTEMS.count();
  const shopCount = await prisma.shop.count();

  return {
    itemCount,
    shopCount,
  };
}

/**
 * Get all unique item types
 */
export async function getUniqueTypes() {
  try {
    console.log("Appel à getUniqueTypes");
    const items = await prisma.iTEMS.findMany({
      select: { Type: true },
      distinct: ["Type"],
      where: {
        // Exclure les valeurs null ou vides
        Type: {
          not: null,
          notIn: ["", " "],
        },
      },
    });

    // Extraire et filtrer les types
    const types = items
      .map((item) => item.Type)
      .filter((type) => type && type.trim() !== ""); // Éliminer les types vides

    console.log(`${types.length} types uniques trouvés:`, types);

    // Si aucun type n'est trouvé, retourner des valeurs par défaut
    if (types.length === 0) {
      console.log("Aucun type trouvé, retour des valeurs par défaut");
      return ["Arme", "Armure", "Équipement", "Objet merveilleux", "Potion"];
    }

    return types;
  } catch (error) {
    console.error("Erreur dans getUniqueTypes:", error);
    // En cas d'erreur, retourner des types par défaut
    return ["Arme", "Armure", "Équipement", "Objet merveilleux", "Potion"];
  }
}

/**
 * Get all unique item rarities
 */
export async function getUniqueRarities() {
  try {
    console.log("Appel à getUniqueRarities");
    const items = await prisma.iTEMS.findMany({
      select: { Rarete: true },
      distinct: ["Rarete"],
      where: {
        // Exclure les valeurs null ou vides
        Rarete: {
          not: null,
          notIn: ["", " "],
        },
      },
    });

    // Extraire et filtrer les raretés
    const rarities = items
      .map((item) => item.Rarete)
      .filter((rarity) => rarity && rarity.trim() !== ""); // Éliminer les raretés vides

    console.log(`${rarities.length} raretés uniques trouvées:`, rarities);

    // Si aucune rareté n'est trouvée, retourner des valeurs par défaut
    if (rarities.length === 0) {
      console.log("Aucune rareté trouvée, retour des valeurs par défaut");
      return ["Commun", "Peu commun", "Rare", "Très rare", "Légendaire"];
    }

    return rarities;
  } catch (error) {
    console.error("Erreur dans getUniqueRarities:", error);
    // En cas d'erreur, retourner des raretés par défaut
    return ["Commun", "Peu commun", "Rare", "Très rare", "Légendaire"];
  }
}
