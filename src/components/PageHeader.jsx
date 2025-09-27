import React from "react";
import { Group, TextInput, Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconSearch, IconPlus } from "@tabler/icons-react";

const PageHeader = ({
  title,
  showSearch,
  search,
  setSearch,
  addLabel,
  addLink,
  onAdd,
}) => {
  return (
    <Group justify="space-between" mb="md">
      <h1>{title}</h1>
      <Group>
        {showSearch && (
          <TextInput
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<IconSearch size={16} />}
            style={{ maxWidth: 250 }}
          />
        )}
        {addLabel &&
          (addLink ? (
            // If addLink exists → Go to link
            <Button
              component={Link}
              to={addLink}
              leftSection={<IconPlus size={16} />}
            >
              {addLabel}
            </Button>
          ) : (
            // If onAdd exists → Open modal
            <Button onClick={onAdd} leftSection={<IconPlus size={16} />}>
              {addLabel}
            </Button>
          ))}
      </Group>
    </Group>
  );
};

export default PageHeader;
