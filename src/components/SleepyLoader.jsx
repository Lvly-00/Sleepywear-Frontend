import React from "react";
import "../css/SleepyLoader.css";

export default function SleepyLoader() {
  return (
    <div className="loader-container">
      <div className="moon-loader">
        <div className="moon-circle"></div>
        <div className="moon-crescent"></div>
      </div>
    </div>
  );
}
