import { Navigate } from "react-router-dom";
import SleepyLoader from "./SleepyLoader";
import CryptoJS from "crypto-js";

function getDeviceKey() {
  const fingerprint = navigator.userAgent + navigator.language + window.location.hostname;
  return CryptoJS.SHA256(fingerprint).toString();
}

function getDecryptedToken() {
  const encryptedToken = localStorage.getItem("secure_access_token");
  if (!encryptedToken) return null;

  try {
    const key = getDeviceKey();
    const bytes = CryptoJS.AES.decrypt(encryptedToken, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch {
    return null;
  }
}

const PrivateRoute = ({ children }) => {
  const token = getDecryptedToken();

  if (token === null || token === "") return <Navigate to="/" />;
  if (!token) return <SleepyLoader minTime={100} />;

  return children;
};

export default PrivateRoute;
