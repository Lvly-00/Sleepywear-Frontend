import React, { useState } from "react";
import {
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Center,
  Notification,
} from "@mantine/core";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../api/axios";
import { Icons } from "../../components/Icons"
import WhiteLogo from "../../assets/WhiteLogo.svg";
import SubmitButton from "../../components/SubmitButton"; // if you want the same reusable button

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage({ text: "Please fill in all fields.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      email,
      token,
      password,
      password_confirmation: confirmPassword,
    };

    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/reset-password", payload);

      setMessage({
        text: "Password reset successful. Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setMessage({
          text: Object.values(errors).flat().join(" "),
          type: "error",
        });
      } else {
        setMessage({
          text: "Failed to reset password. Please try again.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Poppins, sans-serif" }}>
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
              color: "#0b0c3f",
              fontSize: 40,
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
          >
            RESET PASSWORD
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

          <form onSubmit={handleResetPassword}>
            <Stack spacing="md">
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                radius="md"
                size="lg"
                visibilityToggleIcon={({ reveal }) =>
                  reveal ? (
                    <Icons.Eye />
                  ) : (
                    <Icons.EyeOff />
                  )
                } styles={{
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
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                radius="md"
                size="lg"
                visibilityToggleIcon={({ reveal }) =>
                  reveal ? (
                    <Icons.Eye />
                  ) : (
                    <Icons.EyeOff />
                  )
                } styles={{
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
                fullWidth
                loading={loading}
                radius="md"
                size="lg"
                style={{
                  backgroundColor: "#0D0F66",
                  color: "#fff",
                  fontWeight: 500,
                  marginTop: "10px",
                }}
              >
                Reset Password
              </SubmitButton>
            </Stack>
          </form>
        </Paper>
      </Center>
    </div>
  );
}

export default ResetPassword;
