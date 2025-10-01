import { Button } from "@mantine/core";

function SubmitButton({ children, loading, ...props }) {
  return (
    <Button
      {...props}
      disabled={loading} 
      style={{
        backgroundColor: "#0D0F66",
        color: "#fff",
        fontWeight: 500,
        marginTop: "10px",
        opacity: loading ? 0.7 : 1, 
        cursor: loading ? "not-allowed" : "pointer",
        ...props.style, 
      }}
    >
      {children}
    </Button>
  );
}

export default SubmitButton;
