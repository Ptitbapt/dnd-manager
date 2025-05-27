// lib/presetUtils.js - Version corrigée pour PostgreSQL
import { prisma } from "./db";
import { defaultPresets } from "./defaultPresets";

/**
 * Normalise un texte pour la recherche (retire accents, caractères spéciaux, etc.)
 * @param {String} text - Le texte à normaliser
 * @returns {String} - Le texte normalisé
 */
export function normalizeText(text) {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
    .replace(/[^\w\s]/gi, "") // Retirer les caractères spéciaux
    .replace(/\s+/g, ""); // Retirer les espaces
}

/**
 * Normalise un preset pour s'assurer que ses valeurs sont cohérentes
 * @param {Object} preset - Le preset à normaliser
 * @returns {Object} - Le preset normalisé
 */
export function normalizePreset(preset) {
  if (!preset) return null;

  // Création d'une copie pour éviter de modifier l'original
  const normalizedPreset = { ...preset };

  // Normalisation de typeChances (ou typechances selon la source)
  let typeChances =
    normalizedPreset.typeChances || normalizedPreset.typechances;

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

  // Normalisation de rarityConfig (ou rarityconfig selon la source)
  let rarityConfig =
    normalizedPreset.rarityConfig || normalizedPreset.rarityconfig;

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
 * Retourne les presets par défaut (sans accès à la base de données)
 * Cette fonction peut être utilisée côté client et serveur
 * @returns {Array} - Les presets par défaut
 */
export function getDefaultPresets() {
  return defaultPresets;
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
  if (typeof window !== "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  const { wealthLevel, shopType } = options;

  const whereClause = {};

  if (wealthLevel) {
    whereClause.wealthlevel = wealthLevel; // Corrigé : wealthlevel minuscule
  }

  if (shopType) {
    whereClause.shoptype = shopType; // Corrigé : shoptype minuscule
  }

  try {
    const presets = await prisma.shopPreset.findMany({
      where: whereClause,
      orderBy: [{ isdefault: "desc" }, { name: "asc" }], // Corrigé : isdefault minuscule
    });

    // Normaliser chaque preset avant de le retourner
    return presets.map((preset) => normalizePreset(preset));
  } catch (error) {
    console.error("Erreur lors de la récupération des présets:", error);
    throw error;
  }
}

/**
 * Récupère un preset spécifique par son ID
 * @param {Number} id - ID du preset à récupérer
 */
export async function getPresetById(id) {
  if (typeof window !== "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

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
  if (typeof window !== "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  const normalizedPreset = normalizePreset(preset);

  try {
    return await prisma.shopPreset.create({
      data: {
        name: normalizedPreset.name,
        description: normalizedPreset.description || null,
        wealthlevel:
          normalizedPreset.wealthLevel || normalizedPreset.wealthlevel, // Support des deux formats
        shoptype: normalizedPreset.shopType || normalizedPreset.shoptype, // Support des deux formats
        typechances: JSON.stringify(normalizedPreset.typeChances), // Corrigé : typechances minuscule
        rarityconfig: JSON.stringify(normalizedPreset.rarityConfig), // Corrigé : rarityconfig minuscule
        isdefault: normalizedPreset.isdefault || false, // Corrigé : isdefault minuscule
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du preset:", error);
    throw error;
  }
}

/**
 * Met à jour un preset existant
 * @param {Number} id - ID du preset à mettre à jour
 * @param {Object} preset - Les nouvelles données du preset
 */
export async function updatePreset(id, preset) {
  if (typeof window !== "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  // Vérifier que le preset existe
  const existingPreset = await getPresetById(id);
  if (!existingPreset) {
    throw new Error("Preset non trouvé");
  }

  const normalizedPreset = normalizePreset(preset);

  // Pour les presets par défaut, ne pas modifier le statut isdefault
  let isdefault = normalizedPreset.isdefault;
  if (existingPreset.isdefault) {
    isdefault = true;
  }

  try {
    return await prisma.shopPreset.update({
      where: { id: Number(id) },
      data: {
        name: normalizedPreset.name,
        description: normalizedPreset.description || null,
        wealthlevel:
          normalizedPreset.wealthLevel || normalizedPreset.wealthlevel, // Support des deux formats
        shoptype: normalizedPreset.shopType || normalizedPreset.shoptype, // Support des deux formats
        typechances: JSON.stringify(normalizedPreset.typeChances), // Corrigé : typechances minuscule
        rarityconfig: JSON.stringify(normalizedPreset.rarityConfig), // Corrigé : rarityconfig minuscule
        isdefault: isdefault, // Corrigé : isdefault minuscule
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du preset:", error);
    throw error;
  }
}

/**
 * Supprime un preset
 * @param {Number} id - ID du preset à supprimer
 */
export async function deletePreset(id) {
  if (typeof window !== "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  // Vérifier que le preset existe
  const existingPreset = await getPresetById(id);
  if (!existingPreset) {
    throw new Error("Preset non trouvé");
  }

  try {
    return await prisma.shopPreset.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du preset:", error);
    throw error;
  }
}

/**
 * Initialise les présets par défaut dans la base de données
 * Cette fonction peut être appelée au démarrage de l'application
 */
export async function initializeDefaultPresets() {
  if (typeof window !== "undefined") {
    throw new Error("Cette fonction ne peut être utilisée que côté serveur");
  }

  try {
    // Vérifier si les présets par défaut existent déjà
    const existingDefaultPreset = await prisma.shopPreset.findFirst({
      where: { isdefault: true }, // Corrigé : isdefault minuscule
    });

    // S'ils n'existent pas, les créer
    if (!existingDefaultPreset) {
      console.log("Initialisation des présets par défaut...");
      for (const preset of defaultPresets) {
        // Normaliser chaque preset avant création
        const normalizedPreset = normalizePreset(preset);
        await prisma.shopPreset.create({
          data: {
            name: normalizedPreset.name,
            description: normalizedPreset.description || null,
            wealthlevel:
              normalizedPreset.wealthLevel || normalizedPreset.wealthlevel, // Support des deux formats
            shoptype: normalizedPreset.shopType || normalizedPreset.shoptype, // Support des deux formats
            typechances: JSON.stringify(normalizedPreset.typeChances), // Corrigé : typechances minuscule
            rarityconfig: JSON.stringify(normalizedPreset.rarityConfig), // Corrigé : rarityconfig minuscule
            isdefault: normalizedPreset.isdefault || false, // Corrigé : isdefault minuscule
          },
        });
      }
      console.log(`${defaultPresets.length} présets par défaut ont été créés.`);
    } else {
      console.log("Présets par défaut déjà présents dans la base de données.");
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation des présets par défaut:",
      error
    );
    throw error;
  }
}
