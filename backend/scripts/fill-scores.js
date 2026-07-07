const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const TechPreneurCertificate = require("../models/TechPreneurCertificate");

const remarks = [
  "Demonstrated exceptional technical skill and outstanding collaboration throughout the startup accelerator program.",
  "Showed great aptitude in designing robust architecture and launching the product MVP ahead of schedule.",
  "Displayed superb leadership qualities, coordinating team tasks and developing highly functional modules.",
  "Exhibited strong problem-solving skills and an excellent entrepreneurial mindset during final project pitching.",
  "Worked diligently, showing significant progress weekly and delivering a high-quality product implementation.",
  "Showcased stellar technical execution, designing elegant system layouts and participating actively in brainstorming."
];

const effortsList = {
  week1: [
    "Actively participated in product definition, validating customer discovery metrics and framing requirements.",
    "Designed initial wireframes and detailed specifications for target customer persona validation.",
    "Conducted extensive user interviews to refine product features and outline MVP requirements."
  ],
  week2: [
    "Created high-fidelity modular system architectures and drafted full database schema design maps.",
    "Established structured APIs and defined service payloads for internal team collaboration.",
    "Developed key component wireframes and finalized project system sequence configurations."
  ],
  week3: [
    "Built core functional modules, implementing robust front-end views and secure endpoint integrations.",
    "Integrated external database bindings and resolved complex layout responsive adjustments.",
    "Deployed modular data-binding routes and successfully integrated authentication flows."
  ],
  week4: [
    "Conducted comprehensive unit tests, finalized build environment setups, and launched the staging MVP.",
    "Optimized page load speed, resolved rendering bottlenecks, and deployed the production stack.",
    "Assembled the technical documentation and successfully prepared the final investor pitch deck."
  ],
  projectContribution: [
    "Made substantial code contributions, driving version control workflows and resolving package dependency conflicts.",
    "Owned the backend service layer development, ensuring smooth data retrieval and low-latency API responses.",
    "Led the frontend client UI implementation, maintaining pixel-perfect fidelity and smooth navigation."
  ]
};

function getRandomItem(arr, seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % arr.length;
  return arr[index];
}

function getOverallScore(min, max, seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const range = max - min + 1;
  return min + (Math.abs(hash) % range);
}

function distributeScore(T) {
  let w1 = 14;
  let w2 = 14;
  let w3 = 14;
  let w4 = 14;
  let proj = 36;
  let currentSum = w1 + w2 + w3 + w4 + proj;
  
  let diff = T - currentSum;
  
  if (diff > 0) {
    while (diff > 0) {
      if (proj < 40) { proj++; diff--; }
      else if (w1 < 15) { w1++; diff--; }
      else if (w2 < 15) { w2++; diff--; }
      else if (w3 < 15) { w3++; diff--; }
      else if (w4 < 15) { w4++; diff--; }
      else { break; }
    }
  } else if (diff < 0) {
    while (diff < 0) {
      if (proj > 35) { proj--; diff++; }
      else if (w1 > 13) { w1--; diff++; }
      else if (w2 > 13) { w2--; diff++; }
      else if (w3 > 13) { w3--; diff++; }
      else if (w4 > 13) { w4--; diff++; }
      else { break; }
    }
  }
  
  return { w1, w2, w3, w4, proj };
}

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const certificates = await TechPreneurCertificate.find();
    console.log(`Found ${certificates.length} certificates to process.`);

    let count = 0;
    for (const cert of certificates) {
      const seed = cert._id.toString();
      
      // Determine overall target score between 90 and 95
      const targetTotal = getOverallScore(90, 95, seed);
      
      // Distribute T proportionally to the component limits
      const scores = distributeScore(targetTotal);

      const w1Effort = getRandomItem(effortsList.week1, seed + "e1");
      const w2Effort = getRandomItem(effortsList.week2, seed + "e2");
      const w3Effort = getRandomItem(effortsList.week3, seed + "e3");
      const w4Effort = getRandomItem(effortsList.week4, seed + "e4");
      const projEffort = getRandomItem(effortsList.projectContribution, seed + "eproj");

      const finalRemark = getRandomItem(remarks, seed + "remark");
      const certDate = new Date("2026-06-30");

      await TechPreneurCertificate.findByIdAndUpdate(cert._id, {
        $set: {
          issuedAt: certDate,
          scores: {
            week1: scores.w1,
            week2: scores.w2,
            week3: scores.w3,
            week4: scores.w4,
            projectContribution: scores.proj
          },
          efforts: {
            week1: w1Effort,
            week2: w2Effort,
            week3: w3Effort,
            week4: w4Effort,
            projectContribution: projEffort
          },
          finalRemarks: finalRemark
        }
      });
      count++;
    }

    console.log(`Successfully updated ${count} certificates. Component scores now add up correctly to an overall score between 90 and 95 (out of 100).`);

  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

run();
