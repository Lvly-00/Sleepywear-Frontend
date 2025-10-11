// ForgotPassword.jsx
import {
  TextInput,
  Button,
  Paper,
  Text,
  Stack,
  Center,
  Notification,
} from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WhiteLogo from "../../assets/WhiteLogo.svg";
import api from "../../api/axios";
import { Icons } from "../../components/Icons";
import SubmitButton from "../../components/SubmitButton";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: "Please enter your email.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.post("/api/forgot-password", { email });
      setMessage({
        text: "Password reset link sent! Check your email.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setMessage({
        text: "Failed to send reset link. Try again.",
        type: "error",
      });
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
            backgroundColor: " #F1F0ED"

          }}
        >
          <Text
            order={2}
            align="center"
            mb="xl"
            style={{
              color: "#0D0F66",
              fontSize: 35,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
          >
            FORGOT PASSWORD
          </Text>

          {message && (
            <Notification
              color={message.type === "error" ? "red" : "green"}
              title={message.type === "error" ? "Error" : "Success"}
              mb="sm"
            >
              {message.text}
            </Notification>
          )}

          <form onSubmit={handleForgotPassword}>
            <Stack spacing="md">
              <TextInput
                label="Email"
                leftSection={<Icons.Envelope />}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Send Reset Link
              </SubmitButton>
              <Text align="center" size="md">
                <Link
                  to="/"
                  style={{
                    color: "#1D72D4",
                    fontSize: "16px",
                    fontWeight: 300,
                    textDecoration: "none",
                  }}
                >
                  Back to Login
                </Link>
              </Text>

            </Stack>
          </form>
        </Paper>
      </Center>
    </div>
  );
}

export default ForgotPassword;
