import {
  TextInput,
  PasswordInput,
  Paper,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import { Icons } from "../components/Icons";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhiteLogo from "../assets/WhiteLogo.svg";
import api from "../api/axios";
import SubmitButton from "../components/SubmitButton";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [attempts, setAttempts] = useState(
    Number(localStorage.getItem("login_attempts")) || 0
  );
  const [cooldown, setCooldown] = useState(false);

  const navigate = useNavigate();
  const cooldownTimer = useRef(null);

  // Show cooldown message
  const activateCooldown = (duration = 30000) => {
    setCooldown(true);
    setServerError(
      <>
        There have been several failed attempts to sign in from this account.{" "}
        Please wait a while and try again later.{" "}
        <Link to="/forgot-password" style={{ color: "#1D72D4" }}>
          Forgot password?
        </Link>
      </>
    );

    clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => {
      setCooldown(false);
      setServerError("");
    }, duration);
  };

  // Check if cooldown is active on mount
  useEffect(() => {
    const cooldownEnd = Number(localStorage.getItem("login_cooldown_end") || 0);
    const now = Date.now();
    if (cooldownEnd > now) {
      const remaining = cooldownEnd - now;
      activateCooldown(remaining);
    } else {
      localStorage.removeItem("login_cooldown_end");
    }

    return () => clearTimeout(cooldownTimer.current);
  }, []);

 const handleLogin = async (e) => {
  e.preventDefault();
  if (cooldown) return;

  setErrors({});
  setServerError("");
  setLoading(true);

  let newAttempts = attempts + 1;

  // Increment attempts immediately and check for cooldown
  if (newAttempts >= 3) {
    const wait = 30 * 1000;
    const cooldownEnd = Date.now() + wait;
    localStorage.setItem("login_cooldown_end", cooldownEnd);
    setAttempts(0);
    localStorage.setItem("login_attempts", 0);
    activateCooldown(wait);
    setLoading(false);
    return; // block login immediately
  } else {
    setAttempts(newAttempts);
    localStorage.setItem("login_attempts", newAttempts);
  }

  try {
    const response = await api.post("/login", { email, password });
    // Successful login
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("login_attempts", 0);
    setAttempts(0);
    navigate("/dashboard");
  } catch (err) {
    setPassword("");
    let fieldErrors = {};
    let serverMsg = "";

    if (err.response) {
      const status = err.response.status;
      if (status === 422) {
        fieldErrors = err.response.data.errors || {};
      } else if (status === 401) {
        const msg = err.response.data.message;
        if (msg.includes("password")) fieldErrors.password = [msg];
        else if (msg.includes("email")) fieldErrors.email = [msg];
        else serverMsg = msg;
      } else {
        serverMsg = err.response.data?.message || "An unexpected error occurred. Please try again.";
      }
    } else if (err.request) {
      serverMsg = "Unable to reach the server. Please check your connection.";
    }

    setErrors(fieldErrors);
    setServerError(serverMsg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          flex: 2,
          backgroundColor: "#0A0B32",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <img
          src={WhiteLogo}
          alt="Sleepywears Logo"
          style={{ maxWidth: "100%", height: "30%" }}
        />
      </div>

      <Center style={{ flex: 1 }}>
        <Paper
          p="md"
          radius="md"
          style={{
            width: 400,
            backgroundColor: "#F1F0ED",
          }}
        >
          <Text
            order={2}
            align="center"
            mb="xl"
            style={{
              color: "#0b0c3f",
              fontSize: 40,
              fontWeight: 500,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            LOGIN
          </Text>

          <form onSubmit={handleLogin}>
            <Stack spacing="md">
              {/* Server error above email */}
              {serverError && Object.keys(errors).length === 0 && (
                <Text color="red" align="center" size="sm" mb="sm">
                  {serverError}
                </Text>
              )}

              <TextInput
                label="Email"
                leftSection={<Icons.Envelope />}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email ? errors.email[0] : undefined}
                radius="md"
                size="lg"
                disabled={loading || cooldown}
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    color: "#c5a47e",
                    backgroundColor: loading ? "#e9e9e9" : "white",
                  },
                  label: {
                    color: "#0b0c3f",
                    fontWeight: 400,
                    fontSize: 16,
                    marginBottom: 4,
                  },
                }}
              />

              <PasswordInput
                label="Password"
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password ? errors.password[0] : undefined}
                radius="md"
                size="lg"
                visible={visible}
                onVisibilityChange={setVisible}
                visibilityToggleIcon={({ reveal }) =>
                  reveal ? <Icons.Eye /> : <Icons.EyeOff />
                }
                disabled={loading || cooldown}
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    color: "#c5a47e",
                    backgroundColor: loading ? "#e9e9e9" : "white",
                  },
                  label: {
                    color: "#0b0c3f",
                    fontWeight: 400,
                    fontSize: 16,
                    marginBottom: 4,
                  },
                }}
              />

              {!cooldown && (
                <Text align="right" size="xs">
                  <Link
                    to="/forgot-password"
                    style={{
                      color: "#1D72D4",
                      fontSize: "12px",
                      fontWeight: 300,
                      textDecoration: "none",
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Text>
              )}

              <SubmitButton
                type="submit"
                loading={loading}
                fullWidth
                radius="md"
                size="lg"
                disabled={cooldown}
                style={{
                  backgroundColor: cooldown ? "#a0a0a0" : "#0D0F66",
                  color: "#fff",
                  fontWeight: 500,
                  marginTop: "10px",
                  cursor: cooldown ? "not-allowed" : "pointer",
                }}
              >
                Login
              </SubmitButton>
            </Stack>
          </form>
        </Paper>
      </Center>
    </div>
  );
}

export default Login;
