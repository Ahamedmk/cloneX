// Main.jsx

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ListeUtilisateursEnLigne from "../pages/ListeUtilisateursEnLigne";

function Main() {
  return (
    <div className="app-container d-flex">
      <div className="col-2 p-0">
        <Sidebar />
      </div>
      <div className="flex-grow-1 p-0">
        <Outlet /> {/* Contenu principal */}
      </div>
      <div className="col-2 p-0">
        <ListeUtilisateursEnLigne />
      </div>
    </div>
  );
}

export default Main;
