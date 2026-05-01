import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => { document.title = "Privacy Policy — CleanManager Pro"; }, []);
  const T = { navy: "#0A1F44", gold: "#C9A84C", cream: "#FAF8F3", muted: "#6B6A7A" };
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.cream, minHeight: "100vh" }}>
      <div style={{ background: T.navy, padding: "24px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🦉</div>
          <h1 style={{ color: T.gold, margin: 0, fontSize: 24, fontWeight: 800 }}>CleanManager Pro</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontSize: 14 }}>Privacy Policy</p>
        </div>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 32 }}>Last updated: May 2026</p>

        {[
          { title: "1. Who We Are", body: "CleanManager Pro is operated by Blue Owl Cleaning Ltd, a company registered in England and Wales (Company No. 16415837), with registered address at 39 Darnley House, Camdenhurst Street, London, E14. We can be contacted at office@blueowlcleanings.co.uk." },
          { title: "2. What Data We Collect", body: "We collect the following personal data when you use CleanManager Pro: your name, email address, company name, phone number, and business address when you register; business data you enter into the platform including client details, job records, invoices, expenses and staff information; payment information processed securely by Stripe (we never store card details); and device information and usage data to improve the app." },
          { title: "3. How We Use Your Data", body: "We use your data to provide and improve the CleanManager Pro service; to process your subscription payments via Stripe; to send you important account notifications including welcome emails, invoice reminders and compliance alerts; to respond to your support requests; and to generate anonymised, aggregated industry benchmarks (CleanIndex) where no individual business can be identified." },
          { title: "4. Data Storage & Security", body: "Your data is stored securely on Supabase (PostgreSQL database) with encryption at rest and in transit using TLS. We use industry-standard security practices and conduct regular security reviews. Data is hosted on servers within the European Economic Area (EEA)." },
          { title: "5. Third-Party Services", body: "We use the following third-party services to operate CleanManager Pro: Stripe for payment processing (Privacy Policy: stripe.com/privacy); Supabase for database hosting (Privacy Policy: supabase.com/privacy); Resend for transactional email delivery; Upstash for caching and sequence management; Google Places API for business data discovery; and Vercel for application hosting. Each provider processes data in accordance with their own privacy policies and applicable data protection law." },
          { title: "6. Data Retention", body: "We retain your personal data for as long as your account is active. If you close your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes." },
          { title: "7. Your Rights (UK GDPR)", body: "Under UK GDPR, you have the right to: access the personal data we hold about you; correct any inaccurate personal data; request deletion of your personal data (right to erasure); restrict or object to processing of your personal data; data portability — receive your data in a structured, machine-readable format; and withdraw consent at any time where processing is based on consent. To exercise any of these rights, please email office@blueowlcleanings.co.uk. We will respond within 30 days." },
          { title: "8. Cookies", body: "CleanManager Pro uses essential cookies required for the app to function, including session management and authentication tokens. We do not use advertising or tracking cookies. You can control cookies through your browser settings, however disabling essential cookies may affect app functionality." },
          { title: "9. Children's Privacy", body: "CleanManager Pro is intended for use by businesses and is not directed at individuals under the age of 18. We do not knowingly collect personal data from children." },
          { title: "10. Changes to This Policy", body: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or through a notice in the app. Your continued use of CleanManager Pro after changes are posted constitutes your acceptance of the updated policy." },
          { title: "11. Contact & Complaints", body: "If you have any questions about this Privacy Policy or how we handle your data, please contact us at office@blueowlcleanings.co.uk or by post at Blue Owl Cleaning Ltd, 39 Darnley House, Camdenhurst Street, London, E14. If you are unhappy with how we have handled your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk." },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: 28 }}>
            <h2 style={{ color: T.navy, fontSize: 16, fontWeight: 800, marginBottom: 8, borderLeft: "3px solid " + T.gold, paddingLeft: 12 }}>{title}</h2>
            <p style={{ color: "#444", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{body}</p>
          </div>
        ))}

        <div style={{ background: T.navy, borderRadius: 14, padding: 20, marginTop: 40 }}>
          <div style={{ color: T.gold, fontWeight: 800, marginBottom: 4 }}>Blue Owl Cleaning Ltd</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.8 }}>
            Company No. 16415837<br/>
            39 Darnley House, Camdenhurst Street, London, E14<br/>
            office@blueowlcleanings.co.uk<br/>
            cleanmanager-pro.vercel.app
          </div>
        </div>
      </div>
    </div>
  );
}