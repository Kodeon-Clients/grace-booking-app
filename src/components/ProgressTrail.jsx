import { useBooking } from "../context/BookingContext";

const LABELS = ["Date", "Outlet", "Order", "Details", "Your info"];

export default function ProgressTrail() {
  const { stepIndex, totalSteps } = useBooking();
  const { booking } = useBooking();

  const showAddons =
    booking.date === "2026-08-26" &&
    ["parcel", "takeaway"].includes(booking.orderType) &&
    ["grace-nerul", "grace-kharghar", "eternal-nerul"].includes(booking.outletId);

  const COUNT = showAddons ? 6 : 5;
  console.log(booking.orderType, booking.outletId);

  if (stepIndex >= totalSteps + 1) return null; // hide on confirmation

  return (
    <div className="trail" aria-label="Booking progress">
      {Array.from({ length: COUNT }).map((label, i) => (
        <div
          key={i}
          className={`trail__fold ${i < stepIndex ? "is-done" : i === stepIndex ? "is-active" : ""
            }`}
          role="img"
          aria-label={`${i}${i <= stepIndex ? " (complete)" : ""}`}
        />
      ))}
    </div>
  );
}
