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
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Separate error states for clarity
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Client-side regex for strong password
  const isPasswordSecure = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-={}[\]|\\:;"'<>,./~`])[A-Za-z\d@$!%*?&#^()_+\-={}[\]|\\:;"'<>,./~`]{8,}$/;
    return regex.test(password);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/settings");
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
      });
    } catch (err) {
      NotifySuccess.error("Could not load profile.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (data, url, refresh = false) => {
    try {
      setUpdating(true);
      await api.put(url, data);
      NotifySuccess.editedItem();
      setProfileErrors({});
      if (refresh) await fetchProfile();
    } catch (err) {
      const response = err.response?.data;
      if (err.response?.status === 422 && response?.errors) {
        setProfileErrors(response.errors);
      } else {
        NotifySuccess.error("Something went wrong.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const updateProfile = (e) => {
    e.preventDefault();
    handleUpdate(profile, "/user/settings", true);
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    // 1. Reset previous errors
    setPasswordErrors({});

    // 2. Client-Side Validation (New Password)
    // We check this first to save an API call if the format is obviously wrong.
    const validationErrors = {};
    if (passwords.new_password !== passwords.new_password_confirmation) {
      validationErrors.new_password_confirmation = ["Passwords do not match."];
    }
    if (!isPasswordSecure(passwords.new_password)) {
      validationErrors.new_password = [
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      ];
    }

    // If local validation fails, show errors and STOP.
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    // 3. Server-Side Validation (Current Password & Final Check)
    try {
      setUpdating(true);
      await api.put("/user/settings/password", passwords);

      NotifySuccess.passwordUpdated();

      // Clear form
      setPasswords({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });

      // Logout
      localStorage.removeItem("authToken");
      navigate("/");
    } catch (err) {
      const response = err.response?.data;
      const status = err.response?.status;

      // Handle 422 Validation Errors (Including "Current password incorrect")
      if (status === 422 && response?.errors) {
        // This takes the object { current_password: ["Incorrect..."], new_password: ["..."] }
        // and sets it to state. The Inputs will read this immediately.
        setPasswordErrors(response.errors);

        // Optional: Also show a toast if it's the specific password error
        if (response.errors.current_password) {
          NotifySuccess.error("Current password is incorrect");
        }
      }
      else if (response?.message) {
        NotifySuccess.error(response.message);
        setPasswordErrors({ general: response.message });
      } else {
        NotifySuccess.error("Failed to update password.");
      }

      console.error("Password update error:", response);
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
          <Text size="md" c="#02034c6e">
            Update your account’s Business Name and Email
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card shadow="md" padding="xl" radius="xl" style={{ border: "1px solid #E0E0E0", backgroundColor: "#FFFFFF", minHeight: 180 }}>
            {loading ? (
              <Stack gap="md">
                <Skeleton height={36} radius="md" />
                <Skeleton height={36} radius="md" />
                <Skeleton height={40} radius="xl" />
              </Stack>
            ) : (
              <Transition mounted={!loading} transition="fade" duration={300} timingFunction="ease">
                {(styles) => (
                  <form onSubmit={updateProfile} style={styles}>
                    <Stack gap="md">
                      <TextInput
                        label="Business Name"
                        value={profile.name}
                        onChange={(e) => {
                          setProfile({ ...profile, name: e.target.value });
                          setProfileErrors({ ...profileErrors, name: null });
                        }}
                        error={profileErrors.name?.[0]}
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{ label: { color: "#232D80" }, input: { borderColor: "#232D80", color: "#232c808f" } }}
                      />

                      <TextInput
                        label="Email"
                        value={profile.email}
                        onChange={(e) => {
                          setProfile({ ...profile, email: e.target.value });
                          setProfileErrors({ ...profileErrors, email: null });
                        }}
                        error={profileErrors.email?.[0]}
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{ label: { color: "#232D80" }, input: { borderColor: "#232D80", color: "#232c808f" } }}
                      />

                      <Group justify="flex-end">
                        <SubmitButton type="submit" radius="xl" loading={updating} style={{ backgroundColor: "#232D80", color: "#fff" }}>
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

          <Text
            size="md"
            c="#02034c6e"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: "1.4", 
              maxWidth: "320px", 
            }}
          >
            Use a strong combination of letters, numbers, and random symbols (e.g., @, ?, 1, 2) to enhance account security.
          </Text>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card shadow="md" padding="xl" radius="xl" style={{ border: "1px solid #E0E0E0", backgroundColor: "#FFFFFF", minHeight: 180 }}>
            {loading ? (
              <Stack gap="md">
                <Skeleton height={36} radius="md" />
                <Skeleton height={36} radius="md" />
                <Skeleton height={36} radius="md" />
                <Skeleton height={40} radius="xl" />
              </Stack>
            ) : (
              <Transition mounted={!loading} transition="fade" duration={300} timingFunction="ease">
                {(styles) => (
                  <form onSubmit={updatePassword} style={styles}>
                    <Stack gap="md">
                      {/* CURRENT PASSWORD INPUT */}
                      <PasswordInput
                        label="Current Password"
                        value={passwords.current_password}
                        onChange={(e) => {
                          setPasswords({
                            ...passwords,
                            current_password: e.target.value,
                          });
                          // Clear specific error on change
                          setPasswordErrors((prev) => ({ ...prev, current_password: null }));
                        }}
                        // Display error from state (Server or Client)
                        error={passwordErrors.current_password && passwordErrors.current_password[0]}
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{
                          label: { color: "#232D80" },
                          input: {
                            borderColor: passwordErrors.current_password ? "#fa5252" : "#232D80",
                            color: "#232c808f"
                          },
                        }}
                      />

                      {/* NEW PASSWORD INPUT */}
                      <PasswordInput
                        label="New Password"
                        value={passwords.new_password}
                        onChange={(e) => {
                          setPasswords({ ...passwords, new_password: e.target.value });
                          setPasswordErrors((prev) => ({ ...prev, new_password: null }));
                        }}
                        error={passwordErrors.new_password && passwordErrors.new_password[0]}
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{ label: { color: "#232D80" }, input: { borderColor: "#232D80", color: "#232c808f" } }}
                      />

                      {/* CONFIRM PASSWORD INPUT */}
                      <PasswordInput
                        label="Confirm New Password"
                        value={passwords.new_password_confirmation}
                        onChange={(e) => {
                          setPasswords({ ...passwords, new_password_confirmation: e.target.value });
                          setPasswordErrors((prev) => ({ ...prev, new_password_confirmation: null }));
                        }}
                        error={passwordErrors.new_password_confirmation && passwordErrors.new_password_confirmation[0]}
                        visibilityToggleIcon={({ reveal }) =>
                          reveal ? <Icons.BlueEye size={18} /> : <Icons.BlueEyeOff size={18} />
                        }
                        radius="md"
                        size="md"
                        disabled={updating}
                        styles={{ label: { color: "#232D80" }, input: { borderColor: "#232D80", color: "#232c808f" } }}
                      />

                      {/* General/Fallback Errors */}
                      {passwordErrors.general && (
                        <Text size="sm" c="red">
                          {passwordErrors.general}
                        </Text>
                      )}

                      <Group justify="flex-end">
                        <SubmitButton type="submit" radius="xl" loading={updating} style={{ backgroundColor: "#232D80", color: "#fff" }}>
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