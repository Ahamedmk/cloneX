import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

export default function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div>
        <ClipLoader />
      </div>
    </div>
  );
}
