// src/app/lib/db.js - Fichier complet modifié

import { PrismaClient } from "@prisma/client";

// Vérifier l'environnement d'exécution - client ou serveur
const isPrismaAvailable = () => {
  // Si window est défini, nous sommes côté client et ne devons pas utiliser Prisma directement
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

// Avoid creating multiple Prisma instances in development
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
 * Fonction sécurisée pour récupérer un preset via l'API
 * À utiliser dans les composants client
 */
export async function fetchPresetById(id) {
  try {
    const response = await fetch(`/api/presets/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }
    const data = await response.json();
    return data.preset;
  } catch (error) {
    console.error("Erreur lors de la récupération du preset:", error);
    throw error;
  }
}

/**
 * Fonction sécurisée pour récupérer tous les types et raretés via API
 * À utiliser dans les composants client
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
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      types: ["Armes", "Armures", "Équipement", "Outils", "Objet merveilleux"],
      rarities: ["Commun", "Peu commun", "Rare", "Très rare", "Légendaire"],
    };
  }
}

// Les fonctions suivantes ne doivent être utilisées que dans des composants serveur ou des API routes

/**
 * Get all items from the database
 */
export async function getAllItems() {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }
  return await prisma.iTEMS.findMany();
}

/**
 * Get an item by ID
 * @param {number} id - The ID of the item to retrieve
 */
export async function getItemById(id) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }
  return await prisma.iTEMS.findUnique({
    where: { IDX: Number(id) },
  });
}

/**
 * Add a new item to the database
 * @param {Object} item - The item to add
 */
export async function createItem(item) {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }
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
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
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
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }
  return await prisma.iTEMS.delete({
    where: { IDX: Number(id) },
  });
}

/**
 * Get statistics about items and shops
 */
export async function getStats() {
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }
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
  if (!isPrismaAvailable() || !prisma) {
    throw new Error("Non disponible dans l'environnement actuel");
  }

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
      return ["Armes", "Armures", "Équipement", "Outils", "Objet merveilleux"];
    }

    return types;
  } catch (error) {
    console.error("Erreur dans getUniqueTypes:", error);
    // En cas d'erreur, retourner des types par défaut
    return ["Armes", "Armures", "Équipement", "Outils", "Objet merveilleux"];
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
      return [
        "Neutre",
        "Commun",
        "Variable",
        "Peu commun",
        "Rare",
        "Très rare",
        "Légendaire",
      ];
    }

    return rarities;
  } catch (error) {
    console.error("Erreur dans getUniqueRarities:", error);
    // En cas d'erreur, retourner des raretés par défaut
    return [
      "Neutre",
      "Commun",
      "Variable",
      "Peu commun",
      "Rare",
      "Très rare",
      "Légendaire",
    ];
  }
}
