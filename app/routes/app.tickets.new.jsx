import { useActionData, redirect } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { Page, Card, FormLayout, TextField, Button } from "@shopify/polaris";

export async function loader({ request }) {
  await authenticate.admin(request);
  return null;
}

export async function action({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    
    if (request.method !== "POST") {
      return { errors: {}, submitted: false };
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const inquiry = formData.get("inquiry");

    if (!title || !inquiry) {
      return { errors: { form: "Title and Inquiry are required" }, submitted: false };
    }

    await db.ticket.create({
      data: {
        title,
        inquiry,
        status: "pending",
        shopDomain: session.shop,
      },
    });
    
    const url = new URL(request.url);
    const search = url.search;
    return redirect(`/app${search}`);
  } catch (error) {
    
    if (error instanceof Response) throw error;

    console.error("Action error:", error);
    const message = error?.message ? error.message : String(error);
    return { errors: { form: message || "An error occurred" }, submitted: false };
  }
}

export default function CreateTicket() {
  const actionData = useActionData();
  const [title, setTitle] = useState("");
  const [inquiry, setInquiry] = useState("");

  const handleCancel = () => {
    const search = window.location.search || "";
    window.location.href = "/app" + search;
  };

  return (
    <Page
      title="Create New Ticket"
      breadcrumbs={[{ content: "Zendesk Ticket Generate", url: "/app" }]}
      primaryAction={{
        content: "Cancel",
        onAction: handleCancel,
        plain: true,
      }}
    >
      <Card>
        <form method="post">
          <FormLayout>
            {actionData?.errors?.form && (
              <div style={{ color: "#d82c0d", marginBottom: "16px", padding: "12px", backgroundColor: "#fff3f2", borderRadius: "4px" }}>
                <strong>Error:</strong> {actionData.errors.form}
              </div>
            )}
            <TextField
              label="Ticket Title"
              name="title"
              value={title}
              onChange={setTitle}
              type="text"
              placeholder="Enter ticket title"
              autoComplete="off"
              requiredIndicator
            />
            <TextField
              label="Inquiry"
              name="inquiry"
              value={inquiry}
              onChange={setInquiry}
              type="text"
              placeholder="Enter inquiry details"
              multiline={4}
              requiredIndicator
            />
            <Button submit variant="primary" size="large">
              Create Ticket
            </Button>
          </FormLayout>
        </form>
      </Card>
    </Page>
  );
}
