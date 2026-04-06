/*
  Warnings:

  - You are about to drop the column `equipBoots` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipChest` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipGloves` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipHelmet` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipLegs` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipRing` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipShield` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipShoulders` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipTrinket` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipWeapon` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `inventory` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "equipBoots",
DROP COLUMN "equipChest",
DROP COLUMN "equipGloves",
DROP COLUMN "equipHelmet",
DROP COLUMN "equipLegs",
DROP COLUMN "equipRing",
DROP COLUMN "equipShield",
DROP COLUMN "equipShoulders",
DROP COLUMN "equipTrinket",
DROP COLUMN "equipWeapon",
DROP COLUMN "inventory",
ADD COLUMN     "statPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "slotIndex" INTEGER NOT NULL,
    "equipSlot" TEXT,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
