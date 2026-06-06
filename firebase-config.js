// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// TODO: Replace this with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBDxX0gCXiRBtwnGvtTn2Q5RbKH6JduHo",
  authDomain: "gadget69.firebaseapp.com",
  projectId: "gadget69",
  storageBucket: "gadget69.firebasestorage.app",
  messagingSenderId: "216577854256",
  appId: "1:216577854256:web:f3d95de825ac5179ae16f5",
  measurementId: "G-VNMHY3KBY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
