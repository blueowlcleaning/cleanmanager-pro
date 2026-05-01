export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  try {
    // Get all unpaid invoices with their business and client info
    const r = await fetch(`${SUPABASE_URL}/rest/v1/invoices?status=eq.Unpaid&select=*`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const invoices = await r.json();

    let sent = 0;
    let skipped = 0;
    const now = new Date();

    for (const invoice of invoices) {
      if (!invoice.due_date || !invoice.client_email) { skipped++; continue; }

      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

      // Only send at Day 7, 14, 21 overdue
      if (![7, 14, 21].includes(daysOverdue)) { skipped++; continue; }

      // Check if reminder already sent today for this invoice
      const lastReminder = invoice.last_reminder_sent ? new Date(invoice.last_reminder_sent) : null;
      if (lastReminder) {
        const hoursSince = (now - lastReminder) / (1000 * 60 * 60);
        if (hoursSince < 23) { skipped++; continue; }
      }

      const bizName = invoice.business_name || "CleanManager Pro";
      const clientName = invoice.client_name || "Valued Client";
      const amount = invoice.amount || 0;
      const invoiceRef = invoice.invoice_number || invoice.id?.slice(0, 8).toUpperCase();

      const tones = {
        7: { subject: `Friendly Reminder — Invoice ${invoiceRef} from ${bizName}`, tone: "friendly" },
        14: { subject: `Invoice ${invoiceRef} — Payment Now Due | ${bizName}`, tone: "firm" },
        21: { subject: `FINAL NOTICE — Invoice ${invoiceRef} | ${bizName}`, tone: "final" }
      };

      const { subject, tone } = tones[daysOverdue];

      const bodies = {
        friendly: `Dear ${clientName},

I hope this message finds you well.

This is a friendly reminder that invoice ${invoiceRef} for £${amount} issued by ${bizName} was due on ${new Date(invoice.due_date).toLocaleDateString("en-GB")} and remains outstanding.

If you have already arranged payment, please disregard this message. If you have any questions, please do not hesitate to get in touch.

Kind regards,
${bizName}`,
        firm: `Dear ${clientName},

This is a follow-up regarding invoice ${invoiceRef} for £${amount} which was due on ${new Date(invoice.due_date).toLocaleDateString("en-GB")}.

The invoice is now 14 days overdue. We kindly request that payment is made as soon as possible to avoid any disruption to services.

If there is an issue with the invoice or payment, please contact us immediately so we can resolve it.

Kind regards,
${bizName}`,
        final: `Dear ${clientName},

This is a FINAL NOTICE regarding invoice ${invoiceRef} for £${amount} which was due on ${new Date(invoice.due_date).toLocaleDateString("en-GB")}.

The invoice is now 21 days overdue. If payment is not received within 7 days, we may need to take further action to recover the outstanding amount.

Please make payment immediately or contact us to discuss payment arrangements.

Kind regards,
${bizName}`
      };

      // Send reminder email
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `${bizName} <ola@blueowlcleanings.com>`,
          to: [invoice.client_email],
          subject,
          text: bodies[tone]
        })
      });

      if (emailRes.ok) {
        // Update last_reminder_sent on invoice
        await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoice.id}`, {
          method: "PATCH",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({ last_reminder_sent: now.toISOString() })
        });
        sent++;
      }
    }

    return res.status(200).json({ success: true, sent, skipped });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}