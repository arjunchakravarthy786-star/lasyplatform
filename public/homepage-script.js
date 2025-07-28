import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  getDocs,
  collection,
  addDoc,
   doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQQf8-TJawTBt2G_iqETxVDdGkxqWMAzk",
  authDomain: "lasyplatform.firebaseapp.com",
  projectId: "lasyplatform",
  storageBucket: "lasyplatform.firebasestorage.app",
  messagingSenderId: "772423880205",
  appId: "1:772423880205:web:8501ac3b96e34a53da4f44",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


// 🔔 Load Notice Bar from Firestore
const noticeText = document.getElementById("noticeText");

function loadScrollingNotice() {
  const docRef = doc(db, "notices", "latest");

  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();

      if (Array.isArray(data.items) && data.items.length > 0) {
        const allText = data.items.map(item => `📢 ${item}`).join(" ⚡ ");
        noticeText.textContent = allText;

        // Restart animation
        noticeText.style.animation = "none";
        void noticeText.offsetWidth;
        noticeText.style.animation = "marquee 8s linear infinite"; // Adjust speed here
      } else {
        noticeText.textContent = "📢 No notices available.";
      }
    } else {
      noticeText.textContent = "📢 No notices found.";
    }
  });
}

// ✅ Call this after Firebase setup
loadScrollingNotice();






// Elements
const yearSelect = document.getElementById("year");
const branchSelect = document.getElementById("branch");
const courseSelect = document.getElementById("course");
const branchSection = document.getElementById("branchSection");
const materialDropdown = document.getElementById("materialDropdown");
const statusMsg = document.getElementById("statusMsg");

// Populate Year Dropdown
async function loadYearsFromFirestore() {
  // Now loading from structure collection
  const yearSnapshot = await getDocs(collection(db, "structure"));
  yearSnapshot.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.id;
    yearSelect.appendChild(option);
  });
}



// Year dropdown listener
yearSelect.addEventListener("change", async () => {
  const selectedYear = yearSelect.value;
  branchSelect.innerHTML = "<option value=''>-- Select Branch --</option>";
  courseSelect.innerHTML = "<option value=''>-- Select Course --</option>";

  if (selectedYear === "1st") {
    branchSection.style.display = "none";
    try {
      // 1st year: All branch
      const coursesSnapshot = await getDocs(collection(db, `structure/1st/branches/All/courses`));
      coursesSnapshot.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.id;
        courseSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading 1st year courses:", error);
    }
  } else {
    branchSection.style.display = "block";
    try {
      // Load branches for 2nd, 3rd, and 4th years
      const branchesSnapshot = await getDocs(collection(db, `structure/${selectedYear}/branches`));
      branchesSnapshot.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.id;
        branchSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  }
});

// Branch dropdown listener (for 2nd, 3rd, 4th year)
branchSelect.addEventListener("change", async () => {
  const selectedYear = yearSelect.value;
  const selectedBranch = branchSelect.value;
  courseSelect.innerHTML = "<option value=''>-- Select Course --</option>";

  try {
    const coursesSnapshot = await getDocs(
      collection(db, `structure/${selectedYear}/branches/${selectedBranch}/courses`)
    );
    coursesSnapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.id;
      courseSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading branch courses:", error);
  }
});

// Update: When course changes, load material types
courseSelect.addEventListener("change", async () => {
  const year = yearSelect.value;
  const branch = year === "1st" ? "All" : branchSelect.value;
  const course = courseSelect.value;
  if (course) {
    await loadMaterialTypes(year, branch, course);
  } else {
    materialDropdown.innerHTML = '<option value="" disabled selected>Choose Material Type</option>';
  }
});

// Helper: Get material types (subcollections) for a course
async function loadMaterialTypes(year, branch, course) {
  // Clear dropdown
  materialDropdown.innerHTML = '<option value="" disabled selected>Choose Material Type</option>';
  // Just hardcode the types, do not try to get subcollections from Firestore
  const possibleTypes = ["books", "notes", "lectures", "labs", "pyqs", "tutorials"];
  possibleTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    materialDropdown.appendChild(option);
  });
}

// Handle Upload
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const year = yearSelect.value;
  const branch = year === "1st" ? "All" : branchSelect.value;
  const course = courseSelect.value;
  const type = materialDropdown.value;
  const file = document.getElementById("pdfFile").files[0];

  if (!file) return alert("Please select a PDF");
  if (!type) return alert("Please select a material type");

  // Upload to Storage
  const filePath = `pendingUploads/${year}/${course}/${type}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);

  try {
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    // Upload to Firestore in correct structure path
    let firestorePath;
    if (year === "1st") {
      firestorePath = `structure/1st/branches/All/courses/${course}/${type}`;
    } else {
      firestorePath = `structure/${year}/branches/${branch}/courses/${course}/${type}`;
    }

    await addDoc(collection(db, firestorePath), {
      title,
      year,
      branch,
      course,
      type,
      fileUrl: downloadURL,
      uploadedAt: new Date()
    });

    statusMsg.innerText = "✅ Uploaded successfully!";
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.error("Upload failed:", error);
    statusMsg.innerText = "❌ Upload failed. See console.";
  }
});




// 🔔 Suggestion Box Functionality
 const form = document.getElementById("suggestionForm");
  const statusMessage = document.getElementById("statusMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const text = document.getElementById("suggestionText").value.trim();

    if (!text) return;

    try {
      await addDoc(collection(db, "suggestions"), {
        name: name || "Anonymous",
        suggestion: text,
        timestamp: new Date()
      });

      form.reset();
      statusMessage.style.display = "block";
      setTimeout(() => statusMessage.style.display = "none", 3000);
    } catch (error) {
      alert("Failed to submit suggestion. Try again.");
      console.error("Error writing document: ", error);
    }
  });





// Start
loadYearsFromFirestore();