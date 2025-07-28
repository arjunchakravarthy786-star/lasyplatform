// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQQf8-TJawTBt2G_iqETxVDdGkxqWMAzk",
  authDomain: "lasyplatform.firebaseapp.com",
  projectId: "lasyplatform",
  storageBucket: "lasyplatform.appspot.com", // FIXED: Corrected storageBucket
  messagingSenderId: "772423880205",
  appId: "1:772423880205:web:8501ac3b96e34a53da4f44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export them for use in other files
export { db, storage };
