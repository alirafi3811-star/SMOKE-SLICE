/* =========================================================================
   SMOKE & SLICE — FIREBASE INTEGRATION CORE
   Loads modular Firebase v10 via CDN directly compatible with GitHub Pages.
   ========================================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBV8-TBUmosooj-45NbL5aEv3eix-TbDEM",
  authDomain: "smoke-and-slice.firebaseapp.com",
  projectId: "smoke-and-slice",
  storageBucket: "smoke-and-slice.firebasestorage.app",
  messagingSenderId: "493487978094",
  appId: "1:493487978094:web:606a158040c73044ab187f",
  measurementId: "G-JMH63D8B1D"
};

// Initialize app instances
const app = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
