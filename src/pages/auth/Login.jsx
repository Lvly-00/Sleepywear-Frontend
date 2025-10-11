import {
  TextInput,
  PasswordInput,
  Paper,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import { Icons } from "../../components/Icons"
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhiteLogo from "../../assets/WhiteLogo.svg";
import api from "../../api/axios";
import SubmitButton from "../../components/SubmitButton";

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
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/login", { email, password });
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
    <div style={{ display: "flex", height: "100vh", fontFamily: 'Poppins, sans-serif', }}>
      {/* Left Section with Logo */}
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

      {/* Right Section with Form */}
      <Center style={{ flex: 1 }}>
        <Paper
          p="md"
          radius="md"
          style={{
            width: 400,
            backgroundColor:" #F1F0ED"

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
                leftSection={<Icons.Envelope />}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email ? errors.email[0] : undefined}
                radius="md"
                size="lg"
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    color: "#c5a47e"

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
                  reveal ? (
                    <Icons.Eye />
                  ) : (
                    <Icons.EyeOff />
                  )
                }
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    color: "#c5a47e"

                  },
                  label: {
                    color: "#0b0c3f",
                    fontWeight: 400,
                    fontSize: 16,

                    marginBottom: 4,
                  },
                }}

              />

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
                style={{
                  backgroundColor: "#0D0F66",
                  color: "#fff",
                  fontWeight: 500,
                  marginTop: "10px",
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
