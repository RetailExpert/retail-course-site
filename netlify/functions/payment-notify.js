const https = require("https");
const querystring = require("querystring");

const MERCHANT_ID = "21873692";
const YOUR_EMAIL  = "masteringretail@gmail.com";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = querystring.parse(event.body || "");

  if (data.merchant_id !== MERCHANT_ID) {
    console.error("Merchant ID mismatch");
    return { statusCode: 400, body: "Invalid merchant" };
  }

  const isValid = await verifyWithPayFast(event.body);
  if (!isValid) {
    console.error("PayFast validation failed");
    return { statusCode: 400, body: "Validation failed" };
  }

  const status    = data.payment_status;
  const name      = `${data.name_first || ""} ${data.name_last || ""}`.trim();
  const email     = data.email_address || "unknown";
  const amount    = data.amount_gross || "0.00";
  const paymentId = data.pf_payment_id || "N/A";
  const itemName  = data.item_name || "Course";

  console.log(`Payment ${status} | ${name} | ${email} | R${amount} | ID:${paymentId}`);

  if (status === "COMPLETE") {
    await sendEmailNotification({ name, email, amount, paymentId, itemName });
  }

  return { statusCode: 200, body: "OK" };
};

function verifyWithPayFast(rawBody) {
  return new Promise((resolve) => {
    const options = {
      hostname: "www.payfast.co.za",
      port: 443,
      path: "/eng/query/validate",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(rawBody),
      },
    };

    let response = "";
    const req = https.request(options, (res) => {
      res.on("data", (chunk) => { response += chunk; });
      res.on("end", () => {
        resolve(response.trim().toUpperCase() === "VALID");
      });
    });

    req.on("error", (e) => {
      console.error("PayFast verify error:", e);
      resolve(false);
    });

    req.write(rawBody);
    req.end();
  });
}

async function sendEmailNotification({ name, email, amount, paymentId, itemName }) {
  const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT || "";

  if (!FORMSPREE_ENDPOINT) {
    console.log("=== PAYMENT RECEIVED ===");
    console.log(`Name:       ${name}`);
    console.log(`Email:      ${email}`);
    console.log(`Amount:     R${amount}`);
    console.log(`Payment ID: ${paymentId}`);
    console.log(`Item:       ${itemName}`);
    console.log("========================");
    return;
  }

  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        subject: `✅ New Payment — ${name} paid R${amount}`,
        name,
        email,
        amount: `R${amount}`,
        payment_id: paymentId,
        item: itemName,
        course_link: "https://retailexpert.xyz/course.html",
      }),
    });
    console.log(`Email notification sent for payment ${paymentId}`);
  } catch (err) {
    console.error("Email send failed:", err);
  }
}