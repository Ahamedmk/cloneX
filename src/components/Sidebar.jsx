import { useContext } from "react";
import { LuActivity, LuSearch, LuUser2, LuMail, LuUsers2, LuHome, LuLogOut } from "react-icons/lu";
import './sidebar.css';
import { AuthContext } from "../store/AuthProvider";

export default function Sidebar() {

  const { logOut } = useContext(AuthContext);
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-around p-3"
      style={{
        width: "100px",
        height: "100vh",
        backgroundColor: "#1DA1F2",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <LuHome size={28} color="#FFFFFF" className="my-3 sidebar-icon" />
      <LuActivity size={28} color="#FFFFFF" className="my-3 sidebar-icon" />
      <LuSearch size={28} color="#FFFFFF" className="my-3 sidebar-icon" />
      <LuMail size={28} color="#FFFFFF" className="my-3 sidebar-icon" />
      <LuUsers2 size={28} color="#FFFFFF" className="my-3 sidebar-icon" />
      <LuUser2 size={28} color="#FFFFFF" className="my-3 sidebar-icon" />
      <LuLogOut size={28} color="#FFFFFF" className="my-3 sidebar-icon" onClick={logOut} />
    </div>
  );
}
