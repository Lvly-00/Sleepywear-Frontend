import { useState } from "react";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrors({});
    setServerError({});
    setLoading(true);

    try {
      await axios.get("/sanctum/csrf-cookie");
      await axios.post("/api/login", { email, password });
      setEmail("");
      setPassword("");
      navigate("/dashboard");
    } catch (e) {
      if (e.response && e.response.status === 422) {
        setErrors(e.response.data.errors || {});
      } else {
        // Fallback for any unexpected error
        setServerError({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Login</h1>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <small style={{ color: "red" }}>{errors.email[0]}</small>
          )}
          {serverError.email && (
            <small style={{ color: "red" }}>{serverError.email}</small>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && (
            <small style={{ color: "red" }}>{errors.password[0]}</small>
          )}

          {serverError.password && (
            <small style={{ color: "red" }}>{serverError.password}</small>
          )}
        </div>

        {serverError.general && (
          <p style={{ color: "red", textAlign: "center" }}>
            {serverError.general}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
