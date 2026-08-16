import { useEffect, useRef, useState } from "react";
import { useBooking } from "../context/BookingContext";
import { OUTLETS, EVENT_DATES } from "../data/outlets";
import { formatRupees } from "../lib/pricing";
import { insertItemToCMS } from "../lib/insertItemToCMS";

const TYPE_LABEL = {
  parcel: "Parcel delivery",
  table: "Table booking",
  takeaway: "Takeaway pickup",
};

const TYPE_NOTE = {
  parcel: "Grace's team will call you shortly to confirm your order and collect payment before delivery.",
  table: "Grace's team will call you shortly to confirm your table and collect payment.",
  takeaway: "Grace's team will call you shortly to confirm your order and collect payment before pickup.",
};

export default function StepConfirmation() {
  const { booking, reset } = useBooking();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasInserted = useRef(false);

  const outlet = OUTLETS.find(
    (o) => o.id === booking.outletId
  );

  const dateLabel = EVENT_DATES.find(
    (d) => d.id === booking.date
  )?.label;

  const detail =
    booking.orderType === "parcel"
      ? `${booking.quantity} × Sadhya to ${booking.address}`
      : booking.orderType === "table"
        ? `${booking.partySize} people · ${booking.timeSlot}`
        : `${booking.takeawayQuantity} × Sadhya · ${booking.pickupWindow}`;

  useEffect(() => {
    if (hasInserted.current) return;

    hasInserted.current = true;

    async function saveBooking() {
      try {
        setLoading(true);
        setError(null);

        const cmsBooking = {
          ...booking,

          quantity:booking.orderType === "parcel"? booking.quantity: 0,
          partySize:booking.orderType === "table"? booking.partySize: 0,
          takeawayQuantity:booking.orderType === "takeaway"? booking.takeawayQuantity: 0,
        };

        const result = await insertItemToCMS(cmsBooking);

        setLoading(false);
      } catch (error) {
        console.error("CMS insert failed:", error);

        setError("We couldn't save your booking. Please try again.");
        setLoading(false);

        hasInserted.current = false;
      }
    }

    saveBooking();
  }, [booking]);

  // Loading screen
  if (loading) {
    return (
      <div className="step-card">
        <div className="ticket" style={{ textAlign: "center" }}>
          <div className="ticket__check" aria-hidden>
            ⏳
          </div>

          <div className="ticket__title">
            Confirming your booking...
          </div>

          <p className="field__hint">
            Please wait while we save your booking.
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="step-card">
        <div className="ticket" style={{ textAlign: "center" }}>
          <div className="ticket__title">
            Booking could not be saved
          </div>

          <p className="field__hint">
            {error}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  // Confirmation screen
  return (
    <div className="step-card">
      <div className="ticket">

        <div className="ticket__check" aria-hidden>
          ✓
        </div>

        <div className="ticket__id">
          Order {booking.orderId}
        </div>

        <div className="ticket__title">
          Booking received
        </div>

        <div className="ticket__row">
          <span>Outlet</span>
          <span>{outlet?.name}</span>
        </div>

        <div className="ticket__row">
          <span>Date</span>
          <span>{dateLabel}</span>
        </div>

        <div className="ticket__row">
          <span>Order type</span>
          <span>
            {TYPE_LABEL[booking.orderType]}
          </span>
        </div>

        <div className="ticket__row">
          <span>Details</span>
          <span>{detail}</span>
        </div>

        <div className="ticket__row">
          <span>Amount due</span>
          <span>
            {formatRupees(booking.totalAmount || 0)}
          </span>
        </div>

        <p
          className="field__hint"
          style={{
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {TYPE_NOTE[booking.orderType]}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 20 }}
        onClick={reset}
      >
        Start a new booking
      </button>
    </div>
  );
}