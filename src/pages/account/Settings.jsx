import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Text,
  Grid,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";

const Settings = () => {
  const [profile, setProfile] = useState({ business_name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For initial fetch

  useEffect(() => {
    api
      .get("/api/user/settings")
      .then((res) => {
        setProfile({
          business_name: res.data.business_name || "",
          email: res.data.email || "",
        });
      })
      .catch(() => {
        showNotification({
          title: "Error",
          message: "Failed to load user settings",
          color: "red",
          icon: <IconX size={16} />,
        });
      })
      .finally(() => setInitialLoading(false));
  }, []);

  const handleUpdate = async (data, url, successMessage) => {
    setLoading(true);
    try {
      const res = await api.put(url, data);
      showNotification({
        title: "Success",
        message: res.data.message || successMessage,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      const errors = err.response?.data?.errors;
      showNotification({
        title: errors ? "Validation Error" : "Error",
        message: errors
          ? Object.values(errors).flat().join(" ")
          : "Something went wrong",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (e) => {
    e.preventDefault();
    handleUpdate(profile, "/api/user/settings", "Profile updated successfully");
  };

  const updatePassword = (e) => {
    e.preventDefault();
    handleUpdate(
      passwords,
      "/api/user/settings/password",
      "Password updated successfully"
    );
    setPasswords({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
  };

  if (initialLoading) return <SleepyLoader />;

  return (
    <div style={{ padding: 20, position: "relative" }}>
      {loading && <SleepyLoader />}

      <PageHeader title="Account Settings" />

      {/* Profile Section */}
      <Grid gutter="xl" align="flex-start" mb="xl">
        <Grid.Col span={4}>
          <Title order={3}>Profile Information</Title>
          <Text size="sm" color="dimmed" mt="sm">
            Update your account’s Business Name and Email
          </Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
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
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  required
                />
                <Button type="submit" loading={loading} fullWidth mt="md">
                  Save
                </Button>
              </Stack>
            </form>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Password Section */}
      <Grid gutter="xl" align="flex-start">
        <Grid.Col span={4}>
          <Title order={3}>Update Password</Title>
          <Text size="sm" color="dimmed" mt="sm">
            Ensure your Account is using a strong password
          </Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <form onSubmit={updatePassword}>
              <Stack spacing="sm">
                <PasswordInput
                  label="Current Password"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      current_password: e.target.value,
                    })
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
                <Button type="submit" loading={loading} fullWidth mt="md">
                  Save
                </Button>
              </Stack>
            </form>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default Settings;
