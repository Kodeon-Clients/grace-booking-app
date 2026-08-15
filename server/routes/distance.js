import { Router } from "express";
import { OUTLETS } from "./outlets.js";

const router = Router();

const MAX_DELIVERY_KM = 10;
const GOOGLE_MAPS_API_KEY = "AIzaSyByQ6dmsSRqaNAFgOcm6EYAScEOd_0P7ug";

function deliveryChargeForDistance(km) {
  if (km > MAX_DELIVERY_KM) return null;
  if (km <= 2) return 200;
  if (km <= 5) return 400;
  return 600;
}

// POST /api/calculate-distance
// body: { outlet_id, delivery_address, postcode }
router.post("/", async (req, res) => {
  const { outlet_id, delivery_address, postcode } = req.body;

  if (!outlet_id || !delivery_address) {
    return res.status(400).json({ error: "outlet_id and delivery_address are required" });
  }

  const outlet = OUTLETS.find((o) => o.id === outlet_id);
  if (!outlet) {
    return res.status(400).json({ error: `Unknown outlet_id: ${outlet_id}` });
  }

  let distanceKm;
  try {
    distanceKm = GOOGLE_MAPS_API_KEY
      ? await distanceViaGoogleMaps(outlet, delivery_address, postcode)
      : mockDistance(delivery_address);
  } catch (err) {
    console.error("Distance calculation failed:", err.message);
    return res.status(502).json({ error: "Could not calculate distance for this address" });
  }

  const charge = deliveryChargeForDistance(distanceKm);
  if (charge == null) {
    return res.json({
      distance_km: distanceKm,
      delivery_slab: "beyond-range",
      delivery_charge: null,
      deliverable: false,
    });
  }

  res.json({
    distance_km: distanceKm,
    delivery_slab: distanceKm <= 2 ? "0-2 km" : distanceKm <= 5 ? "2-5 km" : "6-10 km",
    delivery_charge: charge,
    deliverable: true,
  });
});

// Calls the Google Maps Distance Matrix API (spec §8). Destination is the
// customer's typed address (with postcode appended, when given, to
// disambiguate). Origin is the outlet's full street address when we have
// one on file — letting Google geocode the exact building — falling back
// to its lat/lng only for outlets that don't have a confirmed address yet.
async function distanceViaGoogleMaps(outlet, address, postcode) {
  const destination = postcode ? `${address}, ${postcode}` : address;
  const origin = outlet.address || `${outlet.lat},${outlet.lng}`;
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("units", "metric");
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Maps API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "OK") {
    throw new Error(`Google Maps API status: ${data.status}`);
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    throw new Error(`Could not find a route to that address (${element?.status || "no result"})`);
  }

  return Math.round((element.distance.value / 1000) * 10) / 10; // meters -> km, 1dp
}

function mockDistance(address) {
  const hash = Array.from(address).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return Math.round(((hash % 130) / 10 + 0.5) * 10) / 10;
}

export default router;
