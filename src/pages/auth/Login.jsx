// Login.jsx
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import { IconMail, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhiteLogo from "../../assets/WhiteLogo.svg";
import axios from "../../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState({});
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError({});
    setLoading(true);

    try {
      await axios.get("/sanctum/csrf-cookie");
      await axios.post("/api/login", { email, password });
      navigate("/dashboard");
    } catch (e) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors || {});
      } else {
        setServerError({ general: "An unexpected error occurred." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Left Section with Logo */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#0b0c3f",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <img
          src={WhiteLogo}
          alt="Sleepywears Logo"
          style={{ maxWidth: "70%", height: "auto" }}
        />
      </div>

      {/* Right Section with Form */}
      <Center style={{ flex: 1 }}>
        <Paper
          p="xl"
          radius="md"
          style={{
            width: 400,

          }}
        >
          <Text order={2} align="center" mb="xl" style={{ color: "#0b0c3f", fontSize: 40, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
            LOGIN
          </Text>

          {serverError.general && (
            <Text color="red" align="center" size="sm" mb="sm">
              {serverError.general}
            </Text>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing="md">
              <TextInput
                label="Email"
                icon={<IconMail size={16} color="#c5a47e" />}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email ? errors.email[0] : undefined}
                radius="md"
                size="lg"
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    paddingLeft: 40,
                    backgroundColor: "#fff",
                  },
                  label: {
                    color: "#0b0c3f",
                    fontWeight: 300,
                    fontSize: 16,
                    majrginBottom: 4,
                  },
                }}
                required
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
                  reveal ? (
                    <IconEyeOff size={16} color="#c5a47e" />
                  ) : (
                    <IconEye size={16} color="#c5a47e" />
                  )
                }
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    backgroundColor: "#fff",
                  },
                  label: {
                    color: "#0b0c3f",
                    fontWeight: 300,
                    fontSize: 16,

                    marginBottom: 4,
                  },
                }}
                required
              />

              <Text align="right" size="xs">
                <Link
                  to="/forgot-password"
                  style={{
                    color: "#1D72D4",
                    fontSize: "12px",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </Text>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                radius="md"
                size="md"
                style={{
                  backgroundColor: "#0b0c3f",
                  color: "#fff",
                  fontWeight: 500,
                  marginTop: "10px",
                }}
              >
                Login
              </Button>
            </Stack>
          </form>
        </Paper>
      </Center>
    </div>
  );
}

export default Login;
