// lib/utils.js
/**
 * Formate le nom d'un objet pour l'URL d'AideDD
 * @param {string} name - Le nom de l'objet à formater
 * @returns {string} Le nom formaté pour l'URL
 */
export const formatNameForAideDD = (name) => {
  // Vérification défensive
  if (!name) {
    return "";
  }

  if (typeof name !== "string") {
    console.error("formatNameForAideDD: valeur non-chaîne reçue", name);
    return "";
  }

  try {
    // Traitement spécifique pour "armes" et "armures"
    let modifiedName = name
      .toLowerCase()
      // Remplacer "armes" par "arme" et "armures" par "armure" (au début ou avec un espace devant)
      .replace(/(\s|^)armes(\s|$)/g, "$1arme$2")
      .replace(/(\s|^)armures(\s|$)/g, "$1armure$2");

    // Continuer avec le reste des transformations
    return modifiedName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les diacritiques
      .replace(/\+\s*(\d)/g, "$1") // Remplacer "+1", "+2" etc. par "1", "2" etc.
      .replace(/'/g, "-") // Remplacer les apostrophes par des tirets
      .replace(/%/g, "pourcent") // Remplacer les % par "pourcent"
      .replace(/,/g, "") // Supprimer les virgules
      .replace(/\./g, "") // Supprimer les points
      .replace(/\(/g, "") // Supprimer les parenthèses ouvrantes
      .replace(/\)/g, "") // Supprimer les parenthèses fermantes
      .replace(/!/g, "") // Supprimer les points d'exclamation
      .replace(/\?/g, "") // Supprimer les points d'interrogation
      .replace(/'/g, "-") // Remplacer les apostrophes par des tirets
      .replace(/"/g, "") // Supprimer les guillemets
      .replace(/:/g, "") // Supprimer les deux-points
      .replace(/;/g, "") // Supprimer les points-virgules
      .replace(/&/g, "et") // Remplacer & par "et"
      .replace(/\//g, "-") // Remplacer / par -
      .replace(/\\/g, "-") // Remplacer \ par -
      .replace(/[^a-z0-9\s-]/g, "-") // Remplacer tous les autres caractères spéciaux par des tirets
      .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
      .replace(/-+/g, "-") // Remplacer les séquences de tirets par un seul tiret
      .replace(/^-|-$/g, ""); // Supprimer les tirets au début et à la fin
  } catch (error) {
    console.error("Erreur dans formatNameForAideDD:", error);
    return "";
  }
};

/**
 * Normalise le texte pour la recherche (enlève accents, espaces, et met en minuscule)
 * @param {string} text - Le texte à normaliser
 * @returns {string} Le texte normalisé
 */
export const normalizeText = (text) => {
  // Vérification défensive mais sans logguer d'erreur pour les chaînes vides
  // car c'est un cas légitime (champ de recherche vide)
  if (!text) {
    return "";
  }

  if (typeof text !== "string") {
    console.error("normalizeText: valeur non-chaîne reçue", text);
    return "";
  }

  try {
    return text
      .toLowerCase()
      .normalize("NFD") // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les diacritiques
      .replace(/\s+/g, ""); // Supprimer les espaces
  } catch (error) {
    console.error("Erreur dans normalizeText:", error);
    return "";
  }
};

/**
 * Génère une URL AideDD pour un objet D&D
 * @param {string} name - Le nom de l'objet
 * @returns {string} L'URL complète vers la page AideDD de l'objet
 */
export const getAideDDUrl = (name) => {
  // Vérification défensive
  if (!name) {
    return "https://www.aidedd.org/dnd/om.php";
  }

  if (typeof name !== "string") {
    console.error("getAideDDUrl: valeur non-chaîne reçue", name);
    return "https://www.aidedd.org/dnd/om.php";
  }

  try {
    const formattedName = formatNameForAideDD(name);
    return formattedName
      ? `https://www.aidedd.org/dnd/om.php?vf=${formattedName}`
      : "https://www.aidedd.org/dnd/om.php";
  } catch (error) {
    console.error("Erreur dans getAideDDUrl:", error);
    return "https://www.aidedd.org/dnd/om.php";
  }
};

/**
 * Renvoie une classe de couleur CSS basée sur le type d'objet
 * @param {string} type - Le type d'objet
 * @returns {string} La classe CSS de couleur correspondante
 */
export const getTypeColor = (type) => {
  // Vérification défensive
  if (!type) {
    return "bg-indigo-500"; // Valeur par défaut
  }

  if (typeof type !== "string") {
    console.error("getTypeColor: valeur non-chaîne reçue", type);
    return "bg-indigo-500"; // Valeur par défaut
  }

  try {
    const typeLower = type.toLowerCase();

    if (typeLower.includes("arme")) return "bg-red-500";
    if (typeLower.includes("armure")) return "bg-gray-500";
    if (typeLower.includes("potion")) return "bg-purple-500";
    if (typeLower.includes("parchemin")) return "bg-yellow-500";
    if (typeLower.includes("baguette")) return "bg-blue-500";
    if (typeLower.includes("anneau")) return "bg-pink-500";
    if (typeLower.includes("bâton")) return "bg-green-500";
    if (typeLower.includes("sceptre")) return "bg-orange-500";

    return "bg-indigo-500"; // Valeur par défaut
  } catch (error) {
    console.error("Erreur dans getTypeColor:", error);
    return "bg-indigo-500"; // Valeur par défaut
  }
};

/**
 * Renvoie des classes CSS pour l'affichage de la rareté d'un objet
 * @param {string} rarity - La rareté de l'objet
 * @returns {string} Les classes CSS correspondantes
 */
export const getRarityClasses = (rarity) => {
  // Vérification défensive
  if (!rarity) {
    return "bg-gray-200 text-gray-800"; // Valeur par défaut
  }

  if (typeof rarity !== "string") {
    console.error("getRarityClasses: valeur non-chaîne reçue", rarity);
    return "bg-gray-200 text-gray-800"; // Valeur par défaut
  }

  try {
    const rarityLower = rarity.toLowerCase();

    if (
      rarityLower.includes("commun") ||
      rarityLower === "neutre" ||
      rarityLower === "variable"
    ) {
      return "bg-gray-200 text-gray-800";
    }
    if (rarityLower.includes("peu commun")) {
      return "bg-green-100 text-green-800 border border-green-300";
    }
    if (rarityLower.includes("rare")) {
      return "bg-blue-100 text-blue-800 border border-blue-300";
    }
    if (rarityLower.includes("très rare")) {
      return "bg-purple-100 text-purple-800 border border-purple-300";
    }
    if (rarityLower.includes("légendaire")) {
      return "bg-indigo-100 text-indigo-800 border border-indigo-300";
    }

    return "bg-red-100 text-red-800 border border-red-300"; // Valeur par défaut
  } catch (error) {
    console.error("Erreur dans getRarityClasses:", error);
    return "bg-gray-200 text-gray-800"; // Valeur par défaut
  }
};

/**
 * Vérifie si une valeur est une chaîne de caractères valide et non vide
 * @param {any} value - La valeur à vérifier
 * @returns {boolean} Vrai si c'est une chaîne valide non vide, faux sinon
 */
export const isValidString = (value) => {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "string" &&
    value.trim() !== ""
  );
};
