import fetch from "node-fetch";

const BASE_URL = process.env.API_URL || "http://localhost:3000";

// Fetch leads to find Santos
const leadsResponse = await fetch(`${BASE_URL}/api/trpc/admin.getAllLeads`);
const leadsData = await leadsResponse.json();

console.log("Searching for lead with name Santos...");

// Find lead with name Santos
const lead = leadsData.result?.data?.find(l => l.name?.includes("Santos"));

if (!lead) {
  console.error("No lead found with name containing 'Santos'");
  process.exit(1);
}

console.log(`Found lead: ${lead.name} (ID: ${lead.id})`);

// Get diagnostic result
const diagnosticResponse = await fetch(`${BASE_URL}/api/trpc/quiz.getResult?input={"leadId":"${lead.id}"}`);
const diagnosticData = await diagnosticResponse.json();

if (!diagnosticData.result?.data) {
  console.error("No diagnostic found for this lead");
  process.exit(1);
}

const diagnostic = diagnosticData.result.data;
console.log(`Found diagnostic: ${diagnostic.profileName}`);

// Send email via the webhook
console.log("Sending email...");

// Create a test payment to trigger email
const paymentResponse = await fetch(`${BASE_URL}/api/trpc/payment.createTestPayment`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    leadId: lead.id,
    email: "daiennyassistente@gmail.com",
    profileName: diagnostic.profileName,
  }),
});

const paymentData = await paymentResponse.json();
console.log("Payment created:", paymentData);
console.log("Email should be sent to daiennyassistente@gmail.com");
