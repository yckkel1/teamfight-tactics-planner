-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "stats" JSONB NOT NULL,
    "text" TEXT,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "baseItemId" TEXT,
    "grantsTraitId" TEXT,
    CONSTRAINT "Item_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GameSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "Item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_grantsTraitId_fkey" FOREIGN KEY ("grantsTraitId") REFERENCES "Trait" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemComponent" (
    "parentId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,

    PRIMARY KEY ("parentId", "componentId"),
    CONSTRAINT "ItemComponent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemComponent_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Item_setId_idx" ON "Item"("setId");

-- CreateIndex
CREATE INDEX "Item_kind_idx" ON "Item"("kind");

-- CreateIndex
CREATE INDEX "Item_baseItemId_idx" ON "Item"("baseItemId");

-- CreateIndex
CREATE INDEX "Item_grantsTraitId_idx" ON "Item"("grantsTraitId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_setId_slug_key" ON "Item"("setId", "slug");

-- CreateIndex
CREATE INDEX "ItemComponent_componentId_idx" ON "ItemComponent"("componentId");
