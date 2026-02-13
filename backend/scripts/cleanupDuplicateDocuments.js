/**
 * Cleanup script to remove duplicate documents
 * Keeps only the latest document for each documentType per company
 *
 * Run with: node scripts/cleanupDuplicateDocuments.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("../models/Document");

const cleanupDuplicates = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all documents grouped by company and type
    const allDocs = await Document.find().sort({ createdAt: -1 }).lean();
    console.log(`📄 Found ${allDocs.length} total documents`);

    // Group by companyId and documentType
    const grouped = {};
    for (const doc of allDocs) {
      const key = `${doc.companyId}_${doc.documentType}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(doc);
    }

    // Find duplicates
    let duplicatesCount = 0;
    const toDelete = [];

    for (const [key, docs] of Object.entries(grouped)) {
      if (docs.length > 1) {
        console.log(`\n🔍 Found ${docs.length} documents for ${key}`);
        // Keep the first one (newest due to sort), delete the rest
        const [keep, ...remove] = docs;
        console.log(`  ✅ Keeping: ${keep.fileName} (${keep.createdAt})`);
        remove.forEach((doc) => {
          console.log(`  ❌ Will delete: ${doc.fileName} (${doc.createdAt})`);
          toDelete.push(doc._id);
        });
        duplicatesCount += remove.length;
      }
    }

    if (toDelete.length === 0) {
      console.log("\n✨ No duplicates found!");
    } else {
      console.log(`\n🗑️  Deleting ${toDelete.length} duplicate documents...`);
      const result = await Document.deleteMany({ _id: { $in: toDelete } });
      console.log(`✅ Deleted ${result.deletedCount} duplicate documents`);
    }

    console.log("\n📊 Summary:");
    console.log(`  - Total documents before: ${allDocs.length}`);
    console.log(`  - Duplicates removed: ${duplicatesCount}`);
    console.log(
      `  - Total documents after: ${allDocs.length - duplicatesCount}`,
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
  }
};

cleanupDuplicates();
