export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sector } = req.body;

  const templates = {
    "Restaurant": {
      subject: "Professional Cleaning Services for Your Restaurant",
      intro: "Running a busy restaurant means maintaining the highest hygiene standards — not just for inspections, but for your reputation.",
      specific: "We specialise in deep kitchen cleans, extraction systems, front-of-house maintenance, and end-of-service cleans tailored around your opening hours."
    },
    "Hospital": {
      subject: "Specialist Healthcare Cleaning Services",
      intro: "In a healthcare environment, cleaning is not just about appearance — it's about patient safety, infection control, and regulatory compliance.",
      specific: "Blue Owl Cleaning Ltd provides specialist clinical cleaning services including ward cleans, common area maintenance, and deep sanitisation protocols aligned with NHS standards."
    },
    "Care Home": {
      subject: "Trusted Cleaning Services for Care Homes",
      intro: "Residents in care homes deserve a clean, safe, and welcoming environment — and your team deserves a reliable cleaning partner they can count on.",
      specific: "We provide regular and deep cleaning services for care homes across London, with trained staff who understand the sensitivity and dignity required in these environments."
    },
    "Office": {
      subject: "Reliable Office Cleaning Services for Your Team",
      intro: "A clean, well-maintained office creates a professional first impression and keeps your team productive and comfortable.",
      specific: "Blue Owl Cleaning Ltd offers flexible daily, weekly, and one-off office cleaning services — working around your schedule, including early mornings and evenings."
    },
    "Warehouse": {
      subject: "Industrial & Warehouse Cleaning Services",
      intro: "A clean warehouse is a safe warehouse — reducing accidents, maintaining compliance, and keeping operations running smoothly.",
      specific: "We provide scheduled industrial cleans, floor scrubbing, high-level dusting, and waste management support for warehouses and logistics facilities across London."
    },
    "Cafe": {
      subject: "Professional Cleaning for Your Café",
      intro: "Your café's cleanliness is the first thing customers notice — and the last thing you want to worry about after a long day of service.",
      specific: "We offer flexible cleaning schedules for cafés including daily cleans, deep kitchen cleans, and equipment sanitisation — all fitted around your trading hours."
    },
    "Corporate": {
      subject: "Commercial Cleaning Solutions for Your Organisation",
      intro: "Large corporate environments demand consistent, high-standard cleaning that protects your brand, your people, and your compliance obligations.",
      specific: "Blue Owl Cleaning Ltd works with corporate clients across London delivering tailored cleaning programmes — from daily office maintenance to specialist deep cleans and post-event cleaning."
    },
    "Supermarket": {
      subject: "Retail & Supermarket Cleaning Services",
      intro: "Shoppers notice cleanliness immediately — and a well-maintained store builds trust, increases dwell time, and protects your brand standards.",
      specific: "We provide daily retail cleaning, floor maintenance, deep cleans, and out-of-hours services for supermarkets and retail outlets across London."
    },
    "Bank": {
      subject: "Professional Cleaning Services for Financial Premises",
      intro: "Banks and financial institutions require immaculate, secure, and discreet cleaning — your environment reflects the trust your clients place in you.",
      specific: "We provide out-of-hours cleaning for banking halls, offices, and customer-facing areas, with fully vetted staff and complete confidentiality."
    },
    "Event Hall": {
      subject: "Pre & Post-Event Cleaning Services",
      intro: "Every event deserves a spotless venue — before guests arrive and after they leave.",
      specific: "Blue Owl Cleaning Ltd provides rapid pre-event preparation cleans and thorough post-event deep cleans for halls, venues, and function spaces across London."
    },
    "Residential": {
      subject: "Professional Residential Cleaning Services",
      intro: "Your home deserves the same standard of care and attention as any professional environment.",
      specific: "We offer regular domestic cleaning, end-of-tenancy cleans, deep cleans, and one-off services — all carried out by trained, insured, and reliable operatives."
    },
    "default": {
      subject: "Professional Cleaning Services — Blue Owl Cleaning Ltd",
      intro: "Maintaining a clean, safe, and presentable environment is essential for any professional operation — and finding a reliable cleaning partner makes all the difference.",
      specific: "Blue Owl Cleaning Ltd provides tailored commercial and residential cleaning services across London, with flexible scheduling, trained operatives, and a commitment to consistently high standards."
    }
  };

  const t = templates[sector] || templates["default"];

  const email = `Dear Facilities / Operations Manager,

${t.intro}

${t.specific}

We'd love to arrange a free site visit and provide a no-obligation quote tailored to your needs.

We are fully insured, London-based, and pride ourselves on reliability, discretion, and attention to detail.

Kind regards,

Ola Aina
Director — Blue Owl Cleaning Ltd
📞 07472 539 762
📧 ola@blueowlcleanings.com
📧 office@blueowlcleanings.co.uk
🌐 www.blueowlcleanings.com`;

  res.status(200).json({ text: email, subject: t.subject });
}
