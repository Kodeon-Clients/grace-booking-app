export async function calculateDistance({
  latitude,
  longitude,
  outlet,
}) {
  // console.log("calculateDistance input:", {
  //   latitude,
  //   longitude,
  //   outlet,
  // });

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: Number(outlet.lat),
              longitude: Number(outlet.lng),
            },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        units: "METRIC",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Google Routes API request failed"
    );
  }

  const distanceMeters = data?.routes?.[0]?.distanceMeters;

  if (typeof distanceMeters !== "number") {
    throw new Error("Google Routes API did not return distanceMeters");
  }

  // 1. Convert meters to kilometers
  const distanceKm = distanceMeters / 1000;

  // 2. Return camelCase property matching StepParcelDetails.jsx
  return { distanceKm };
}