import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQQf8-TJawTBt2G_iqETxVDdGkxqWMAzk",
  authDomain: "lasyplatform.firebaseapp.com",
  projectId: "lasyplatform",
  storageBucket: "lasyplatform.firebasestorage.app",
  messagingSenderId: "772423880205",
  appId: "1:772423880205:web:8501ac3b96e34a53da4f44",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL parameters
const urlParams = new URLSearchParams(window.location.search);
const year = urlParams.get("year");
const branch = year === "1st" ? "All" : urlParams.get("branch");
const course = urlParams.get("course");
const type = urlParams.get("type");

if (!year || !course || !type || !branch) {
  document.getElementById("filesContainer").innerText = "Missing URL parameters.";
  throw new Error("Missing year, branch, course, or type in URL.");
}

document.getElementById("courseTitle").innerText = `${type.toUpperCase()} - ${course}`;

const path = `structure/${year}/branches/${branch}/courses/${course}/${type}`;
const filesContainer = document.getElementById("filesContainer");

async function loadFiles() {
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      filesContainer.innerHTML = "No files found.";
      return;
    }
    filesContainer.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const file = document.createElement("div");
      file.innerHTML = `
        <p><strong>${data.title}</strong></p>
        <a href="${data.fileUrl}" target="_blank">📥 Download/View</a>
        <hr>
      `;
      filesContainer.appendChild(file);
    });
  } catch (error) {
    filesContainer.innerHTML = "Error loading files.";
    console.error("Firestore Error:", error);
  }
}

loadFiles();