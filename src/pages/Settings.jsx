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
  Transition,
} from "@mantine/core";
import NotifySuccess from "@/components/NotifySuccess";
import PageHeader from "../components/PageHeader";
import SubmitButton from "../components/SubmitButton";
import { Icons } from "../components/Icons";
import { useLocation, useNavigate } from "react-router-dom";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ business_name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Password validation regex (min 8 chars, uppercase, lowercase, number, special char)
  const isPasswordSecure = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-={}[\]|\\:;"'<>,./~`])[A-Za-z\d@$!%*?&#^()_+\-={}[\]|\\:;"'<>,./~`]{8,}$/;
    return regex.test(password);
  };

  // Fetch user settings
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/settings");
      setProfile({
        business_name: res.data.business_name || "",
        email: res.data.email || "",
      });
    } catch (err) {
      NotifySuccess.deleted();
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Generic update handler
  const handleUpdate = async (data, url, refresh = false) => {
    try {
      setUpdating(true);
      await api.put(url, data);
      NotifySuccess.editedItem();

      if (refresh) await fetchProfile();
    } catch (err) {
      NotifySuccess.deleted();
      console.error("Update error:", err.response?.data);
    } finally {
      setUpdating(false);
    }
  };

  // Update Profile
  const updateProfile = (e) => {
    e.preventDefault();
    handleUpdate(profile, "/user/settings", true);
  };

  // Update Password
  const updatePassword = async (e) => {
    e.preventDefault();

    if (!isPasswordSecure(passwords.new_password)) {
      NotifySuccess.weakPassword();
      return;
    }

    if (passwords.new_password !== passwords.new_password_confirmation) {
      NotifySuccess.passwordMismatch();
      return;
    }

    try {
      setUpdating(true);
      await api.put("/user/settings/password", passwords);

      // ✅ Success notification
      NotifySuccess.passwordUpdated();

      setPasswords({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      // Example logout (if using token auth)
      localStorage.removeItem("authToken");
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      const currentPasswordError =
        err.response?.data?.errors?.current_password?.includes(
          "Current password is incorrect."
        );

      if (currentPasswordError) {
        NotifySuccess.incorrectPassword();
      } else if (errorMsg === "Failed to update password.") {
        NotifySuccess.deleted();
      } else {
        NotifySuccess.deleted();
      }

      console.error("Password update error:", err.response?.data);
    } finally {
      setUpdating(false);
    }
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
        <Grid.Col span={{ base: 12, md: 5 }} style={{ marginLeft: 40, marginTop: 30 }}>
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
              <Transition mounted={!loading} transition="fade" duration={300} timingFunction="ease">
                {(styles) => (
                  <form onSubmit={updateProfile} style={styles}>
                    <Stack spacing="md">
                      <TextInput
                        label="Business Name"
                        value={profile.business_name}
                        onChange={(e) =>
                          setProfile({ ...profile, business_name: e.target.value })
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{
                          label: { color: "#232D80" },
                          input: { borderColor: "#232D80", color: "#232c808f" },
                        }}
                      />
                      <TextInput
                        label="Email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{
                          label: { color: "#232D80" },
                          input: { borderColor: "#232D80", color: "#232c808f" },
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
        <Grid.Col span={{ base: 12, md: 5 }} style={{ marginLeft: 40, marginTop: 30 }}>
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
              <Transition mounted={!loading} transition="fade" duration={300} timingFunction="ease">
                {(styles) => (
                  <form onSubmit={updatePassword} style={styles}>
                    <Stack spacing="md">
                      <PasswordInput
                        label="Current Password"
                        value={passwords.current_password}
                        onChange={(e) =>
                          setPasswords({ ...passwords, current_password: e.target.value })
                        }
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{
                          label: { color: "#232D80" },
                          input: { borderColor: "#232D80", color: "#232c808f" },
                        }}
                      />
                      <PasswordInput
                        label="New Password"
                        value={passwords.new_password}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new_password: e.target.value })
                        }
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{
                          label: { color: "#232D80" },
                          input: { borderColor: "#232D80", color: "#232c808f" },
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
                          reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{
                          label: { color: "#232D80" },
                          input: { borderColor: "#232D80", color: "#232c808f" },
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
    </div>
  );
};

export default Settings;
