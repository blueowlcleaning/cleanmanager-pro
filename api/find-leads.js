export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { sector } = req.body || {};

  const sectorQueries = {
    Restaurant: "restaurants in London",
    Hospital: "hospitals in London",
    "Care Home": "care homes in London",
    Office: "offices in London",
    Warehouse: "warehouses in London",
    Cafe: "cafes in London",
    Corporate: "corporate offices in London",
    Supermarket: "supermarkets in London",
    Bank: "banks in London",
    "Event Hall": "event halls in London",
    Residential: "residential property management London",
    Hotels: "hotels in London",
    Pubs: "pubs in London",
    Cinemas: "cinemas in London",
    "Event Centres": "event centres venues in London",
    Stadiums: "stadiums arenas in London",
    Schools: "schools in London",
    Universities: "universities in London",
    Gyms: "gyms fitness centres in London",
    "Shopping Centres": "shopping centres malls in London",
    "Law Firms": "law firms in London",
    "Accounting Firms": "accounting firms in London"
  };

  const query = sectorQueries[sector] || "businesses in London";
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.businessStatus"
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 20,
          locationBias: {
            circle: {
              center: { latitude: 51.5074, longitude: -0.1278 },
              radius: 15000
            }
          }
        })
      }
    );

    const data = await response.json();
    const places = data.places || [];

    const leads = places
      .filter(p => p.businessStatus === "OPERATIONAL")
      .map(p => ({
        name: p.displayName?.text || "Unknown",
        address: p.formattedAddress || "",
        website: p.websiteUri || "",
        phone: p.internationalPhoneNumber || "",
        sector: sector
      }));

    res.status(200).json({ leads, total: leads.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
