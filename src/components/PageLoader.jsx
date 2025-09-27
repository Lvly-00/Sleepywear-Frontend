import React from "react";
import "../css/SleepyLoader.css";

export default function PageLoader() {
  return (
    <div className="loader-container">
      <div className="moon-wrapper">
        <div className="moon"></div>
        <div className="crescent"></div>
        <div className="zzz-container">
          <span className="zzz">Z</span>
          <span className="zzz">Z</span>
          <span className="zzz">Z</span>
        </div>
      </div>
    </div>
  );
}
