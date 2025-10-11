import React from "react";
import { Group, TextInput, Button, Text, ActionIcon } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { Icons } from "./Icons";
const PageHeader = ({
  title,
  showSearch,
  search,
  setSearch,
  addLabel,    // <- optional
  addLink,     // <- optional
  onAdd,       // <- optional
  showBack,    // <- NEW optional prop
}) => {
  const navigate = useNavigate();

  return (
    <Group justify="space-between" mb="md" mt={50}>
      {/* Left section: Back + Title */}
      <Group>
        {showBack && (
          <ActionIcon
            variant="transparent"
            onClick={() => navigate(-1)}
            size={50}
          >
            <Icons.Back size={50} style={{ color: "#232D80" }} />
          </ActionIcon>
        )}

        <Text
          component="h1"
          style={{
            fontFamily: "'League Spartan', sans-serif",
            fontWeight: 700,
            fontSize: "64px",
            color: "#02034C",
            margin: 0,
          }}
        >
          {title}
        </Text>
      </Group>

      {/* Right section: Search + Optional Add button */}
      <Group>
        {showSearch && (
          <TextInput
            placeholder={`Search ${title}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<Icons.Search style={{ color: "#444444" }} size={18} />}
            radius="md"
            style={{ maxWidth: 250, width: 250 }}
          />
        )}

        {addLabel &&
          (addLink ? (
            <Button
              component={Link}
              to={addLink}
              radius="md"
              style={{
                backgroundColor: "#232D80",
                width: 150,
              }}
            >
              {addLabel}
            </Button>
          ) : (
            <Button
              onClick={onAdd}
              radius="md"
              style={{
                backgroundColor: "#232D80",
              }}
            >
              {addLabel}
            </Button>
          ))}
      </Group>
    </Group>
  );
};

export default PageHeader;
