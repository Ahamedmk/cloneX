import React, { useContext } from "react";
import TweetBox from "../components/TweetBox";
import Sidebar from "../components/Sidebar";

import { AuthContext } from "../store/AuthProvider";
import ListeUtilisateursEnLigne from "./ListeUtilisateursEnLigne";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container-fluid">
      {/* <h1>TwitterX</h1> */}
      <div className="row">
        <div className="col-2 p-0">
          <Sidebar />
        </div>
        <div className="col-8 h-100">
          <TweetBox />
        </div>
        <div className="col-2 p-0">
          <ListeUtilisateursEnLigne />
        </div>
      </div>
    </div>
  );
}
