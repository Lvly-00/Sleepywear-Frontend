import React, { useEffect, useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Group,
  Divider,
  Notification
} from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

const Settings = () => {
  const [profile, setProfile] = useState({ business_name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    fetch("/api/user/settings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) =>
        setProfile({
          business_name: data.business_name || "",
          email: data.email || "",
        })
      )
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const handleResponse = (res) => {
    if (res.message) {
      notifications.showNotification({
        title: "Success",
        message: res.message,
        color: "green",
        icon: <Check size={16} />,
      });
    } else {
      notifications.showNotification({
        title: "Error",
        message: res.error || "Something went wrong",
        color: "red",
        icon: <X size={16} />,
      });
    }
  };

  const updateProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/user/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then(handleResponse)
      .finally(() => setLoading(false));
  };

  const updatePassword = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/user/settings/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
        new_password_confirmation: passwords.new_password_confirmation,
      }),
    })
      .then((res) => res.json())
      .then(handleResponse)
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} align="center" mb="md">Account Settings</Title>

        <form onSubmit={updateProfile}>
          <Stack spacing="sm">
            <TextInput
              label="Business Name"
              placeholder="Enter your business name"
              value={profile.business_name}
              onChange={(e) =>
                setProfile({ ...profile, business_name: e.target.value })
              }
              required
            />
            <TextInput
              label="Email"
              placeholder="Enter your email"
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

        <form onSubmit={updatePassword}>
          <Stack spacing="sm">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              onChange={(e) =>
                setPasswords({ ...passwords, current_password: e.target.value })
              }
              required
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              onChange={(e) =>
                setPasswords({ ...passwords, new_password: e.target.value })
              }
              required
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
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
