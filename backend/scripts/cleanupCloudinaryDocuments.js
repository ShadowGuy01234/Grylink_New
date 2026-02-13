/**
 * Cleanup script to delete all documents from Cloudinary AND database
 * Run with: cd backend && node scripts/cleanupCloudinaryDocuments.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("../models/Document");
const Company = require("../models/Company");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cleanupAll = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Get all documents
    const allDocs = await Document.find().lean();
    console.log(`Found ${allDocs.length} documents in database`);

    if (allDocs.length === 0) {
      console.log("No documents to clean up!");
      return;
    }

    let cloudinaryDeleted = 0;
    let cloudinaryFailed = 0;

    console.log("\nDeleting from Cloudinary...\n");

    for (const doc of allDocs) {
      if (doc.cloudinaryPublicId) {
        try {
          // Try deleting as raw first (PDFs), then as image
          try {
            await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
              resource_type: "raw",
            });
          } catch {
            await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
              resource_type: "image",
            });
          }
          console.log(`  Deleted: ${doc.fileName}`);
          cloudinaryDeleted++;
        } catch (error) {
          console.log(`  Failed: ${doc.fileName} - ${error.message}`);
          cloudinaryFailed++;
        }
      }
    }

    console.log("\nClearing document references from companies...");
    await Company.updateMany({}, { $set: { documents: [] } });
    console.log("  Cleared all company document references");

    console.log("\nDeleting document records from database...");
    const deleteResult = await Document.deleteMany({});
    console.log(`  Deleted ${deleteResult.deletedCount} document records`);

    console.log("\n=== Cleanup Summary ===");
    console.log(
      `Cloudinary: ${cloudinaryDeleted} deleted, ${cloudinaryFailed} failed`,
    );
    console.log(`Database: ${deleteResult.deletedCount} records removed`);
    console.log(
      "\nYou can now re-upload documents through the partner portal.",
    );
    console.log(
      "New uploads will use the correct resource_type for proper viewing.",
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDisconnected from MongoDB");
  }
};

cleanupAll();
