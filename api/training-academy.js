export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, topic } = req.body || {};

  if (action === "get_materials") {
    const materials = {
      "COSHH": {
        description: "Control of Substances Hazardous to Health — mandatory for all cleaning staff",
        keyPoints: ["Always read product labels before use", "Wear appropriate PPE for each chemical", "Store chemicals in original containers", "Never mix chemicals", "Know emergency procedures for spills", "Complete COSHH assessment for each substance"],
        videos: [
          { title: "COSHH Explained for Cleaners", url: "https://www.youtube.com/results?search_query=COSHH+training+cleaning", duration: "8 min" },
          { title: "Chemical Safety in the Workplace", url: "https://www.youtube.com/results?search_query=chemical+safety+workplace+cleaning", duration: "12 min" },
        ],
        resources: [
          { title: "HSE COSHH Guidance", url: "https://www.hse.gov.uk/coshh/", type: "Official Guide" },
          { title: "COSHH Assessment Template", url: "https://www.hse.gov.uk/coshh/", type: "Template" },
        ]
      },
      "Manual Handling": {
        description: "Safe lifting and carrying to prevent injury — required annually",
        keyPoints: ["Assess the load before lifting", "Keep back straight and bend knees", "Hold load close to body", "Avoid twisting while carrying", "Use equipment where possible", "Team lift for heavy items"],
        videos: [
          { title: "Manual Handling Training for Cleaners", url: "https://www.youtube.com/results?search_query=manual+handling+training+cleaning", duration: "10 min" },
          { title: "Safe Lifting Techniques", url: "https://www.youtube.com/results?search_query=safe+lifting+techniques+workplace", duration: "6 min" },
        ],
        resources: [
          { title: "HSE Manual Handling Guide", url: "https://www.hse.gov.uk/pubns/indg143.pdf", type: "PDF Guide" },
        ]
      },
      "Fire Safety": {
        description: "Fire awareness and evacuation procedures — required annually",
        keyPoints: ["Know fire escape routes", "Locate fire extinguishers and alarms", "Never prop fire doors open", "Report fire hazards immediately", "Know assembly point location", "Do not use lifts during evacuation"],
        videos: [
          { title: "Fire Safety Training", url: "https://www.youtube.com/results?search_query=fire+safety+training+workplace", duration: "15 min" },
          { title: "Using Fire Extinguishers", url: "https://www.youtube.com/results?search_query=fire+extinguisher+training", duration: "5 min" },
        ],
        resources: [
          { title: "Fire Safety in the Workplace", url: "https://www.gov.uk/workplace-fire-safety-your-responsibilities", type: "Official Guide" },
        ]
      },
      "Infection Control": {
        description: "Infection control and hygiene standards — critical for all cleaning operatives",
        keyPoints: ["Wash hands for 20 seconds minimum", "Use correct PPE for each task", "Colour coding system prevents cross contamination", "Dispose of waste safely", "Clean from high to low, clean to dirty", "Report any symptoms immediately"],
        videos: [
          { title: "Infection Control for Cleaners", url: "https://www.youtube.com/results?search_query=infection+control+cleaning+training", duration: "12 min" },
          { title: "Hand Hygiene Training", url: "https://www.youtube.com/results?search_query=hand+hygiene+training+NHS", duration: "8 min" },
        ],
        resources: [
          { title: "NHS Infection Control Guidelines", url: "https://www.england.nhs.uk/wp-content/uploads/2022/04/national-infection-prevention-and-control.pdf", type: "PDF Guide" },
        ]
      },
      "Health & Safety Induction": {
        description: "General workplace health and safety — required for all new starters",
        keyPoints: ["Report all accidents and near misses", "Use equipment only if trained", "Keep walkways clear", "Report damaged equipment", "Know first aid contacts", "Follow risk assessments"],
        videos: [
          { title: "Health and Safety Induction Training", url: "https://www.youtube.com/results?search_query=health+safety+induction+training", duration: "20 min" },
        ],
        resources: [
          { title: "HSE New Worker Guide", url: "https://www.hse.gov.uk/workers/index.htm", type: "Official Guide" },
        ]
      },
      "PPE Usage": {
        description: "Personal protective equipment — mandatory before handling chemicals or equipment",
        keyPoints: ["Select correct PPE for each task", "Check PPE before use for damage", "Wear gloves, apron, goggles as required", "Dispose of single-use PPE safely", "Store PPE correctly after use", "Report damaged PPE immediately"],
        videos: [
          { title: "PPE Training for Cleaning Staff", url: "https://www.youtube.com/results?search_query=PPE+training+cleaning+staff", duration: "9 min" },
        ],
        resources: [
          { title: "HSE PPE at Work Guide", url: "https://www.hse.gov.uk/pubns/indg174.pdf", type: "PDF Guide" },
        ]
      },
      "GDPR & Confidentiality": {
        description: "Data protection and client confidentiality — required for all staff",
        keyPoints: ["Never share client information", "Do not photograph client premises without permission", "Report data breaches immediately", "Access only data needed for your role", "Lock screens when unattended", "Dispose of documents securely"],
        videos: [
          { title: "GDPR Training for Staff", url: "https://www.youtube.com/results?search_query=GDPR+training+staff+UK", duration: "15 min" },
        ],
        resources: [
          { title: "ICO GDPR Guide for Workers", url: "https://ico.org.uk/for-organisations/guide-to-data-protection/", type: "Official Guide" },
        ]
      },
      "First Aid Awareness": {
        description: "Basic first aid awareness — renews every 3 years",
        keyPoints: ["Call 999 for life-threatening emergencies", "Know location of first aid kit", "Do not move injured person unless in danger", "Apply pressure to bleeding wounds", "Recovery position for unconscious person", "Document all first aid given"],
        videos: [
          { title: "First Aid Awareness Training", url: "https://www.youtube.com/results?search_query=first+aid+awareness+training+UK", duration: "20 min" },
        ],
        resources: [
          { title: "Red Cross First Aid Guide", url: "https://www.redcross.org.uk/first-aid", type: "Official Guide" },
        ]
      }
    };
    return res.status(200).json({ materials });
  }

  if (action === "get_courses") {
    const courses = [
      {
        provider: "Highfield Qualifications",
        title: "Level 2 Award in Cleaning Principles",
        type: "Accredited",
        location: "Various UK locations",
        format: "Face-to-face",
        duration: "1 day",
        price: "£120-£180",
        url: "https://www.highfieldqualifications.com",
        accreditation: "Ofqual regulated",
        suitable: "All cleaning staff"
      },
      {
        provider: "BICS (British Institute of Cleaning Science)",
        title: "BICS Professional Cleaning Operator",
        type: "Industry Accredited",
        location: "London & nationwide",
        format: "Face-to-face + online",
        duration: "2 days",
        price: "£195-£250",
        url: "https://www.bics.org.uk",
        accreditation: "BICS accredited",
        suitable: "All cleaning staff"
      },
      {
        provider: "Trained Up",
        title: "COSHH Awareness for Cleaning Operatives",
        type: "Specialist",
        location: "Online + London venues",
        format: "Online or face-to-face",
        duration: "Half day",
        price: "£65-£95",
        url: "https://www.trainedupacademy.com",
        accreditation: "CPD certified",
        suitable: "All cleaning staff"
      },
      {
        provider: "Direct Learning",
        title: "Manual Handling for Cleaning Staff",
        type: "Essential",
        location: "East London / City",
        format: "Face-to-face",
        duration: "Half day",
        price: "£45-£75",
        url: "https://www.directlearning.co.uk",
        accreditation: "CPD certified",
        suitable: "All staff"
      },
      {
        provider: "City & Guilds",
        title: "Level 1 Award in Cleaning and Support Services Skills",
        type: "Nationally Recognised",
        location: "Colleges nationwide",
        format: "Face-to-face",
        duration: "2-4 weeks",
        price: "Funded options available",
        url: "https://www.cityandguilds.com",
        accreditation: "City & Guilds",
        suitable: "Entry level cleaners"
      },
      {
        provider: "Skills for Care",
        title: "Infection Prevention and Control",
        type: "Specialist",
        location: "Online",
        format: "Online self-paced",
        duration: "3 hours",
        price: "£25-£40",
        url: "https://www.skillsforcare.org.uk",
        accreditation: "CPD certified",
        suitable: "Healthcare cleaning staff"
      },
      {
        provider: "St John Ambulance",
        title: "First Aid at Work (3-day)",
        type: "Regulated",
        location: "London venues",
        format: "Face-to-face",
        duration: "3 days",
        price: "£250-£350",
        url: "https://www.sja.org.uk",
        accreditation: "HSE approved",
        suitable: "First aiders"
      },
      {
        provider: "NCFE",
        title: "Level 2 Certificate in Infection Prevention and Control",
        type: "Accredited",
        location: "Online + supported learning",
        format: "Blended learning",
        duration: "6-8 weeks",
        price: "£150-£200",
        url: "https://www.ncfe.org.uk",
        accreditation: "Ofqual regulated",
        suitable: "Healthcare / care home cleaners"
      }
    ];
    return res.status(200).json({ courses });
  }

  return res.status(400).json({ error: "Unknown action" });
}