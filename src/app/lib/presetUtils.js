// src/app/lib/presetUtils.js
import { prisma } from "./db";

/**
 * Récupère tous les présets de boutique disponibles
 * @param {Object} options - Options de filtrage
 * @param {String} options.wealthLevel - Niveau de richesse pour filtrer
 * @param {String} options.shopType - Type de boutique pour filtrer
 */
export async function getPresets(options = {}) {
  const { wealthLevel, shopType } = options;

  const whereClause = {};

  if (wealthLevel) {
    whereClause.wealthLevel = wealthLevel;
  }

  if (shopType) {
    whereClause.shopType = shopType;
  }

  return await prisma.shopPreset.findMany({
    where: whereClause,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

/**
 * Récupère un preset spécifique par son ID
 * @param {Number} id - ID du preset à récupérer
 */
export async function getPresetById(id) {
  return await prisma.shopPreset.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Crée un nouveau preset de boutique
 * @param {Object} preset - Les données du preset à créer
 */
export async function createPreset(preset) {
  return await prisma.shopPreset.create({
    data: {
      name: preset.name,
      description: preset.description || null,
      wealthLevel: preset.wealthLevel,
      shopType: preset.shopType,
      typeChances: preset.typeChances,
      rarityConfig: preset.rarityConfig,
      isDefault: preset.isDefault || false,
    },
  });
}

/**
 * Met à jour un preset existant
 * @param {Number} id - ID du preset à mettre à jour
 * @param {Object} preset - Les nouvelles données du preset
 */
export async function updatePreset(id, preset) {
  // Vérifier que le preset existe
  const existingPreset = await getPresetById(id);
  if (!existingPreset) {
    throw new Error("Preset non trouvé");
  }

  // Pour les présets par défaut, ne pas modifier le statut isDefault
  let isDefault = preset.isDefault;
  if (existingPreset.isDefault) {
    isDefault = true;
  }

  return await prisma.shopPreset.update({
    where: { id: Number(id) },
    data: {
      name: preset.name,
      description: preset.description || null,
      wealthLevel: preset.wealthLevel,
      shopType: preset.shopType,
      typeChances: preset.typeChances,
      rarityConfig: preset.rarityConfig,
      isDefault: isDefault,
    },
  });
}

/**
 * Supprime un preset
 * @param {Number} id - ID du preset à supprimer
 */
export async function deletePreset(id) {
  // Vérifier que le preset existe
  const existingPreset = await getPresetById(id);
  if (!existingPreset) {
    throw new Error("Preset non trouvé");
  }

  // Supprimer même les présets par défaut
  return await prisma.shopPreset.delete({
    where: { id: Number(id) },
  });
}

/**
 * Initialise les présets par défaut dans la base de données
 * Cette fonction peut être appelée au démarrage de l'application
 */
export async function initializeDefaultPresets() {
  const defaultPresets = [
    // Armuriers
    {
      name: "Armurier pauvre",
      description: "Une petite forge de village avec des équipements basiques",
      wealthLevel: "pauvre",
      shopType: "armurier",
      typeChances: {
        Arme: 70,
        Armure: 20,
        "Équipement d'aventurier": 10,
      },
      rarityConfig: {
        Commun: 8,
        "Peu commun": 2,
        Rare: 0,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Armurier standard",
      description: "Une forge de ville offrant une bonne variété d'équipements",
      wealthLevel: "standard",
      shopType: "armurier",
      typeChances: {
        Arme: 60,
        Armure: 30,
        "Équipement d'aventurier": 10,
      },
      rarityConfig: {
        Commun: 6,
        "Peu commun": 4,
        Rare: 1,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Armurier de luxe",
      description:
        "Un forgeron d'élite servant la noblesse et les aventuriers fortunés",
      wealthLevel: "luxueux",
      shopType: "armurier",
      typeChances: {
        Arme: 55,
        Armure: 35,
        Accessoire: 5,
        "Équipement d'aventurier": 5,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 5,
        Rare: 3,
        "Très rare": 1,
        Légendaire: 0,
      },
      isDefault: true,
    },

    // Magiciens
    {
      name: "Magicien novice",
      description:
        "Une petite échoppe d'un apprenti mage vendant quelques articles magiques",
      wealthLevel: "pauvre",
      shopType: "magicien",
      typeChances: {
        Baguette: 15,
        Parchemin: 40,
        Potion: 30,
        "Objet merveilleux": 10,
        "Composant magique": 5,
      },
      rarityConfig: {
        Commun: 7,
        "Peu commun": 2,
        Rare: 0,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Magicien compétent",
      description:
        "Une boutique d'articles magiques tenue par un mage expérimenté",
      wealthLevel: "standard",
      shopType: "magicien",
      typeChances: {
        Baguette: 20,
        Parchemin: 30,
        Potion: 20,
        "Objet merveilleux": 20,
        "Composant magique": 5,
        Bâton: 5,
      },
      rarityConfig: {
        Commun: 5,
        "Peu commun": 5,
        Rare: 2,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Magicien archmage",
      description: "Un émporium magique géré par un puissant archmage",
      wealthLevel: "luxueux",
      shopType: "magicien",
      typeChances: {
        Baguette: 15,
        Parchemin: 20,
        Potion: 15,
        "Objet merveilleux": 25,
        "Composant magique": 5,
        Bâton: 15,
        Anneau: 5,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 4,
        Rare: 4,
        "Très rare": 2,
        Légendaire: 1,
      },
      isDefault: true,
    },

    // Alchimistes
    {
      name: "Alchimiste débutant",
      description: "Un petit laboratoire avec quelques potions de base",
      wealthLevel: "pauvre",
      shopType: "alchimiste",
      typeChances: {
        Potion: 60,
        Poison: 10,
        "Composant alchimique": 25,
        "Objet merveilleux": 5,
      },
      rarityConfig: {
        Commun: 8,
        "Peu commun": 2,
        Rare: 0,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Alchimiste expérimenté",
      description:
        "Un laboratoire bien équipé avec une bonne variété de produits",
      wealthLevel: "standard",
      shopType: "alchimiste",
      typeChances: {
        Potion: 50,
        Poison: 15,
        "Composant alchimique": 20,
        "Objet merveilleux": 15,
      },
      rarityConfig: {
        Commun: 5,
        "Peu commun": 4,
        Rare: 2,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Maître alchimiste",
      description: "Un grand laboratoire tenu par un maître alchimiste renommé",
      wealthLevel: "luxueux",
      shopType: "alchimiste",
      typeChances: {
        Potion: 40,
        Poison: 20,
        "Composant alchimique": 15,
        "Objet merveilleux": 25,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 4,
        Rare: 4,
        "Très rare": 1,
        Légendaire: 0,
      },
      isDefault: true,
    },

    // Général/Commerce
    {
      name: "Échoppe de village",
      description: "Un petit commerce avec des marchandises basiques",
      wealthLevel: "pauvre",
      shopType: "général",
      typeChances: {
        "Équipement d'aventurier": 40,
        Arme: 20,
        Armure: 10,
        "Objet du quotidien": 30,
      },
      rarityConfig: {
        Commun: 10,
        "Peu commun": 1,
        Rare: 0,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Boutique de ville",
      description: "Un commerce bien fourni au centre d'une ville",
      wealthLevel: "standard",
      shopType: "général",
      typeChances: {
        "Équipement d'aventurier": 30,
        Arme: 15,
        Armure: 10,
        "Objet du quotidien": 20,
        "Objet merveilleux": 15,
        Potion: 10,
      },
      rarityConfig: {
        Commun: 7,
        "Peu commun": 3,
        Rare: 1,
        "Très rare": 0,
        Légendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Bazar exotique",
      description:
        "Un marché luxueux proposant des objets rares de toutes sortes",
      wealthLevel: "luxueux",
      shopType: "général",
      typeChances: {
        "Équipement d'aventurier": 15,
        Arme: 10,
        Armure: 10,
        "Objet du quotidien": 10,
        "Objet merveilleux": 25,
        Potion: 10,
        Parchemin: 10,
        Accessoire: 10,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 4,
        Rare: 3,
        "Très rare": 1,
        Légendaire: 0,
      },
      isDefault: true,
    },
  ];

  // Vérifier si les présets par défaut existent déjà
  const existingDefaultPreset = await prisma.shopPreset.findFirst({
    where: { isDefault: true },
  });

  // S'ils n'existent pas, les créer
  if (!existingDefaultPreset) {
    console.log("Initialisation des présets par défaut...");
    for (const preset of defaultPresets) {
      await prisma.shopPreset.create({
        data: preset,
      });
    }
    console.log(`${defaultPresets.length} présets par défaut ont été créés.`);
  }
}

/**
 * Applique un preset à une configuration de boutique
 * @param {Object} preset - Le preset à appliquer
 * @param {Object} existingConfig - La configuration existante (facultatif)
 * @returns {Object} - La nouvelle configuration de boutique
 */
export function applyPresetToConfig(preset, existingConfig = {}) {
  return {
    itemsPerRarity: preset.rarityConfig,
    typeChances: preset.typeChances,
  };
}

/**
 * Liste tous les niveaux de richesse disponibles
 */
export function getWealthLevels() {
  return [
    { id: "pauvre", name: "Pauvre" },
    { id: "standard", name: "Standard" },
    { id: "luxueux", name: "Luxueux" },
  ];
}

/**
 * Liste tous les types de boutiques disponibles
 */
export function getShopTypes() {
  return [
    { id: "armurier", name: "Armurier" },
    { id: "magicien", name: "Magicien" },
    { id: "alchimiste", name: "Alchimiste" },
    { id: "général", name: "Commerce général" },
    { id: "bijoutier", name: "Bijoutier" },
    { id: "forgeron", name: "Forgeron" },
    { id: "tailleur", name: "Tailleur" },
    { id: "libraire", name: "Libraire" },
    { id: "herboriste", name: "Herboriste" },
    { id: "autre", name: "Autre" },
  ];
}
