import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { Page, Card, Text, Badge, BlockStack } from "@shopify/polaris";

export async function loader({ request, params }) {
  const { session } = await authenticate.admin(request);
  const ticket = await db.ticket.findFirst({
    where: {
      id: parseInt(params.id),
      shopDomain: session.shop,
    },
  });
  return { ticket };
}

export default function TicketDetail() {
  const { ticket } = useLoaderData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Page title="Loading ticket..." />;
  }

  return (
    <Page
      title={ticket.title}
      breadcrumbs={[{ content: "Zendesk Ticket Generate", url: "/app" }]}
    >
      <Card>
        <BlockStack gap="400">
          <Text variant="bodyMd">
            <strong>Inquiry:</strong> {ticket.inquiry}
          </Text>
          <Text variant="bodyMd">
            <strong>Status:</strong>{" "}
            <Badge tone={ticket.status === "pending" ? "warning" : "success"}>
              {ticket.status}
            </Badge>
          </Text>
          <Text variant="bodyMd">
            <strong>Date:</strong>{" "}
            {new Date(ticket.createdAt).toISOString().slice(0, 10)}
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}