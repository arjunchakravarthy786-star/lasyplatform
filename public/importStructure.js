const fs = require("fs");
const admin = require("firebase-admin");

// Load service account key (adjust filename if needed)
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importStructure() {
  // Load JSON file
  const data = JSON.parse(fs.readFileSync("structure.json", "utf-8")).courses;
  console.log("✅ Loaded courses:", data?.length, "| Preview:", JSON.stringify(data?.[0]));

  for (const course of data) {
    const { year, branch, course: courseName } = course;

    // Validate
    if (!year || !branch || !courseName) {
      console.error("❌ Skipping invalid entry:", course);
      continue;
    }

   try {
  const yearRef = db.collection("structure").doc(year);
  await yearRef.set({}, { merge: true });

  const branchRef = yearRef.collection("branches").doc(branch);
  await branchRef.set({}, { merge: true });

  const courseRef = branchRef.collection("courses").doc(courseName);
  await courseRef.set({}, { merge: true });

  // Add default subcollections for each course
   const categories = ["tutorials", "pyqs", "lectures", "notes", "labs", "books"];
  for (const category of categories) {
    const catRef = courseRef.collection(category).doc("initDoc");
    await catRef.set({ placeholder: true });
    console.log(`  ➕ Created subcollection ${category} under ${courseName}`);
  }

  console.log(`✅ Uploaded: ${year} → ${branch} → ${courseName}`);
} catch (error) {
  console.error(`🔥 Error uploading ${year} → ${branch} → ${courseName}:`, error.message);
}
  }

  console.log("✅ Import complete");
}

importStructure();
















