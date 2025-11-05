import {
  TextInput,
  PasswordInput,
  Paper,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import { Icons } from "../components/Icons";
import { useState, useEffect } from "react";
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
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();

  // Load cooldown on mount
  useEffect(() => {
    const cooldownEnd = localStorage.getItem("login_cooldown_end");
    if (cooldownEnd) {
      const remaining = Math.floor((Number(cooldownEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
        setServerError("Too many attempts. Please wait 30 seconds.");
      } else {
        localStorage.removeItem("login_cooldown_end");
      }
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("login_cooldown_end");
            setServerError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    if (cooldown > 0) {
      setServerError("Too many attempts. Please wait 30 seconds.");
      return;
    }

    if (attempts >= 5) {
      const wait = 30 * 1000;
      const cooldownEnd = Date.now() + wait;
      localStorage.setItem("login_cooldown_end", cooldownEnd);
      setCooldown(wait / 1000);
      setAttempts(0); 
      localStorage.setItem("login_attempts", 0);
      setServerError("Too many attempts. Please wait 30 seconds.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("login_attempts", 0);
      setAttempts(0);

      navigate("/dashboard");
    } catch (err) {
      setPassword("");
      let msg = "An unexpected error occurred. Please try again.";

      if (err.response) {
        const status = err.response.status;
        if (status === 422) {
          setErrors(err.response.data.errors || {});
          msg = "";
        } else if (status === 401) {
          msg = "Incorrect email or password. Please try again.";
        } else if (status === 403) {
          msg = "Access denied. Your account may be inactive.";
        } else if (status === 404) {
          msg = "Login route not found on the server.";
        } else if (status === 429) {
          msg = "Too many attempts. Please wait a few minutes.";
        } else if (status === 500) {
          msg = "Internal server error. Please try again later.";
        } else {
          msg = err.response.data.message || msg;
        }
      } else if (err.request) {
        msg = "Unable to reach the server. Please check your connection.";
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts);

      if (newAttempts >= 5) {
        const wait = 30 * 1000;
        const cooldownEnd = Date.now() + wait;
        localStorage.setItem("login_cooldown_end", cooldownEnd);
        setCooldown(wait / 1000);
        setAttempts(0);
        localStorage.setItem("login_attempts", 0);
        msg = "Too many attempts. Please wait 30 seconds.";
      }

      setServerError(msg);
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
              <TextInput
                label="Email"
                leftSection={<Icons.Envelope />}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email ? errors.email[0] : undefined}
                radius="md"
                size="lg"
                disabled={loading || cooldown > 0}
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
                disabled={loading || cooldown > 0}
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

              {serverError && Object.keys(errors).length === 0 && (
                <Text color="red" align="center" size="sm" mb="sm">
                  {serverError}
                </Text>
              )}

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

              <SubmitButton
                type="submit"
                loading={loading}
                fullWidth
                radius="md"
                size="lg"
                disabled={cooldown > 0}
                style={{
                  backgroundColor: cooldown > 0 ? "#a0a0a0" : "#0D0F66",
                  color: "#fff",
                  fontWeight: 500,
                  marginTop: "10px",
                  cursor: cooldown > 0 ? "not-allowed" : "pointer",
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
