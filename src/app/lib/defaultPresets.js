// lib/defaultPresets.js

/**
 * Présets par défaut pour l'application DnD Shop Generator
 * Couvrent tous les niveaux de richesse et types de boutiques principaux
 */
export const defaultPresets = [
  // ==================================================================================
  // ARMURIERS
  // ==================================================================================
  {
    name: "Armurier pauvre",
    description:
      "Une petite forge de village avec des équipements basiques et usagés",
    wealthLevel: "pauvre",
    shopType: "armurier",
    typeChances: {
      Arme: 60,
      Armure: 30,
      Équipement: 10,
    },
    rarityConfig: {
      "0 - Neutre": 8,
      "1 - Commun": 4,
      "2 - Peu commun": 1,
      "3 - Rare": 0,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Armurier standard",
    description:
      "Forge bien établie offrant un bon choix d'armes et d'armures de qualité",
    wealthLevel: "standard",
    shopType: "armurier",
    typeChances: {
      Arme: 50,
      Armure: 35,
      Équipement: 15,
    },
    rarityConfig: {
      "0 - Neutre": 5,
      "1 - Commun": 8,
      "2 - Peu commun": 4,
      "3 - Rare": 2,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Armurier luxueux",
    description:
      "Forge de maître réputée, proposant des équipements exceptionnels et enchantés",
    wealthLevel: "luxueux",
    shopType: "armurier",
    typeChances: {
      Arme: 45,
      Armure: 40,
      Équipement: 10,
      "Objet merveilleux": 5,
    },
    rarityConfig: {
      "0 - Neutre": 2,
      "1 - Commun": 6,
      "2 - Peu commun": 8,
      "3 - Rare": 5,
      "4 - Très rare": 2,
      "5 - Légendaire": 1,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },

  // ==================================================================================
  // MAGICIENS
  // ==================================================================================
  {
    name: "Magicien pauvre",
    description:
      "Apprenti sorcier vendant quelques objets magiques simples et parchemins",
    wealthLevel: "pauvre",
    shopType: "magicien",
    typeChances: {
      Parchemin: 40,
      Potion: 25,
      Baguette: 20,
      "Objet merveilleux": 15,
    },
    rarityConfig: {
      "0 - Neutre": 6,
      "1 - Commun": 5,
      "2 - Peu commun": 2,
      "3 - Rare": 0,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Magicien standard",
    description:
      "Boutique magique bien achalandée avec variété d'objets enchantés",
    wealthLevel: "standard",
    shopType: "magicien",
    typeChances: {
      Parchemin: 25,
      Potion: 25,
      Baguette: 20,
      "Objet merveilleux": 20,
      Anneau: 10,
    },
    rarityConfig: {
      "0 - Neutre": 3,
      "1 - Commun": 6,
      "2 - Peu commun": 6,
      "3 - Rare": 3,
      "4 - Très rare": 1,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Magicien luxueux",
    description:
      "Archimage réputé proposant des objets magiques rares et puissants",
    wealthLevel: "luxueux",
    shopType: "magicien",
    typeChances: {
      "Objet merveilleux": 25,
      Baguette: 20,
      Bâton: 15,
      Anneau: 15,
      Sceptre: 10,
      Parchemin: 10,
      Potion: 5,
    },
    rarityConfig: {
      "0 - Neutre": 1,
      "1 - Commun": 3,
      "2 - Peu commun": 6,
      "3 - Rare": 8,
      "4 - Très rare": 4,
      "5 - Légendaire": 2,
      "6 - Artéfact": 1,
    },
    isDefault: true,
  },

  // ==================================================================================
  // ALCHIMISTES
  // ==================================================================================
  {
    name: "Alchimiste pauvre",
    description:
      "Petit laboratoire d'herboriste avec potions et remèdes de base",
    wealthLevel: "pauvre",
    shopType: "alchimiste",
    typeChances: {
      Potion: 70,
      Équipement: 20,
      Outils: 10,
    },
    rarityConfig: {
      "0 - Neutre": 8,
      "1 - Commun": 4,
      "2 - Peu commun": 1,
      "3 - Rare": 0,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Alchimiste standard",
    description:
      "Laboratoire d'alchimie proposant une gamme variée de potions et élixirs",
    wealthLevel: "standard",
    shopType: "alchimiste",
    typeChances: {
      Potion: 60,
      "Objet merveilleux": 15,
      Équipement: 15,
      Outils: 10,
    },
    rarityConfig: {
      "0 - Neutre": 4,
      "1 - Commun": 7,
      "2 - Peu commun": 5,
      "3 - Rare": 2,
      "4 - Très rare": 1,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Alchimiste luxueux",
    description:
      "Maître alchimiste proposant des élixirs rares et des potions puissantes",
    wealthLevel: "luxueux",
    shopType: "alchimiste",
    typeChances: {
      Potion: 50,
      "Objet merveilleux": 25,
      Équipement: 15,
      Outils: 10,
    },
    rarityConfig: {
      "0 - Neutre": 2,
      "1 - Commun": 5,
      "2 - Peu commun": 7,
      "3 - Rare": 5,
      "4 - Très rare": 3,
      "5 - Légendaire": 1,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },

  // ==================================================================================
  // COMMERCE GÉNÉRAL
  // ==================================================================================
  {
    name: "Commerce général pauvre",
    description:
      "Petite boutique de village avec un assortiment d'objets du quotidien",
    wealthLevel: "pauvre",
    shopType: "général",
    typeChances: {
      Équipement: 40,
      Outils: 30,
      Arme: 20,
      Armure: 10,
    },
    rarityConfig: {
      "0 - Neutre": 10,
      "1 - Commun": 3,
      "2 - Peu commun": 0,
      "3 - Rare": 0,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Commerce général standard",
    description:
      "Magasin bien achalandé proposant une grande variété d'articles",
    wealthLevel: "standard",
    shopType: "général",
    typeChances: {
      Équipement: 30,
      Outils: 25,
      Arme: 20,
      Armure: 15,
      Potion: 10,
    },
    rarityConfig: {
      "0 - Neutre": 6,
      "1 - Commun": 8,
      "2 - Peu commun": 3,
      "3 - Rare": 1,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Commerce général luxueux",
    description:
      "Grand magasin de prestige avec des articles de qualité supérieure",
    wealthLevel: "luxueux",
    shopType: "général",
    typeChances: {
      Équipement: 25,
      "Objet merveilleux": 20,
      Arme: 15,
      Armure: 15,
      Outils: 15,
      Potion: 10,
    },
    rarityConfig: {
      "0 - Neutre": 3,
      "1 - Commun": 6,
      "2 - Peu commun": 6,
      "3 - Rare": 4,
      "4 - Très rare": 2,
      "5 - Légendaire": 1,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },

  // ==================================================================================
  // BIJOUTIERS
  // ==================================================================================
  {
    name: "Bijoutier pauvre",
    description: "Petit atelier d'orfèvre avec quelques bijoux simples",
    wealthLevel: "pauvre",
    shopType: "bijoutier",
    typeChances: {
      Anneau: 50,
      "Objet merveilleux": 30,
      Équipement: 20,
    },
    rarityConfig: {
      "0 - Neutre": 7,
      "1 - Commun": 4,
      "2 - Peu commun": 1,
      "3 - Rare": 0,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Bijoutier standard",
    description:
      "Bijouterie réputée proposant des pièces fines et quelques objets enchantés",
    wealthLevel: "standard",
    shopType: "bijoutier",
    typeChances: {
      Anneau: 40,
      "Objet merveilleux": 35,
      Équipement: 15,
      Sceptre: 10,
    },
    rarityConfig: {
      "0 - Neutre": 3,
      "1 - Commun": 6,
      "2 - Peu commun": 5,
      "3 - Rare": 3,
      "4 - Très rare": 1,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Bijoutier luxueux",
    description:
      "Maître joaillier créant des pièces exceptionnelles et des objets magiques rares",
    wealthLevel: "luxueux",
    shopType: "bijoutier",
    typeChances: {
      Anneau: 35,
      "Objet merveilleux": 30,
      Sceptre: 20,
      Baguette: 15,
    },
    rarityConfig: {
      "0 - Neutre": 1,
      "1 - Commun": 3,
      "2 - Peu commun": 5,
      "3 - Rare": 7,
      "4 - Très rare": 4,
      "5 - Légendaire": 2,
      "6 - Artéfact": 1,
    },
    isDefault: true,
  },

  // ==================================================================================
  // FORGERONS
  // ==================================================================================
  {
    name: "Forgeron pauvre",
    description: "Forge de village spécialisée dans les outils et réparations",
    wealthLevel: "pauvre",
    shopType: "forgeron",
    typeChances: {
      Outils: 50,
      Arme: 30,
      Équipement: 20,
    },
    rarityConfig: {
      "0 - Neutre": 9,
      "1 - Commun": 3,
      "2 - Peu commun": 1,
      "3 - Rare": 0,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Forgeron standard",
    description: "Forgeron expérimenté créant des outils et armes de qualité",
    wealthLevel: "standard",
    shopType: "forgeron",
    typeChances: {
      Outils: 40,
      Arme: 35,
      Équipement: 15,
      Armure: 10,
    },
    rarityConfig: {
      "0 - Neutre": 5,
      "1 - Commun": 7,
      "2 - Peu commun": 4,
      "3 - Rare": 2,
      "4 - Très rare": 0,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
  {
    name: "Forgeron luxueux",
    description: "Maître forgeron réputé pour ses créations exceptionnelles",
    wealthLevel: "luxueux",
    shopType: "forgeron",
    typeChances: {
      Arme: 40,
      Outils: 30,
      Armure: 20,
      Équipement: 10,
    },
    rarityConfig: {
      "0 - Neutre": 2,
      "1 - Commun": 5,
      "2 - Peu commun": 7,
      "3 - Rare": 5,
      "4 - Très rare": 3,
      "5 - Légendaire": 1,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },

  // ==================================================================================
  // PRESET ÉQUILIBRÉ (exemple de référence)
  // ==================================================================================
  {
    name: "Boutique équilibrée",
    description: "Configuration équilibrée pour tester tous les types d'objets",
    wealthLevel: "standard",
    shopType: "général",
    typeChances: {
      Arme: 9,
      Armure: 9,
      Équipement: 9,
      Outils: 9,
      Potion: 9,
      "Objet merveilleux": 9,
      Anneau: 9,
      Baguette: 9,
      Bâton: 9,
      Sceptre: 9,
      Parchemin: 10,
    },
    rarityConfig: {
      "0 - Neutre": 0,
      "1 - Commun": 0,
      "2 - Peu commun": 3,
      "3 - Rare": 1,
      "4 - Très rare": 1,
      "5 - Légendaire": 0,
      "6 - Artéfact": 0,
    },
    isDefault: true,
  },
];
