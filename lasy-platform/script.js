document.querySelectorAll('.slice').forEach(btn => {
  btn.addEventListener('click', () => {
    const course = btn.innerText.trim().toLowerCase().replace(/\s+/g, '_');
    window.location.href = `courses/${course}.html`;
  });
});


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQQf8-TJawTBt2G_iqETxVDdGkxqWMAzk",
  authDomain: "lasyplatform.firebaseapp.com",
  projectId: "lasyplatform",
  storageBucket: "lasyplatform.appspot.com",
  messagingSenderId: "772423880205",
  appId: "1:772423880205:web:8501ac3b96e34a53da4f44",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pdfResults = document.getElementById("pdfResults");
const searchInput = document.getElementById("searchInput");

let pdfList = []; // Store all PDFs here after fetching

// 🔽 Fetch PDFs from Firestore on load
async function loadPDFs() {
  const snapshot = await getDocs(query(collection(db, "pdfs")));
  pdfList = [];

  snapshot.forEach(doc => {
    pdfList.push({ id: doc.id, ...doc.data() });
  });

  displayPDFs(pdfList); // initial render
}

// 🔽 Render PDFs
function displayPDFs(list) {
  pdfResults.innerHTML = "";

  if (list.length === 0) {
    pdfResults.innerHTML = "<p>No results found.</p>";
    return;
  }

  list.forEach(pdf => {
    const card = document.createElement("div");
    card.className = "pdf-card";
    card.innerHTML = `
      <h3>${pdf.title}</h3>
      <p><strong>Year:</strong> ${pdf.year || "N/A"}</p>
      <p><strong>Subject:</strong> ${pdf.subject || "N/A"}</p>
      <a href="${pdf.fileUrl}" target="_blank">📥 View / Download</a>
    `;
    pdfResults.appendChild(card);
  });
}

// 🔎 Live search
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = pdfList.filter(pdf =>
    pdf.title.toLowerCase().includes(term) ||
    (pdf.subject && pdf.subject.toLowerCase().includes(term)) ||
    (pdf.year && pdf.year.toLowerCase().includes(term))
  );
  displayPDFs(filtered);
});

loadPDFs(); // Initial call



