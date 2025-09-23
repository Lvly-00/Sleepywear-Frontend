import { useState } from "react";
import { TextInput, Button, Title, Paper, Center, Stack, Notification } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ text: "Please enter your email.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.post("/api/forgot-password", { email });
      setMessage({ text: "Password reset link sent! Check your email.", type: "success" });
    } catch (error) {
      console.error(error);
      setMessage({ text: "Failed to send reset link. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ height: "100vh" }}>
      <Paper shadow="lg" radius="md" p="xl" withBorder style={{ width: 400 }}>
        <Stack spacing="md">
          <Title order={2} align="center">Forgot Password</Title>

          {message && (
            <Notification
              color={message.type === "error" ? "red" : "green"}
              title={message.type === "error" ? "Error" : "Success"}
            >
              {message.text}
            </Notification>
          )}

          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button fullWidth mt="sm" loading={loading} onClick={handleForgotPassword}>
            Send Reset Link
          </Button>

          <Button fullWidth variant="light" mt="sm" onClick={() => navigate("/")}>
            Back to Login
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}

export default ForgotPassword;
