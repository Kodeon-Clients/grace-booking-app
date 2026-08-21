import { createContext, useContext, useMemo, useState } from "react";


const initialBooking = {
  date: null,        // e.g. "2026-08-24"
  outletId: null,
  orderType: null,   // "parcel" | "table" | "takeaway"

  // parcel
  quantity: 1,

  door: "",
  address: "",
  postcode: "",
  landmark: "",
  latitude: null,
  longitude: null,
  distanceKm: null,
  deliveryCharge: null,

  // table
  timeSlot: null,
  partySize: 1,

  // takeaway
  takeawayQuantity: 1,
  pickupWindow: null,

  //addons
  wantsOnlyPayasam: false,
  wantsAddOns: false,
  payasamOption: [],

  // customer
  name: "",
  phone: "",
  email: "",

  // result
  orderId: null,
  totalAmount: null,
};

function shouldShowAddons(booking) {
  return (
    booking.date === "2026-08-26" &&
    ["parcel", "takeaway"].includes(booking.orderType) &&
    ["grace-nerul", "grace-kharghar", "eternal-nerul"].includes(
      booking.outletId
    )
  );
}

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [booking, setBooking] = useState(initialBooking);

  const STEPS = [
    "date",
    "type",
    "outlet",
    "details",
    "customer",
    "confirmation",
  ];

  const showAddons = shouldShowAddons(booking);


  const api = useMemo(
    () => ({
      step: STEPS[stepIndex],
      stepIndex,
      totalSteps: STEPS.length - 1, // confirmation isn't part of the visible trail
      booking,
      showAddons,
      update(patch) {
        setBooking((prev) => ({ ...prev, ...patch }));
      },
      goNext() {
        setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
      },
      goBack() {
        setStepIndex((i) => Math.max(i - 1, 0));
      },
      goTo(stepName) {
        const idx = STEPS.indexOf(stepName);
        if (idx >= 0) setStepIndex(idx);
      },
      reset() {
        setBooking(initialBooking);
        setStepIndex(0);
      },
    }),
    [stepIndex, booking, showAddons]
  );

  return <BookingContext.Provider value={api}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
