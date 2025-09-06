-- CreateTable
CREATE TABLE "GameSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startPatch" TEXT,
    "endPatch" TEXT
);

-- CreateTable
CREATE TABLE "Patch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "semver" TEXT NOT NULL,
    "releasedAt" DATETIME,
    CONSTRAINT "Patch_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GameSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trait" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    CONSTRAINT "Trait_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GameSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TraitTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "traitId" TEXT NOT NULL,
    "minUnits" INTEGER NOT NULL,
    "note" TEXT,
    "effects" JSONB NOT NULL,
    CONSTRAINT "TraitTier_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "role" TEXT,
    "baseStats" JSONB NOT NULL,
    "ability" JSONB,
    CONSTRAINT "Unit_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GameSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitTrait" (
    "unitId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,

    PRIMARY KEY ("unitId", "traitId"),
    CONSTRAINT "UnitTrait_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSet_name_key" ON "GameSet"("name");

-- CreateIndex
CREATE INDEX "Patch_setId_idx" ON "Patch"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "Patch_setId_semver_key" ON "Patch"("setId", "semver");

-- CreateIndex
CREATE INDEX "Trait_setId_idx" ON "Trait"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_setId_name_key" ON "Trait"("setId", "name");

-- CreateIndex
CREATE INDEX "TraitTier_traitId_minUnits_idx" ON "TraitTier"("traitId", "minUnits");

-- CreateIndex
CREATE INDEX "Unit_setId_cost_idx" ON "Unit"("setId", "cost");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_setId_name_key" ON "Unit"("setId", "name");

-- CreateIndex
CREATE INDEX "UnitTrait_traitId_idx" ON "UnitTrait"("traitId");
