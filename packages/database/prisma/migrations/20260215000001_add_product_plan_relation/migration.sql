-- AlterTable: Add optional plan_id to products table
ALTER TABLE "products" ADD COLUMN "plan_id" TEXT;

-- CreateIndex: Index on plan_id for efficient lookups
CREATE INDEX "products_plan_id_idx" ON "products"("plan_id");

-- AddForeignKey: Product → Plan (optional, SetNull on delete)
ALTER TABLE "products" ADD CONSTRAINT "products_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
