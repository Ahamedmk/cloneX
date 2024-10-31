// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Import de Realtime Database
// Import the functions you need from the SDKs you need

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmf9eoNiS7NYgdLeb0ZxyrJxBLxS1p0n0",
  authDomain: "clone-twitterx-aca82.firebaseapp.com",
  databaseURL: "https://clone-twitterx-aca82-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "clone-twitterx-aca82",
  storageBucket: "clone-twitterx-aca82.appspot.com",
  messagingSenderId: "524578423400",
  appId: "1:524578423400:web:9926bab0418481e677f1dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialisation de Realtime Database

export const auth = getAuth(app);
export { db };
export default app;
