import React, { useState } from "react";
import {
  TextInput,
  Button,
  Title,
  Notification,
  PasswordInput,
} from "@mantine/core";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../../api/axios";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
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

      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setMessage(Object.values(errors).flat().join(" "));
      } else {
        setMessage("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <Title order={2} mb="md">
        Reset Password
      </Title>

      <PasswordInput
        label="New Password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        mt="md"
        required
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        mt="sm"
        required
      />

      {message && (
        <Notification
          mt="sm"
          color={message.includes("Failed") ? "red" : "green"}
        >
          {message}
        </Notification>
      )}

      <Button
        fullWidth
        mt="md"
        loading={loading}
        onClick={handleResetPassword}
        disabled={loading}
      >
        Reset Password
      </Button>
    </div>
  );
}

export default ResetPassword;
