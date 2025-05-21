// lib/presetUtils.js
import { prisma } from "./db";

/**
 * Normalise un preset pour s'assurer que ses valeurs sont cohérentes
 * @param {Object} preset - Le preset à normaliser
 * @returns {Object} - Le preset normalisé
 */
export function normalizePreset(preset) {
  if (!preset) return null;

  // Création d'une copie pour éviter de modifier l'original
  const normalizedPreset = { ...preset };

  // Normalisation de typeChances
  let typeChances = normalizedPreset.typeChances;

  // Si c'est une chaîne JSON, la parser
  if (typeof typeChances === "string") {
    try {
      typeChances = JSON.parse(typeChances);
    } catch (e) {
      console.error("Erreur lors du parsing de typeChances:", e);
      typeChances = {};
    }
  }

  // Si ce n'est pas un objet ou est null, initialiser un objet vide
  if (!typeChances || typeof typeChances !== "object") {
    typeChances = {};
  }

  // S'assurer que toutes les valeurs sont des nombres et calculer le total
  let totalPercentage = 0;
  const typeKeys = Object.keys(typeChances);

  typeKeys.forEach((key) => {
    typeChances[key] = parseInt(typeChances[key]) || 0;
    totalPercentage += typeChances[key];
  });

  // Normaliser les pourcentages pour qu'ils totalisent 100% si nécessaire
  if (totalPercentage !== 100 && typeKeys.length > 0) {
    console.log(
      `Normalisation des pourcentages pour le preset ${
        preset.id || "nouveau"
      }: total actuel = ${totalPercentage}%`
    );

    // Si le total est 0, distribution égale
    if (totalPercentage === 0) {
      const baseValue = Math.floor(100 / typeKeys.length);
      let remaining = 100;

      for (let i = 0; i < typeKeys.length - 1; i++) {
        typeChances[typeKeys[i]] = baseValue;
        remaining -= baseValue;
      }

      typeChances[typeKeys[typeKeys.length - 1]] = remaining;
    }
    // Sinon, normaliser selon les proportions actuelles
    else {
      const factor = 100 / totalPercentage;
      let newTotal = 0;

      for (let i = 0; i < typeKeys.length - 1; i++) {
        const key = typeKeys[i];
        const adjustedValue = Math.round(typeChances[key] * factor);
        typeChances[key] = adjustedValue;
        newTotal += adjustedValue;
      }

      typeChances[typeKeys[typeKeys.length - 1]] = 100 - newTotal;
    }

    // Vérification finale
    const finalTotal = Object.values(typeChances).reduce(
      (sum, val) => sum + val,
      0
    );
    console.log(`Après normalisation, le total est de ${finalTotal}%`);
  }

  // Normalisation de rarityConfig
  let rarityConfig = normalizedPreset.rarityConfig;

  // Si c'est une chaîne JSON, la parser
  if (typeof rarityConfig === "string") {
    try {
      rarityConfig = JSON.parse(rarityConfig);
    } catch (e) {
      console.error("Erreur lors du parsing de rarityConfig:", e);
      rarityConfig = {};
    }
  }

  // Si ce n'est pas un objet ou est null, initialiser un objet vide
  if (!rarityConfig || typeof rarityConfig !== "object") {
    rarityConfig = {};
  }

  // S'assurer que toutes les valeurs sont des nombres positifs
  Object.keys(rarityConfig).forEach((key) => {
    rarityConfig[key] = Math.max(0, parseInt(rarityConfig[key]) || 0);
  });

  // Mettre à jour le preset avec les valeurs normalisées
  normalizedPreset.typeChances = typeChances;
  normalizedPreset.rarityConfig = rarityConfig;

  return normalizedPreset;
}

// ==================================================================================
// SECTION CLIENT-SIDE SAFE
// Ces fonctions n'utilisent pas Prisma directement et peuvent être utilisées côté client
// ==================================================================================

// Voir lib/shopGeneratorUtils.js pour les fonctions fetchPresets, fetchPresetById, etc.

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

/**
 * Applique un preset à une configuration de boutique
 * @param {Object} preset - Le preset à appliquer
 * @param {Object} existingConfig - La configuration existante (facultatif)
 * @returns {Object} - La nouvelle configuration de boutique
 */
export function applyPresetToConfig(preset, existingConfig = {}) {
  // Normaliser le preset avant de l'appliquer
  const normalizedPreset = normalizePreset(preset);

  return {
    itemsPerRarity: normalizedPreset.rarityConfig,
    typeChances: normalizedPreset.typeChances,
  };
}

// ==================================================================================
// SECTION SERVER-SIDE ONLY
// Ces fonctions utilisent Prisma et doivent être exécutées uniquement côté serveur
// ==================================================================================

/**
 * Récupère tous les presets de boutique disponibles
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

  const presets = await prisma.shopPreset.findMany({
    where: whereClause,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  // Normaliser chaque preset avant de le retourner
  return presets.map((preset) => normalizePreset(preset));
}

/**
 * Récupère un preset spécifique par son ID
 * @param {Number} id - ID du preset à récupérer
 */
export async function getPresetById(id) {
  // Vérifier que nous avons un ID valide
  if (!id) return null;

  try {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    const preset = await prisma.shopPreset.findUnique({
      where: { id: numericId },
    });

    return normalizePreset(preset);
  } catch (error) {
    console.error("Erreur lors de la récupération du preset:", error);
    return null;
  }
}

/**
 * Crée un nouveau preset de boutique
 * @param {Object} preset - Les données du preset à créer
 */
export async function createPreset(preset) {
  const normalizedPreset = normalizePreset(preset);

  return await prisma.shopPreset.create({
    data: {
      name: normalizedPreset.name,
      description: normalizedPreset.description || null,
      wealthLevel: normalizedPreset.wealthLevel,
      shopType: normalizedPreset.shopType,
      typeChances: normalizedPreset.typeChances,
      rarityConfig: normalizedPreset.rarityConfig,
      isDefault: normalizedPreset.isDefault || false,
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

  const normalizedPreset = normalizePreset(preset);

  // Pour les presets par défaut, ne pas modifier le statut isDefault
  let isDefault = normalizedPreset.isDefault;
  if (existingPreset.isDefault) {
    isDefault = true;
  }

  return await prisma.shopPreset.update({
    where: { id: Number(id) },
    data: {
      name: normalizedPreset.name,
      description: normalizedPreset.description || null,
      wealthLevel: normalizedPreset.wealthLevel,
      shopType: normalizedPreset.shopType,
      typeChances: normalizedPreset.typeChances,
      rarityConfig: normalizedPreset.rarityConfig,
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

  // Supprimer même les presets par défaut
  return await prisma.shopPreset.delete({
    where: { id: Number(id) },
  });
}

/**
 * Initialise les présets par défaut dans la base de données
 * Cette fonction peut être appelée au démarrage de l'application
 */
export async function initializeDefaultPresets() {
  // Définir les types et raretés valides selon votre application
  const validTypes = [
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
  ];

  const validRarities = [
    "Neutre",
    "Commun",
    "Variable",
    "Peu commun",
    "Peu commun (+1) Rare",
    "Rareté selon le type",
    "Rare",
    "Rare (+1) Très rare",
    "Rare (argent ou airain)",
    "Très rare",
    "Très rare ou Legendaire",
    "Legendaire",
    "Artéfact",
  ];

  const defaultPresets = [
    // Armuriers
    {
      name: "Armurier pauvre",
      description: "Une petite forge de village avec des équipements basiques",
      wealthLevel: "pauvre",
      shopType: "armurier",
      typeChances: {
        Armes: 70,
        Armures: 20,
        Équipement: 10,
      },
      rarityConfig: {
        Commun: 8,
        "Peu commun": 2,
        Rare: 0,
        "Très rare": 0,
        Legendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Armurier standard",
      description: "Une forge de ville offrant une bonne variété d'équipements",
      wealthLevel: "standard",
      shopType: "armurier",
      typeChances: {
        Armes: 60,
        Armures: 30,
        Équipement: 10,
      },
      rarityConfig: {
        Commun: 6,
        "Peu commun": 4,
        Rare: 1,
        "Très rare": 0,
        Legendaire: 0,
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
        Armes: 55,
        Armures: 35,
        Anneau: 5,
        Équipement: 5,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 5,
        Rare: 3,
        "Très rare": 1,
        Legendaire: 0,
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
        "Objet merveilleux": 15,
      },
      rarityConfig: {
        Commun: 7,
        "Peu commun": 2,
        Rare: 0,
        "Très rare": 0,
        Legendaire: 0,
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
        Bâton: 10,
      },
      rarityConfig: {
        Commun: 5,
        "Peu commun": 5,
        Rare: 2,
        "Très rare": 0,
        Legendaire: 0,
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
        Bâton: 15,
        Anneau: 10,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 4,
        Rare: 4,
        "Très rare": 2,
        Legendaire: 1,
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
        Potion: 80,
        "Objet merveilleux": 20,
      },
      rarityConfig: {
        Commun: 8,
        "Peu commun": 2,
        Rare: 0,
        "Très rare": 0,
        Legendaire: 0,
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
        Potion: 70,
        "Objet merveilleux": 30,
      },
      rarityConfig: {
        Commun: 5,
        "Peu commun": 4,
        Rare: 2,
        "Très rare": 0,
        Legendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Maître alchimiste",
      description: "Un grand laboratoire tenu par un maître alchimiste renommé",
      wealthLevel: "luxueux",
      shopType: "alchimiste",
      typeChances: {
        Potion: 60,
        "Objet merveilleux": 40,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 4,
        Rare: 4,
        "Très rare": 1,
        Legendaire: 0,
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
        Équipement: 40,
        Armes: 20,
        Armures: 10,
        Outils: 30,
      },
      rarityConfig: {
        Commun: 10,
        "Peu commun": 1,
        Rare: 0,
        "Très rare": 0,
        Legendaire: 0,
      },
      isDefault: true,
    },
    {
      name: "Boutique de ville",
      description: "Un commerce bien fourni au centre d'une ville",
      wealthLevel: "standard",
      shopType: "général",
      typeChances: {
        Équipement: 30,
        Armes: 15,
        Armures: 10,
        Outils: 20,
        "Objet merveilleux": 15,
        Potion: 10,
      },
      rarityConfig: {
        Commun: 7,
        "Peu commun": 3,
        Rare: 1,
        "Très rare": 0,
        Legendaire: 0,
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
        Équipement: 15,
        Armes: 10,
        Armures: 10,
        Outils: 10,
        "Objet merveilleux": 25,
        Potion: 10,
        Parchemin: 10,
        Anneau: 10,
      },
      rarityConfig: {
        Commun: 3,
        "Peu commun": 4,
        Rare: 3,
        "Très rare": 1,
        Legendaire: 0,
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
      // Normaliser chaque preset avant création
      const normalizedPreset = normalizePreset(preset);
      await prisma.shopPreset.create({
        data: normalizedPreset,
      });
    }
    console.log(`${defaultPresets.length} présets par défaut ont été créés.`);
  }
}
