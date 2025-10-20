import { Navigate } from "react-router-dom";
import SleepyLoader from "./SleepyLoader";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (token === null) return <Navigate to="/" />; 
  if (!token) return <SleepyLoader minTime={100} />; 

  return children; 
};

export default PrivateRoute;
