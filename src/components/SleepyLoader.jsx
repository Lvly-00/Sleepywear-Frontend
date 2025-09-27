import React from "react";
import "../css/SleepyLoader.css";

export default function SleepyLoader() {
  return (
    <div className="loader-container">
      <svg className="moon-loader" viewBox="0 0 100 100">
        <circle
          className="moon-bg"
          cx="50"
          cy="50"
          r="45"
        />
        <circle
          className="moon-fill"
          cx="50"
          cy="50"
          r="45"
        />
      </svg>
    </div>
  );
}
