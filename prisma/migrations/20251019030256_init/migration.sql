-- CreateEnum
CREATE TYPE "public"."ItemKind" AS ENUM ('COMPONENT', 'COMPLETED', 'ARTIFACT', 'RADIANT', 'EMBLEM');

-- CreateTable
CREATE TABLE "public"."GameSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startPatch" TEXT,
    "endPatch" TEXT,

    CONSTRAINT "GameSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patch" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "semver" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "Patch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trait" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TraitTier" (
    "id" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,
    "minUnits" INTEGER NOT NULL,
    "note" TEXT,
    "effects" JSONB NOT NULL,

    CONSTRAINT "TraitTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "role" TEXT,
    "baseStats" JSONB NOT NULL,
    "ability" JSONB,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitTrait" (
    "unitId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,

    CONSTRAINT "UnitTrait_pkey" PRIMARY KEY ("unitId","traitId")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "kind" "public"."ItemKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "stats" JSONB NOT NULL,
    "text" TEXT,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "baseItemId" TEXT,
    "grantsTraitId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemComponent" (
    "parentId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "ItemComponent_pkey" PRIMARY KEY ("parentId","componentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSet_name_key" ON "public"."GameSet"("name");

-- CreateIndex
CREATE INDEX "Patch_setId_idx" ON "public"."Patch"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "Patch_setId_semver_key" ON "public"."Patch"("setId", "semver");

-- CreateIndex
CREATE INDEX "Trait_setId_idx" ON "public"."Trait"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_setId_name_key" ON "public"."Trait"("setId", "name");

-- CreateIndex
CREATE INDEX "TraitTier_traitId_minUnits_idx" ON "public"."TraitTier"("traitId", "minUnits");

-- CreateIndex
CREATE INDEX "Unit_setId_cost_idx" ON "public"."Unit"("setId", "cost");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_setId_name_key" ON "public"."Unit"("setId", "name");

-- CreateIndex
CREATE INDEX "UnitTrait_traitId_idx" ON "public"."UnitTrait"("traitId");

-- CreateIndex
CREATE INDEX "Item_setId_idx" ON "public"."Item"("setId");

-- CreateIndex
CREATE INDEX "Item_kind_idx" ON "public"."Item"("kind");

-- CreateIndex
CREATE INDEX "Item_baseItemId_idx" ON "public"."Item"("baseItemId");

-- CreateIndex
CREATE INDEX "Item_grantsTraitId_idx" ON "public"."Item"("grantsTraitId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_setId_slug_key" ON "public"."Item"("setId", "slug");

-- CreateIndex
CREATE INDEX "ItemComponent_componentId_idx" ON "public"."ItemComponent"("componentId");

-- AddForeignKey
ALTER TABLE "public"."Patch" ADD CONSTRAINT "Patch_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."GameSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trait" ADD CONSTRAINT "Trait_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."GameSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TraitTier" ADD CONSTRAINT "TraitTier_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "public"."Trait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Unit" ADD CONSTRAINT "Unit_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."GameSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitTrait" ADD CONSTRAINT "UnitTrait_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnitTrait" ADD CONSTRAINT "UnitTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "public"."Trait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."GameSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_grantsTraitId_fkey" FOREIGN KEY ("grantsTraitId") REFERENCES "public"."Trait"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemComponent" ADD CONSTRAINT "ItemComponent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemComponent" ADD CONSTRAINT "ItemComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
