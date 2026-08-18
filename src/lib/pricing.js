export const PRICES = {
  "2026-08-25": {
    table: 700,
    takeaway: 775,
    parcel: 775,
  },
  "2026-08-26": {
    table: 800,
    takeaway: 875,
    parcel: 875,
  },
};

export const MAX_DELIVERY_KM = 100;
export const MAX_TABLE_PARTY_SIZE = 35;
export const TAKEAWAY_WINDOW_CAP = 15;
export const TABLE_SLOT_CAPACITY = 33;
export const DAILY_ORDER_CAP = 800;

export function getSadhyaPrice(date, orderType) {
  return PRICES[date]?.[orderType] ?? 0;
}

export function deliveryChargeForDistance(km) {
  if (km == null || km < 0 || km > MAX_DELIVERY_KM) return null;

  if (km <= 3) return 100;

  return 100 + Math.ceil((km - 3) / 3) * 30;
}

export function tableTotal(date, partySize) {
  return partySize * getSadhyaPrice(date, "table");
}

export function takeawayTotal(date, quantity) {
  return quantity * getSadhyaPrice(date, "takeaway");
}

export function parcelTotal(date, quantity, deliveryCharge) {
  return (
    quantity * getSadhyaPrice(date, "parcel") +
    (deliveryCharge || 0)
  );
}

export function deliverySlabLabel(km) {
  if (km == null || km < 0) return "";

  if (km > MAX_DELIVERY_KM) return "Beyond delivery range";

  if (km <= 3) return "1–3 km";

  const slabStart = Math.floor((km - 1) / 3) * 3 + 1;
  const slabEnd = slabStart + 2;

  return `${slabStart}–${slabEnd} km`;
}

export function formatRupees(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function bookingTotal(booking) {
  const price = getSadhyaPrice(
    booking.date,
    booking.orderType
  );

  const quantity =
    booking.orderType === "table"
      ? booking.partySize
      : booking.orderType === "takeaway"
        ? booking.takeawayQuantity
        : booking.quantity;

  const delivery =
    booking.orderType === "parcel"
      ? booking.deliveryCharge || 0
      : 0;

  return quantity * price + delivery;
}