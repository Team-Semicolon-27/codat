/*
  Warnings:

  - You are about to drop the `_TeamCodats` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `collectionColor` to the `Collections` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_TeamCodats" DROP CONSTRAINT "_TeamCodats_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeamCodats" DROP CONSTRAINT "_TeamCodats_B_fkey";

-- AlterTable
ALTER TABLE "Collections" ADD COLUMN     "collectionColor" TEXT NOT NULL;

-- DropTable
DROP TABLE "_TeamCodats";

-- CreateTable
CREATE TABLE "_TeamCollections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeamCollections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TeamCollections_B_index" ON "_TeamCollections"("B");

-- AddForeignKey
ALTER TABLE "_TeamCollections" ADD CONSTRAINT "_TeamCollections_A_fkey" FOREIGN KEY ("A") REFERENCES "Collections"("collectionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamCollections" ADD CONSTRAINT "_TeamCollections_B_fkey" FOREIGN KEY ("B") REFERENCES "Teams"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;
