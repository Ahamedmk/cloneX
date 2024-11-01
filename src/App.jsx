import { useContext, Suspense, lazy,useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { db } from './firebase'; // Chemin vers votre configuration Firebase
import { ref, onDisconnect, onValue, set } from 'firebase/database';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { AuthContext } from "./store/AuthProvider";
import AuthProvider from "./store/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy loading des composants
const Home = lazy(() => import("./pages/Home"));
const Inscription = lazy(() => import("./pages/Inscription"));
const Connection = lazy(() => import("./pages/Connection"));
const Main = lazy(() => import("./layouts/Main"));
const ProfilUtilisateur = lazy(() => import("./pages/ProfilUtilisateur"));
const Profil = lazy (() => import("./pages/ListeUtilisateursEnLigne") );

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user, loading } = useContext(AuthContext);


  useEffect(() => {
    if (user) {
      const userStatusDatabaseRef = ref(db, `/status/${user.uid}`);

      const isOfflineForDatabase = {
        state: 'offline',
        last_changed: Date.now(),
      };

      const isOnlineForDatabase = {
        state: 'online',
        last_changed: Date.now(),
      };

      const connectedRef = ref(db, '.info/connected');
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
          return;
        }

        onDisconnect(userStatusDatabaseRef)
          .set(isOfflineForDatabase)
          .then(() => {
            set(userStatusDatabaseRef, isOnlineForDatabase);
          });
      });

      return () => {
        unsubscribe();
        set(userStatusDatabaseRef, isOfflineForDatabase);
      };
    }
  }, [user]);

  // Ajout de console.log pour vérifier l'état de l'utilisateur
  console.log("État de chargement (loading) :", loading);
  console.log("Utilisateur actuel (user) :", user);

  if (loading) {
    console.log("Chargement en cours..."); // Log indiquant que l'application est encore en train de charger l'état de l'authentification
    return <div>Chargement...</div>;
  }

  if (user) {
    console.log("Utilisateur connecté :", user.email);
  } else {
    console.log("Aucun utilisateur connecté");
  }

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />
      <RouterProvider
        router={createBrowserRouter([
          {
            path: "/",
            element: <Main />,
            children: [
              {
                path: "/",
                element: (
                  <Suspense fallback={<div>Chargement...</div>}>
                    {user ? <Home /> : <Inscription />}
                  </Suspense>
                ),
              },
              {
                path: "/inscription",
                element: (
                  <Suspense fallback={<div>Chargement...</div>}>
                    <Inscription />
                  </Suspense>
                ),
              },
              {
                path: "/profil/:uid",
                element: (
                  <Suspense fallback={<div>Chargement...</div>}>
                    <Profil/>
                  </Suspense>
                ),
              },
              {
                path: "/connection",
                element: (
                  <Suspense fallback={<div>Chargement...</div>}>
                    <Connection />
                  </Suspense>
                ),
              },
              {
                path: "/profil",
                element: (
                  <Suspense fallback={<div>Chargement...</div>}>
                    <ProfilUtilisateur />
                  </Suspense>
                ),
              },
            ],
          },
        ])}
      />
    </>
  );
}
