// lib/db.js - version corrigée pour les valeurs décimales
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
  // Utiliser une requête SQL directe pour récupérer les données
  // cela contourne le problème de conversion des types
  const items = await prisma.$queryRaw`SELECT * FROM ITEMS`;

  // Conversion manuelle des valeurs décimales
  return items.map((item) => ({
    ...item,
    // Convertir manuellement la valeur en nombre si elle existe
    Valeur: item.Valeur
      ? parseFloat(String(item.Valeur).replace(",", "."))
      : null,
  }));
}

/**
 * Get an item by ID
 * @param {number} id - The ID of the item to retrieve
 */
export async function getItemById(id) {
  const item = await prisma.$queryRaw`SELECT * FROM ITEMS WHERE IDX = ${Number(
    id
  )}`;
  if (item && item.length > 0) {
    return {
      ...item[0],
      Valeur: item[0].Valeur
        ? parseFloat(String(item[0].Valeur).replace(",", "."))
        : null,
    };
  }
  return null;
}

/**
 * Add a new item to the database
 * @param {Object} item - The item to add
 */
export async function createItem(item) {
  // S'assurer que la valeur est au format correct pour SQLite
  let valeur = null;
  if (item.value) {
    // Convertir en string, remplacer la virgule par un point et convertir en float
    valeur = parseFloat(String(item.value).replace(",", "."));
  }

  return await prisma.iTEMS.create({
    data: {
      Nomobjet: item.name,
      Type: item.type,
      Soustype: item.subType || null,
      Maitrise: item.proficiency || null,
      Rarete: item.rarity,
      Caractéristiques: item.characteristics || null,
      Valeur: valeur,
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
  // S'assurer que la valeur est au format correct pour SQLite
  let valeur = null;
  if (item.value) {
    // Convertir en string, remplacer la virgule par un point et convertir en float
    valeur = parseFloat(String(item.value).replace(",", "."));
  }

  return await prisma.iTEMS.update({
    where: { IDX: Number(id) },
    data: {
      Nomobjet: item.name,
      Type: item.type,
      Soustype: item.subType || null,
      Maitrise: item.proficiency || null,
      Rarete: item.rarity,
      Caractéristiques: item.characteristics || null,
      Valeur: valeur,
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
 * Get statistics about items
 */
export async function getStats() {
  const itemCount = await prisma.iTEMS.count();
  // La table Shop n'existe pas encore, donc on retourne 0 pour shopCount
  const shopCount = 0;

  return {
    itemCount,
    shopCount,
  };
}

/**
 * Get all unique item types
 */
export async function getUniqueTypes() {
  const items = await prisma.iTEMS.findMany({
    select: { Type: true },
    distinct: ["Type"],
  });
  return items.map((item) => item.Type);
}

/**
 * Get all unique item rarities
 */
export async function getUniqueRarities() {
  const items = await prisma.iTEMS.findMany({
    select: { Rarete: true },
    distinct: ["Rarete"],
  });
  return items.map((item) => item.Rarete);
}
