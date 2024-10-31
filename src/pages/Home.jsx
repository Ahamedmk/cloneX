import React from "react";
// import Header from "../components/Header";
import TweetBox from "../components/TweetBox";
import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div className="flex container-fluid">
      {/* <h1>TwitterX</h1> */}
      <div className="row">
        <div className="col-2 p-0">
          <Sidebar />
        </div>
        <div className="col-10 h-100">
          <TweetBox />
        </div>
      </div>
    </div>
  );
}
