import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

const Settings = () => {
  const [profile, setProfile] = useState({ business_name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  // Load user settings
  useEffect(() => {
    api
      .get("/api/user/settings")
      .then((res) => {
        setProfile({
          business_name: res.data.business_name || "",
          email: res.data.email || "",
        });
      })
      .catch((err) => {
        showNotification({
          title: "Error",
          message: "Failed to load user settings",
          color: "red",
          icon: <IconX size={16} />,
        });
        console.error(err);
      });
  }, []);

  // Profile update handler
  const updateProfile = (e) => {
    e.preventDefault();
    setLoading(true);

    api
      .put("/api/user/settings", profile)
      .then((res) => {
        showNotification({
          title: "Success",
          message: res.data.message || "Profile updated successfully",
          color: "green",
          icon: <IconCheck size={16} />,
        });
      })
      .catch((err) => {
        if (err.response?.status === 422) {
          const errors = err.response.data.errors;
          showNotification({
            title: "Validation Error",
            message: Object.values(errors).flat().join(" "),
            color: "red",
            icon: <IconX size={16} />,
          });
        } else {
          showNotification({
            title: "Error",
            message: "Something went wrong updating profile",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  // Password update handler
  const updatePassword = (e) => {
    e.preventDefault();
    setLoading(true);

    api
      .put("/api/user/settings/password", passwords)
      .then((res) => {
        showNotification({
          title: "Success",
          message: res.data.message || "Password updated successfully",
          color: "green",
          icon: <IconCheck size={16} />,
        });
        setPasswords({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      })
      .catch((err) => {
        if (err.response?.status === 422) {
          const errors = err.response.data.errors;
          showNotification({
            title: "Validation Error",
            message: Object.values(errors).flat().join(" "),
            color: "red",
            icon: <IconX size={16} />,
          });
        } else {
          showNotification({
            title: "Error",
            message: "Failed to update password",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} align="center" mb="md">
          Account Settings
        </Title>

        {/* Profile Form */}
        <form onSubmit={updateProfile}>
          <Stack spacing="sm">
            <TextInput
              label="Business Name"
              value={profile.business_name}
              onChange={(e) =>
                setProfile({ ...profile, business_name: e.target.value })
              }
              required
            />
            <TextInput
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
            <Button type="submit" loading={loading} fullWidth mt="md">
              Update Profile
            </Button>
          </Stack>
        </form>

        <Divider my="lg" label="Change Password" labelPosition="center" />

        {/* Password Form */}
        <form onSubmit={updatePassword}>
          <Stack spacing="sm">
            <PasswordInput
              label="Current Password"
              value={passwords.current_password}
              onChange={(e) =>
                setPasswords({ ...passwords, current_password: e.target.value })
              }
              required
            />
            <PasswordInput
              label="New Password"
              value={passwords.new_password}
              onChange={(e) =>
                setPasswords({ ...passwords, new_password: e.target.value })
              }
              required
            />
            <PasswordInput
              label="Confirm New Password"
              value={passwords.new_password_confirmation}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  new_password_confirmation: e.target.value,
                })
              }
              required
            />
            <Button type="submit" color="blue" loading={loading} fullWidth mt="md">
              Change Password
            </Button>
          </Stack>
        </form>
      </Card>
    </div>
  );
};

export default Settings;
