#!/usr/bin/env node
/**
 * Merge schema.base.prisma + schema.extended.prisma → schema.prisma
 *
 * Usage: node scripts/merge-schemas.js
 */

const fs = require('fs');
const path = require('path');

const PRISMA_DIR = path.join(__dirname, '../prisma');
const BASE_SCHEMA = path.join(PRISMA_DIR, 'schema.base.prisma');
const EXTENDED_SCHEMA = path.join(PRISMA_DIR, 'schema.extended.prisma');
const OUTPUT_SCHEMA = path.join(PRISMA_DIR, 'schema.prisma');

console.log('🔄 Merging Prisma schemas...');
console.log(`   Base: ${BASE_SCHEMA}`);
console.log(`   Extended: ${EXTENDED_SCHEMA}`);
console.log(`   Output: ${OUTPUT_SCHEMA}`);

try {
  // Read base schema (contains generator, datasource, core models)
  const baseContent = fs.readFileSync(BASE_SCHEMA, 'utf-8');

  // Read extended schema (contains custom models/enums only)
  let extendedContent = fs.readFileSync(EXTENDED_SCHEMA, 'utf-8');

  // Remove the header comments from extended schema (keep only models/enums)
  // Find the first enum or model declaration
  const firstDeclarationMatch = extendedContent.match(/(^|\n)(enum|model)\s/m);
  if (firstDeclarationMatch) {
    const startIndex = firstDeclarationMatch.index;
    extendedContent = extendedContent.substring(startIndex).trim();
  }

  // Merge: base + separator + extended
  const mergedContent = `${baseContent}\n\n// --- USER EXTENSIONS ---\n\n${extendedContent}\n`;

  // Write merged schema
  fs.writeFileSync(OUTPUT_SCHEMA, mergedContent);

  console.log('✅ Schema merged successfully!');
  console.log(`   Output: ${OUTPUT_SCHEMA}`);
} catch (error) {
  console.error('❌ Error merging schemas:', error.message);
  process.exit(1);
}
