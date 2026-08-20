import { useBooking } from "../context/BookingContext";
import { OUTLETS, EVENT_DATES } from "../data/outlets";

export default function StepOutlet() {
  const { booking, update, goNext, goBack } = useBooking();

  // Find selected date
  const selectedDate = EVENT_DATES.find(
    (d) => d.id === booking.date
  );

  // Get outlet IDs available for selected date + order type
  const availableOutletIds =
    selectedDate?.outlets?.[booking.orderType] || [];

  // Convert outlet IDs into actual outlet objects
  const availableOutlets = OUTLETS.filter((outlet) =>
    availableOutletIds.includes(outlet.id)
  );

  function choose(outletId) {
    const outletChanged = booking.outletId !== outletId;

    update({
      outletId,
      ...(outletChanged && {
        address: "",
        postcode: "",
        landmark: "",
        latitude: null,
        longitude: null,
        distanceKm: null,
        deliveryCharge: null,
      }),
    });

    goNext();
  }

  return (
    <div className="step-card">
      <div className="back-nav">
        <button className="btn-ghost" onClick={goBack}>
          ← Back
        </button>
      </div>

      <h2
        className="choice-card__title"
        style={{ fontSize: 20, marginBottom: 4 }}
      >
        Which outlet, for {selectedDate?.label}?
      </h2>

      <p className="field__hint" style={{ marginBottom: 18 }}>
        Same Sadhya, same menu at every outlet.
      </p>

      <div className="choice-grid">
        {availableOutlets.map((o) => (
          <button
            key={o.id}
            className={`choice-card ${booking.outletId === o.id ? "is-selected" : ""
              }`}
            onClick={() => choose(o.id)}
          >
            <div>
              <div className="choice-card__title">
                {o.name}
              </div>

              <div className="choice-card__meta">
                {o.area}
              </div>
            </div>

            <span className="choice-card__glyph" aria-hidden>
              📍
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}