import React from "react";
import { Button, Container, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        backgroundColor: "#F2F1EC",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Instrument Serif, serif",
      }}
    >
      <Container>
        <Title
          order={1}
          style={{
            fontFamily: "Fjalla One, sans-serif",
            fontSize: "clamp(6rem, 12vw, 10rem)",
            color: "#102E50",
            marginBottom: "1rem",
            letterSpacing: "2px",
          }}
        >
          404
        </Title>

        <Text
          style={{
            color: "#111",
            fontSize: "1.2rem",
            marginBottom: "2rem",
            fontFamily: "Instrument Serif, serif",
          }}
        >
          Oops! The page you’re looking for doesn’t exist or may have been moved.
        </Text>

        <Button
          onClick={() => navigate("/")}
          size="md"
          radius="md"
          style={{
            backgroundColor: "#102E50",
            color: "#fff",
            fontFamily: "Fjalla One, sans-serif",
            letterSpacing: "0.5px",
            padding: "0.6rem 1.5rem",
          }}
        >
          Go Back Home
        </Button>
      </Container>
    </section>
  );
}
