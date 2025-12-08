  import {
    TextInput,
    Paper,
    Text,
    Stack,
    Center,
  } from "@mantine/core";
  import { useState } from "react";
  import { Link } from "react-router-dom";
  import WhiteLogo from "../assets/WhiteLogo.svg";
  import api from "../api/axios";
  import { Icons } from "../components/Icons";
  import SubmitButton from "../components/SubmitButton";

  function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleForgotPassword = async (e) => {
      e.preventDefault();

      if (!email) {
        setMessage({ text: "Please enter your email.", type: "error" });
        return;
      }

      setLoading(true);
      setMessage({ text: "", type: "" });

      try {
        const response = await api.post("/passwords/forgot", { email });
        setMessage({
          text: response.data.message || "Password reset link sent! Check your email.",
          type: "success",
        });
      } catch (error) {
        let msg = "Failed to send reset link. Please try again.";

        if (error.response) {
          if (error.response.status === 404) {
            msg = "No account found with that email address.";
          } else if (error.response.status === 429) {
            msg = "Too many requests. Please try again later.";
          } else if (error.response.data?.message) {
            msg = error.response.data.message;
          }
        } else if (error.request) {
          msg = "Unable to connect to the server. Check your network.";
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
              FORGOT PASSWORD
            </Text>



            <form onSubmit={handleForgotPassword}>
              <Stack spacing="md">
                <TextInput
                  label="Email"
                  leftSection={<Icons.Envelope />}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  radius="md"
                  size="lg"
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
                  loading={loading}
                  fullWidth
                  radius="md"
                  size="lg"
                  style={{
                    backgroundColor: "#0D0F66",
                    color: "#fff",
                    fontWeight: 500,
                    marginTop: "10px",
                  }}
                >
                  Send Reset Link
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

  export default ForgotPassword;
