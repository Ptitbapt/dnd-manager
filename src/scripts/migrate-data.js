// migrate-data.js - Script complet de migration
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Presets de boutiques
const shopPresets = [
  {
    id: 18,
    name: "Armurier pauvre",
    description:
      "Une petite forge de village avec des équipements basiques et usagés",
    wealthLevel: "pauvre",
    shopType: "armurier",
    typeChances: { Arme: 60, Armure: 30, Équipement: 10 },
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
    id: 19,
    name: "Armurier standard",
    description:
      "Forge bien établie offrant un bon choix d'armes et d'armures de qualité",
    wealthLevel: "standard",
    shopType: "armurier",
    typeChances: { Arme: 50, Armure: 35, Équipement: 15 },
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
    id: 20,
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
  // Ajoutez ici tous vos autres presets...
];

// Items de base (échantillon)
const items = [
  {
    Index: 1,
    NomObjet: "Bâton",
    Type: "Arme",
    SousType: "Corps à corps",
    Maitrise: "Courante",
    Rarete: "0 - Neutre",
    Caracteristiques: "1d6 contondant",
    Valeur: "0,2",
    InfoSupplementaire: "Polyvalente (1d8)",
    Poids: "2kg",
    Source: "DMG",
  },
  {
    Index: 2,
    NomObjet: "Dague",
    Type: "Arme",
    SousType: "Corps à corps",
    Maitrise: "Courante",
    Rarete: "0 - Neutre",
    Caracteristiques: "1d4 perforant",
    Valeur: "2",
    InfoSupplementaire: "Finesse, légère, lancer (portée 6 m/18 m)",
    Poids: "500g",
    Source: "DMG",
  },
  {
    Index: 3,
    NomObjet: "Gourdin",
    Type: "Arme",
    SousType: "Corps à corps",
    Maitrise: "Courante",
    Rarete: "0 - Neutre",
    Caracteristiques: "1d4 contondant",
    Valeur: "0,1",
    InfoSupplementaire: "Légère",
    Poids: "1kg",
    Source: "DMG",
  },
  // Ajoutez ici tous vos autres items...
];

async function main() {
  console.log("🚀 Début de la migration des données...");

  try {
    // Tester la connexion
    await prisma.$connect();
    console.log("✅ Connexion à PostgreSQL réussie");

    // Nettoyer les tables existantes
    console.log("🧹 Nettoyage des tables...");
    await prisma.shop.deleteMany({});
    await prisma.iTEMS.deleteMany({});
    await prisma.shopPreset.deleteMany({});
    console.log("✅ Tables nettoyées");

    // Insérer les presets
    console.log("📦 Insertion des presets de boutiques...");
    for (const preset of shopPresets) {
      await prisma.shopPreset.create({
        data: preset,
      });
    }
    console.log(`✅ ${shopPresets.length} presets insérés`);

    // Insérer les items
    console.log("⚔️ Insertion des items...");
    for (const item of items) {
      await prisma.iTEMS.create({
        data: item,
      });
    }
    console.log(`✅ ${items.length} items insérés`);

    // Vérification
    const totalItems = await prisma.iTEMS.count();
    const totalPresets = await prisma.shopPreset.count();

    console.log(`📊 Vérification finale:`);
    console.log(`   - Items: ${totalItems}`);
    console.log(`   - Presets: ${totalPresets}`);

    if (totalItems > 0 && totalPresets > 0) {
      console.log("🎉 Migration réussie !");
    } else {
      console.log("❌ Problème lors de la migration");
    }
  } catch (error) {
    console.error("❌ Erreur durant la migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
