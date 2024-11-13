// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove } from "firebase/database"; // Import de Realtime Database
// Import the functions you need from the SDKs you need



const suivreUtilisateur = async (followerId, followingId) => {
  try {
    const followRef = ref(db, `follows/${followerId}/${followingId}`);
    await set(followRef, true);
    console.log(`L'utilisateur ${followerId} suit maintenant ${followingId}`);
  } catch (error) {
    console.error("Erreur lors de l'abonnement :", error);
  }
};

const desabonnerUtilisateur = async (followerId, followingId) => {
  try {
    const followRef = ref(db, `follows/${followerId}/${followingId}`);
    await remove(followRef);
    console.log(`L'utilisateur ${followerId} s'est désabonné de ${followingId}`);
  } catch (error) {
    console.error("Erreur lors du désabonnement :", error);
  }
};

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
const auth = getAuth(app);

export {auth};
export { db };
export default app;
