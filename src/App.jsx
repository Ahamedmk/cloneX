import { useContext, Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user, loading } = useContext(AuthContext);

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
                path: "/connection",
                element: (
                  <Suspense fallback={<div>Chargement...</div>}>
                    <Connection />
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
