import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../store/AuthProvider";
import ClipLoader from "react-spinners/ClipLoader";

export default function Main() {
  // Variables
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <ClipLoader />
      </div>
    );
  }
  return <div><Outlet /></div>;
}
