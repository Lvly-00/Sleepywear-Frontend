import { Navigate } from "react-router-dom";
import SleepyLoader from "./TopLoadingBar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (!token) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;
