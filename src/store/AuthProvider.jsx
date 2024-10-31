import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { ref, get, set, update } from "firebase/database";
import { db } from "../firebase";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState(false);

  // Fonction pour mettre à jour `isSetupComplete` à true
  const updateUserSetupComplete = async () => {
    if (user) {
      try {
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, { isSetupComplete: true });
        setNewUser(false); // Mettre à jour l'état local
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de isSetupComplete :",
          error
        );
      }
    }
  };

  // Fonction pour vérifier si l'utilisateur a complété sa configuration
  const verifyUserSetup = useCallback(async (currentUser) => {
    try {
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const isSetupComplete = userData.isSetupComplete;

        // Convertir `isSetupComplete` en booléen
        const setupComplete = Boolean(isSetupComplete);
        if (isSetupComplete === undefined) {
          await set(userRef, { ...userData, isSetupComplete: false });
          return false;
        }

        return setupComplete;
      } else {
        // Si aucune donnée n'existe pour cet utilisateur, on initialise
        await set(userRef, { isSetupComplete: false });
        return false;
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la configuration utilisateur :",
        error
      );
      return false;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const setupComplete = await verifyUserSetup(currentUser);
        setNewUser(!setupComplete); // Mise à jour de `newUser` en fonction de `setupComplete`
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => unsubscribe();
  }, [verifyUserSetup]);

  // Fonction pour déconnecter l'utilisateur
  const logOut = () => {
    setNewUser(false); // Réinitialiser l'état newUser lors de la déconnexion
    return signOut(auth);
  };

  // Fonction pour inscrire un utilisateur
  const createUser = async (email, password,username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Mettre à jour le profil de l'utilisateur avec le nom d'utilisateur
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      const userRef = ref(db, `users/${userCredential.user.uid}`);
      await set(userRef, { isSetupComplete: false }); // Initialisation de isSetupComplete à false lors de l'inscription
      setNewUser(true); // Indiquer que c'est un nouvel utilisateur
      return userCredential.user; // Retourner l'utilisateur pour la gestion ultérieure
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      throw error; // Lancer l'erreur pour qu'elle soit gérée dans le composant
    }
  };

  // Fonction pour connecter un utilisateur existant
  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user; // Retourner `userCredential.user` pour un accès direct à l'utilisateur
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      throw error; // Lancer l'erreur pour qu'elle soit gérée dans le composant
    }
  };

  const authValue = {
    user,
    loading,
    newUser, // Expose l'état newUser dans le contexte
    logOut,
    createUser,
    loginUser, // Fonction de connexion
    verifyUserSetup, // Expose la fonction pour l'utiliser dans les composants
    updateUserSetupComplete,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
