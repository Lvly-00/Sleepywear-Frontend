import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Paper,
  Center,
} from "@mantine/core";

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
        setServerError({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ height: "100vh" }}>
      <Paper shadow="lg" radius="md" p="xl" withBorder style={{ width: 400 }}>
        <Stack spacing="md">
          <Title order={2} align="center">
            Login
          </Title>

          {serverError.general && (
            <Text color="red" align="center">
              {serverError.general}
            </Text>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing="sm">
              <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email ? errors.email[0] : undefined}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password ? errors.password[0] : undefined}
                required
              />

              <Button type="submit" fullWidth loading={loading}>
                Login
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
}

export default Login;
