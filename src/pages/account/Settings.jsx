import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Card,
  TextInput,
  PasswordInput,
  Group,
  Title,
  Stack,
  Text,
  Grid,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import SubmitButton from "../../components/SubmitButton";
import { Icons } from "../../components/Icons"

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
      // setLoading(false);
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

  // if (initialLoading) return <SleepyLoader />;

  return (
    <div style={{
      padding: 20, position: "relative", fontFamily: "'League Spartan', sans-serif",
    }}>

      <PageHeader title="Account Settings" />

      {/* Profile Section */}
      <Grid gutter="xl" align="flex-start" mb="xl">
        <Grid.Col span={5} style={{ marginLeft: 40, marginTop: 30 }}>
          <Title order={2} style={{ color: "#02034C", fontWeight: 500, marginBottom: 2 }}>Profile Information</Title>
          <Text size="md" color="#02034c6e" >
            Update your account’s Business Name and Email
          </Text>
        </Grid.Col>
        <Grid.Col span={5}>
          <Card
            shadow="md" // slightly larger shadow for depth
            padding="xl"
            radius="xl" // more rounded corners like the design
            style={{ border: "1px solid #E0E0E0", backgroundColor: "#FFFFFF" }}
          >
            <form onSubmit={updateProfile}>
              <Stack spacing="md">
                <TextInput
                  label="Business Name"
                  value={profile.business_name}
                  onChange={(e) =>
                    setProfile({ ...profile, business_name: e.target.value })
                  }
                  radius="md" // rounded input edges
                  size="md"
                  styles={{
                    label: { color: "#232D80" },
                    input: {
                      borderColor: "#232D80",
                      color: "#232c808f",
                    },
                  }}
                />
                <TextInput
                  label="Email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  radius="md"
                  size="md"
                  styles={{
                    label: { color: "#232D80" },
                    input: {
                      borderColor: "#232D80",
                      color: "#232c808f",
                    },
                  }}
                />
                <Group justify="flex-end">
                  <SubmitButton
                    type="submit"
                    radius="xl"
                    style={{ backgroundColor: "#232D80", color: "#fff" }}
                  >
                    Update
                  </SubmitButton>
                </Group>

              </Stack>
            </form>
          </Card>

        </Grid.Col>
      </Grid>

      {/* Password Section */}
      <Grid gutter="sm" align="flex-start">
        <Grid.Col span={5} style={{ marginLeft: 40, marginTop: 30 }}>
          <Title order={2} style={{ color: "#02034C", fontWeight: 500, marginBottom: 2 }}>Update Password</Title>
          <Text size="md" color="#02034c6e" >
            Use a strong combination of letters, numbers,</Text>
          <Text size="md" color="#02034c6e" >
            and random symbols (e.g., @, ?, 1, 2) to </Text>
          <Text size="md" color="#02034c6e" >
            enhance account security.”</Text>

        </Grid.Col>
        <Grid.Col span={5}>
          <Card
            shadow="md"
            padding="xl"
            radius="xl"
            style={{ border: "1px solid #E0E0E0", backgroundColor: "#FFFFFF" }}
          >
            <form onSubmit={updatePassword}>
              <Stack spacing="md">
                <PasswordInput
                  label="Current Password"
                  value={passwords.current_password}
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                  }
                
                  onChange={(e) =>
                    setPasswords({ ...passwords, current_password: e.target.value })
                  }
                  radius="md"
                  size="md"
                  styles={{
                    label: { color: "#232D80" },
                    input: {
                      borderColor: "#232D80",
                      color: "#232c808f",
                    },
                  }}
                />
                <PasswordInput
                  label="New Password"
                  value={passwords.new_password}
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                  }
                  onChange={(e) =>
                    setPasswords({ ...passwords, new_password: e.target.value })
                  }
                  radius="md"
                  size="md"
                  styles={{
                    label: { color: "#232D80" },
                    input: {
                      borderColor: "#232D80",
                      color: "#232c808f",
                    },
                  }}
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={passwords.new_password_confirmation}
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                  }
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      new_password_confirmation: e.target.value,
                    })

                  }
                  radius="md"
                  size="md"
                  styles={{
                    label: { color: "#232D80" },
                    input: {
                      borderColor: "#232D80",
                      color: "#232c808f",
                    },
                  }}
                />
                <Group justify="flex-end">
                  <SubmitButton
                    type="submit"
                    radius="xl"
                    style={{ backgroundColor: "#232D80", color: "#fff" }}
                  >
                    Update
                  </SubmitButton>
                </Group>

              </Stack>
            </form>
          </Card>

        </Grid.Col>
      </Grid>
    </div>
  );
};

export default Settings;
