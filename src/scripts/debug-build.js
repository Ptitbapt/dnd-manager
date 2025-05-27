#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Diagnostic de build pour Railway...");

// Vérifier l'environnement
console.log("\n📝 Variables d'environnement:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Vérifier la présence des fichiers
console.log("\n📁 Fichiers dans le répertoire racine:");
const files = fs.readdirSync(".");
files.forEach((file) => {
  const stats = fs.statSync(file);
  console.log(`${file} (${stats.isDirectory() ? "dir" : "file"})`);
});

// Vérifier la base de données
console.log("\n💾 Vérification de la base de données:");
if (fs.existsSync("./db_DMG.db")) {
  const stats = fs.statSync("./db_DMG.db");
  console.log(`✅ db_DMG.db trouvée (${stats.size} bytes)`);
} else {
  console.log("❌ db_DMG.db non trouvée");
}

// Vérifier le schéma Prisma
console.log("\n🗂️ Vérification du schéma Prisma:");
if (fs.existsSync("./prisma/schema.prisma")) {
  console.log("✅ schema.prisma trouvé");
} else {
  console.log("❌ schema.prisma non trouvé");
}

// Tenter de générer le client Prisma
console.log("\n⚙️ Test génération client Prisma...");
try {
  const { execSync } = require("child_process");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Client Prisma généré avec succès");
} catch (error) {
  console.log("❌ Erreur génération client Prisma:", error.message);
}

console.log("\n🎯 Diagnostic terminé.");
