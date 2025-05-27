-- CreateTable
CREATE TABLE IF NOT EXISTS "shoppreset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "wealthlevel" TEXT NOT NULL,
    "shoptype" TEXT NOT NULL,
    "typechances" TEXT NOT NULL,
    "rarityconfig" TEXT NOT NULL,
    "isdefault" BOOLEAN NOT NULL DEFAULT false,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shoppreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "items" (
    "index" SERIAL NOT NULL,
    "nomobjet" TEXT,
    "type" TEXT,
    "soustype" TEXT,
    "maitrise" TEXT,
    "rarete" TEXT,
    "caracteristiques" TEXT,
    "valeur" TEXT,
    "infosupplementaire" TEXT,
    "poids" TEXT,
    "source" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "shop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "items" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);