import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

// Call the tRPC procedure to send email
const response = await fetch(`${BASE_URL}/api/trpc/quiz.sendDevotionalEmail`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    input: {
      leadId: 1620015,
      email: "daiennyassistente@gmail.com",
    },
  }),
});

const data = await response.json();
console.log("Response:", JSON.stringify(data, null, 2));

if (data.result?.data?.success) {
  console.log("✅ Email sent successfully!");
} else {
  console.log("❌ Failed to send email");
}
