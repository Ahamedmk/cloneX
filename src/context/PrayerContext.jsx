import { createContext, useState, useEffect, useContext } from "react";
import { ref, get, set } from "firebase/database"; // Firebase functions
import { db } from "../firebase"; // Firebase instance
import { AuthContext } from "../store/AuthProvider"; // Pour accéder à l'utilisateur connecté


  // Création du contexte
  export const AuthContext = createContext();
  
  // Fournisseur de contexte
  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  
    const createUser = async (email, password) => {
      // Logic pour créer un utilisateur (par exemple, en utilisant Firebase)
      return { email, password }; // Remplacez par la vraie logique d'inscription
    };
  
    const logOut = async () => {
      // Logic pour déconnecter l'utilisateur
      setUser(null);
    };
  
    return (
      <AuthContext.Provider value={{ createUser, logOut, user }}>
        {children}
      </AuthContext.Provider>
    );
  };
  