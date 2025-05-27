// lib/db.js - Version corrigée pour PostgreSQL
import { PrismaClient } from "@prisma/client";

// Vérifier l'environnement d'exécution - client ou serveur
const isPrismaAvailable = () => {
  if (typeof window !== "undefined") {
    return false;
  }
  return true;
};

// Singleton pattern pour éviter de multiples instances
const prismaClientSingleton = () => {
  if (!isPrismaAvailable()) {
    console.warn("Tentative d'initialisation de PrismaClient côté client");
    return null;
  }
  return new PrismaClient();
};

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production" && prisma)
  globalForPrisma.prisma = prisma;

/**
 * Initialize database connection
 */
export async function initDatabase() {
  if (!isPrismaAvailable()) {
    console.warn("Tentative de connexion à la base de données côté client");
    return {
      success: false,
      error: "Non disponible dans l'environnement client",
    };
  }

  try {
    if (!prisma) {
      throw new Error("PrismaClient n'a pas pu être initialisé");
    }

    await prisma.$connect();
    console.log("Database connection successful");

    return { success: true };
  } catch (error) {
    console.error("Database connection error:", error);
    return { success: false, error };
  }
}

/**
 * Fonction sécurisée pour récupérer tous les types et raretés via API
 * À utiliser dans les composants client
 */
export async function fetchTypesAndRarities() {
  try {
    const [typesResponse, raritiesResponse] = await Promise.all([
      fetch("/api/items?action=types"),
      fetch("/api/items?action=rarities"),
    ]);

    if (!typesResponse.ok || !raritiesResponse.ok) {
      throw new Error("Erreur lors de la récupération des données");
    }

    const typesData = await typesResponse.json();
    const raritiesData = await raritiesResponse.json();

    return {
      types: Array.isArray(typesData.types) ? typesData.types : [],
      rarities: Array.isArray(raritiesData.rarities)
        ? raritiesData.rarities
        : [],
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types et raretés:",
      error
    );
    return {
      types: ["Arme", "Armure", "Équipement", "Outils", "Objet merveilleux"],
      rarities: [
        "0 - Neutre",
        "1 - Commun",
        "2 - Peu Commun",
        "3 - Rare",
        "4 - Très rare",
        "5 - Légendaire",
      ],
    };
  }
}

// Fonctions côté serveur uniquement

/**
 * Get all items from the database with optional filtering
 */
export async function getAllItems(filters = {}) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  const { search, type, rarity } = filters;

  const where = {};

  if (search) {
    where.nomobjet = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (type) {
    where.type = type;
  }

  if (rarity) {
    where.rarete = rarity;
  }

  try {
    console.log("Recherche avec les filtres:", where);
    return await prisma.items.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { nomobjet: "asc" },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des items:", error);
    throw error;
  }
}

/**
 * Get an item by ID
 * @param {number} id - The ID of the item to retrieve
 */
export async function getItemById(id) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  try {
    return await prisma.items.findUnique({
      where: { index: Number(id) },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'item:", error);
    throw error;
  }
}

/**
 * Add a new item to the database
 * @param {Object} item - The item to add
 */
export async function createItem(item) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  console.log("Création d'un nouvel objet avec les données:", item);

  try {
    const result = await prisma.items.create({
      data: {
        nomobjet: item.name,
        type: item.type,
        soustype: item.subType || null,
        maitrise: item.proficiency || null,
        rarete: item.rarity,
        caracteristiques: item.characteristics || null,
        valeur: item.value || null,
        infosupplementaire: item.additionalInfo || null,
        poids: item.weight || null,
        source: item.source,
      },
    });

    console.log("Objet créé avec succès:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors de la création de l'objet:", error);
    throw error;
  }
}

/**
 * Update an existing item
 * @param {number} id - The ID of the item to update
 * @param {Object} item - The new item data
 */
export async function updateItem(id, item) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  try {
    return await prisma.items.update({
      where: { index: Number(id) },
      data: {
        nomobjet: item.name,
        type: item.type,
        soustype: item.subType || null,
        maitrise: item.proficiency || null,
        rarete: item.rarity,
        caracteristiques: item.characteristics || null,
        valeur: item.value || null,
        infosupplementaire: item.additionalInfo || null,
        poids: item.weight || null,
        source: item.source,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'objet:", error);
    throw error;
  }
}

/**
 * Delete an item from the database
 * @param {number} id - The ID of the item to delete
 */
export async function deleteItem(id) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  console.log(`Suppression de l'objet avec ID: ${id}`);

  try {
    const itemId = Number(id);

    if (isNaN(itemId)) {
      throw new Error(`ID invalide: ${id} n'est pas un nombre valide`);
    }

    const result = await prisma.items.delete({
      where: { index: itemId },
    });

    console.log("Objet supprimé avec succès:", result);
    return result;
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de l'objet avec ID ${id}:`,
      error
    );

    if (error.code === "P2025") {
      throw new Error(`Objet avec ID ${id} non trouvé dans la base de données`);
    }

    throw error;
  }
}

/**
 * Get statistics about items and shops
 */
export async function getStats() {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  try {
    const itemCount = await prisma.items.count();
    const shopCount = await prisma.shop.count();

    return {
      itemCount,
      shopCount,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return { itemCount: 0, shopCount: 0 };
  }
}

/**
 * Get all unique item types
 */
export async function getUniqueTypes() {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  try {
    console.log("Appel à getUniqueTypes");

    const items = await prisma.items.findMany({
      select: { type: true },
      distinct: ["type"],
      where: {
        type: {
          not: null,
          notIn: ["", " "],
        },
      },
    });

    const types = items
      .map((item) => item.type)
      .filter((type) => type && type.trim() !== "");

    console.log(`${types.length} types uniques trouvés:`, types);

    if (types.length === 0) {
      console.log("Aucun type trouvé, retour des valeurs par défaut");
      return ["Arme", "Armure", "Équipement", "Outils", "Objet merveilleux"];
    }

    return types;
  } catch (error) {
    console.error("Erreur dans getUniqueTypes:", error);
    return ["Arme", "Armure", "Équipement", "Outils", "Objet merveilleux"];
  }
}

/**
 * Get all unique item rarities
 */
export async function getUniqueRarities() {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

  try {
    console.log("Appel à getUniqueRarities");

    const items = await prisma.items.findMany({
      select: { rarete: true },
      distinct: ["rarete"],
      where: {
        rarete: {
          not: null,
          notIn: ["", " "],
        },
      },
    });

    const rarities = items
      .map((item) => item.rarete)
      .filter((rarity) => rarity && rarity.trim() !== "");

    console.log(`${rarities.length} raretés uniques trouvées:`, rarities);

    if (rarities.length === 0) {
      console.log("Aucune rareté trouvée, retour des valeurs par défaut");
      return [
        "0 - Neutre",
        "1 - Commun",
        "2 - Peu Commun",
        "3 - Rare",
        "4 - Très rare",
        "5 - Légendaire",
      ];
    }

    return rarities;
  } catch (error) {
    console.error("Erreur dans getUniqueRarities:", error);
    return [
      "0 - Neutre",
      "1 - Commun",
      "2 - Peu Commun",
      "3 - Rare",
      "4 - Très rare",
      "5 - Légendaire",
    ];
  }
}
