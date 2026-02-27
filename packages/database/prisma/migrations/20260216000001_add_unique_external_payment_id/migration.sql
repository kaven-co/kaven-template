-- DB-M6: Add UNIQUE constraint to Purchase.externalPaymentId
--
-- Business purpose: Prevents duplicate payment records from the same external
-- transaction (Stripe charge ID, PagueBit transaction ID, etc.). Without this
-- constraint, a webhook retry or race condition could create duplicate Purchase
-- records for the same payment, leading to double-crediting of product effects.
--
-- Note: The column is nullable, so NULL values are not constrained (multiple
-- purchases without an external payment ID are allowed, e.g. manual/internal purchases).

-- CreateIndex
CREATE UNIQUE INDEX "purchases_external_payment_id_key" ON "purchases"("external_payment_id");
