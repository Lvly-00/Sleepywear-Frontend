import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Card,
  TextInput,
  PasswordInput,
  Group,
  Title,
  Stack,
  Text,
  Grid,
  Skeleton,
} from "@mantine/core";
import { Transition } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import PageHeader from "../components/PageHeader";
import SubmitButton from "../components/SubmitButton";
import { Icons } from "../components/Icons";

const CACHE_KEY = "user_settings_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const Settings = () => {
  const [profile, setProfile] = useState({ business_name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load from cache if valid
  const getCachedProfile = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  };

  // Fetch user settings
  const fetchProfile = async (force = false) => {
    const cachedProfile = getCachedProfile();
    if (cachedProfile && !force) {
      setProfile(cachedProfile);
      setLoading(false);
    }

    try {
      const res = await api.get("/user/settings");
      const freshData = {
        business_name: res.data.business_name || "",
        email: res.data.email || "",
      };
      setProfile(freshData);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: freshData, timestamp: Date.now() })
      );
    } catch (err) {
      if (!cachedProfile) {
        showNotification({
          title: "Error",
          message: "Failed to load user settings",
          color: "red",
          icon: <Icons.IconX size={16} />,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Generic update handler
  const handleUpdate = async (data, url, successMessage, refresh = false) => {
    try {
      setUpdating(true);
      const res = await api.put(url, data);

      showNotification({
        title: "Success",
        message: res.data.message || successMessage,
        color: "green",
        icon: <Icons.IconCheck size={16} />,
      });

      if (refresh) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      showNotification({
        title: errors ? "Validation Error" : "Error",
        message: errors
          ? Object.values(errors).flat().join(" ")
          : err.response?.data?.message || "Something went wrong",
        color: "red",
        icon: <Icons.IconX size={16} />,
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateProfile = (e) => {
    e.preventDefault();
    handleUpdate(profile, "/user/settings", "Profile updated successfully", true);
  };

  const updatePassword = (e) => {
    e.preventDefault();
    handleUpdate(
      passwords,
      "/user/settings/password",
      "Password updated successfully"
    );
    setPasswords({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
  };

  return (
    <div
      style={{
        padding: 20,
        position: "relative",
        fontFamily: "'League Spartan', sans-serif",
      }}
    >
      <PageHeader title="Account Settings" />

      {/* Profile Section */}
      <Grid gutter="xl" align="flex-start" mb="xl">
        <Grid.Col
          span={{ base: 12, md: 5 }}
          style={{ marginLeft: 40, marginTop: 30 }}
        >
          <Title order={2} style={{ color: "#02034C", fontWeight: 500 }}>
            Profile Information
          </Title>
          <Text size="md" color="#02034c6e">
            Update your Business Name and Email.
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card
            shadow="md"
            padding="xl"
            radius="xl"
            style={{
              border: "1px solid #E0E0E0",
              backgroundColor: "#FFFFFF",
              minHeight: 180,
            }}
          >
            {loading ? (
              <Stack>
                <Skeleton height={36} radius="md" />
                <Skeleton height={36} radius="md" />
                <Skeleton height={40} radius="xl" />
              </Stack>
            ) : (
              <Transition
                mounted={!loading}
                transition="fade"
                duration={300}
                timingFunction="ease"
              >
                {(styles) => (
                  <form onSubmit={updateProfile} style={styles}>
                    <Stack spacing="md">
                      <TextInput
                        label="Business Name"
                        value={profile.business_name}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            business_name: e.target.value,
                          })
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
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
                        disabled={updating}
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
                          loading={updating}
                          style={{ backgroundColor: "#232D80", color: "#fff" }}
                        >
                          Update
                        </SubmitButton>
                      </Group>
                    </Stack>
                  </form>
                )}
              </Transition>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* Password Section */}
      <Grid gutter="sm" align="flex-start">
        <Grid.Col
          span={{ base: 12, md: 5 }}
          style={{ marginLeft: 40, marginTop: 30 }}
        >
          <Title order={2} style={{ color: "#02034C", fontWeight: 500 }}>
            Update Password
          </Title>
          <Text size="md" color="#02034c6e">
            Use a strong combination of letters, numbers, and symbols (e.g. @, ?, 1, 2)
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card
            shadow="md"
            padding="xl"
            radius="xl"
            style={{
              border: "1px solid #E0E0E0",
              backgroundColor: "#FFFFFF",
              minHeight: 180,
            }}
          >
            {loading ? (
              <Stack>
                <Skeleton height={36} radius="md" />
                <Skeleton height={36} radius="md" />
                <Skeleton height={36} radius="md" />
                <Skeleton height={40} radius="xl" />
              </Stack>
            ) : (
              <Transition
                mounted={!loading}
                transition="fade"
                duration={300}
                timingFunction="ease"
              >
                {(styles) => (
                  <form onSubmit={updatePassword} style={styles}>
                    <Stack spacing="md">
                      <PasswordInput
                        label="Current Password"
                        value={passwords.current_password}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            current_password: e.target.value,
                          })
                        }
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? (
                            <Icons.BlueEye size={18} />
                          ) : (
                            <Icons.BlueEyeOff size={18} />
                          )
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
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            new_password: e.target.value,
                          })
                        }
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? (
                            <Icons.BlueEye size={18} />
                          ) : (
                            <Icons.BlueEyeOff size={18} />
                          )
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
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            new_password_confirmation: e.target.value,
                          })
                        }
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? (
                            <Icons.BlueEye size={18} />
                          ) : (
                            <Icons.BlueEyeOff size={18} />
                          )
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
                )}
              </Transition>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default Settings;
