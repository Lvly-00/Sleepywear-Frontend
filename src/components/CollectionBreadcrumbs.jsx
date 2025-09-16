import { Breadcrumbs, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";

export default function CollectionBreadcrumbs({ items }) {
  const crumbs = items.map((item, index) =>
    item.to ? (
      <Anchor component={Link} to={item.to} key={index}>
        {item.label}
      </Anchor>
    ) : (
      <span key={index}>{item.label}</span>
    )
  );

  return <Breadcrumbs mb="md">{crumbs}</Breadcrumbs>;
}