import React, { useState, useEffect } from "react";
import "../css/PageLoader.css"; // make sure this exists

export default function PageLoader({ children, minTime = 1000 }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), minTime);
    return () => clearTimeout(timer);
  }, [minTime]);

  if (loading) {
    return (
      <div className="page-loader-fullscreen">
        <div className="moon-wrapper">
          <div className="crescent-moon"></div>
          <div className="zzz-container">
            <span className="zzz">Z</span>
            <span className="zzz">Z</span>
            <span className="zzz">Z</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
