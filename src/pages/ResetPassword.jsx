import React, { useState } from "react";
import {
  PasswordInput,
  Paper,
  Text,
  Stack,
  Center,
} from "@mantine/core";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { Icons } from "../components/Icons";
import WhiteLogo from "../assets/WhiteLogo.svg";
import SubmitButton from "../components/SubmitButton";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

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

    if (password.length < 8) {
      setMessage({
        text: "Password must be at least 8 characters.",
        type: "error",
      });
      return;
    }

    if (!token || !email) {
      setMessage({
        text: "Invalid reset link. Please request a new password reset.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const payload = {
      email,
      token,
      password,
      password_confirmation: confirmPassword,
    };

    try {
      const response = await api.post("/reset-password", payload);
      setMessage({
        text:
          response.data.message ||
          "Password reset successful! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      let msg = "Failed to reset password. Please try again.";
      if (err.response) {
        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          msg = Object.values(errors).flat().join(" ");
        } else if (err.response.status === 400) {
          msg = "Invalid or expired token. Please request a new reset link.";
        } else if (err.response.status === 404) {
          msg = "Email not found. Please verify your email.";
        } else if (err.response.status === 429) {
          msg = "Too many attempts. Please try again later.";
        } else if (err.response.data?.message) {
          msg = err.response.data.message;
        }
      } else if (err.request) {
        msg = "Unable to reach the server. Please check your connection.";
      }
      setMessage({ text: msg, type: "error" });
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
      {/* Left Section */}
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

      {/* Right Section */}
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
            align="center"
            mb="xl"
            style={{
              color: "#0D0F66",
              fontSize: 35,
              fontWeight: 500,
            }}
          >
            RESET PASSWORD
          </Text>

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
                  reveal ? <Icons.Eye /> : <Icons.EyeOff />
                }
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    color: "#c5a47e",
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
                  reveal ? <Icons.Eye /> : <Icons.EyeOff />
                }
                styles={{
                  input: {
                    borderColor: "#c5a47e",
                    color: "#c5a47e",
                  },
                  label: {
                    color: "#0b0c3f",
                    fontWeight: 400,
                    fontSize: 16,
                    marginBottom: 4,
                  },
                }}
              />

              {message.text && (
                <Text
                  align="center"
                  style={{
                    color: message.type === "error" ? "#9E2626" : "#52966dff",
                    marginBottom: 10,
                    fontSize: 15,
                    fontWeight: 400,
                  }}
                >
                  {message.text}
                </Text>
              )}

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

export default ResetPassword;
