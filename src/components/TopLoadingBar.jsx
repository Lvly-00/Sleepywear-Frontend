import React, { useEffect, useState } from "react";

export default function TopLoadingBar({ loading }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let interval;

    if (loading) {
      setWidth(10); 

      interval = setInterval(() => {
        setWidth((oldWidth) => {
          if (oldWidth >= 90) return 90; 
          return oldWidth + 5; 
        });
      }, 100);
    } else {
      setWidth(100); 
      const timeout = setTimeout(() => setWidth(0), 1000);
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        backgroundColor: "#FFD36B", 
        width: `${width}%`,
        transition: loading ? "width 0.1s linear" : "width 0.3s ease-out",
        zIndex: 9999,
      }}
    />
  );
}
