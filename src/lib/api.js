// Thin client for the backend endpoints defined in the spec (§5 / §7).
// Every function here should point at the real Express backend
// (see /server) once it's running — for now, calculate-distance
// falls back to a deterministic mock so the flow is fully clickable
// without a backend attached.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request to ${path} failed (${res.status})`);
  return res.json();
}

// POST /api/calculate-distance — { outlet_id, delivery_address, postcode }
export async function calculateDistance({ outletId, address, postcode }) {
  if (!BASE_URL) {
    // TODO(backend): remove this mock once VITE_API_BASE_URL points at
    // the real Express server, which calls the Google Maps Distance
    // Matrix API server-side (spec §8).
    return mockDistance(address);
  }
  return postJSON("/api/calculate-distance", {
    outlet_id: outletId,
    delivery_address: address,
    postcode,
  });
}

// POST /api/orders — creates the order record and a Razorpay order id
export async function createOrder(order) {
  if (!BASE_URL) {
    return {
      order_id: `GR${Math.floor(1000 + Math.random() * 9000)}`,
      razorpay_order_id: `order_mock_${Date.now()}`,
      amount: order.total_amount,
      status: "pending",
    };
  }
  return postJSON("/api/orders", order);
}

function mockDistance(address) {
  // Deterministic pseudo-distance from the address string so the UI
  // is exercised consistently during local development.
  const hash = Array.from(address || "").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const km = Math.round(((hash % 130) / 10 + 0.5) * 10) / 10; // 0.5–13.5 km
  return new Promise((resolve) => setTimeout(() => resolve({ distance_km: km }), 700));
}
