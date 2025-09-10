import { useState } from "react";
import api from "../../api/axios"; // axios with withCredentials: true
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login", { email, password });
      console.log(res.data);
      setMessage(res.data.message);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Test Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;
