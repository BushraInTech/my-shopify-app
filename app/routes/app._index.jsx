import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { Page, Card, DataTable } from "@shopify/polaris";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const tickets = await db.ticket.findMany({
    where: { shopDomain: session.shop },
    orderBy: { createdAt: "asc" }, 
  });
  return { tickets };
}

export default function Index() {
  const { tickets } = useLoaderData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Page title="Zendesk Ticket Generate">Loading...</Page>;
  }

  const rows = tickets.map((ticket, index) => [
    index + 1, 
    ticket.title,
    ticket.status,
    new Date(ticket.createdAt).toISOString().slice(0, 10),
  ]);

  return (
    <Page
      title="Zendesk Ticket Generate"
      primaryAction={{
        content: "Create Ticket",
        onAction: () => {
          const search = window.location.search || "";
          window.location.href = "/app/tickets/new" + search;
        },
      }}
    >
      <Card>
        <div style={{ maxWidth: "600px" }}>
          <DataTable
            columnContentTypes={["numeric", "text", "text", "text"]}
            headings={["No.", "Inquiry", "Status", "Date"]}
            rows={rows}
          />
        </div>
      </Card>
    </Page>
  );
}
