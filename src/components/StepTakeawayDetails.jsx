import { useBooking } from "../context/BookingContext";
import QuantityStepper from "./QuantityStepper";
import { PICKUP_WINDOWS } from "../data/outlets";
import { takeawayTotal, formatRupees, getSadhyaPrice } from "../lib/pricing";

export default function StepTakeawayDetails() {
  const { booking, update, goNext, goBack } = useBooking();
  const total = takeawayTotal(
    booking.date,
    booking.takeawayQuantity
  );
  const price = getSadhyaPrice(booking.date, booking.orderType);

  function handleContinue() {
    update({ totalAmount: total });
    goNext();
  }

  return (
    <div className="step-card">
      <div className="back-nav">
        <button className="btn-ghost" onClick={goBack}>← Back</button>
      </div>
      <h2 className="choice-card__title" style={{ fontSize: 20, marginBottom: 16 }}>
        Takeaway — pickup from outlet
      </h2>

      <div className="field">
        <label className="field__label">How many Sadhya?</label>
        <QuantityStepper
          value={booking.takeawayQuantity}
          onChange={(v) => update({ takeawayQuantity: v })}
          unitLabel={`${formatRupees(price)} each`}
        />
      </div>

      <div className="summary">
        <div className="summary__row">
          <span>{booking.takeawayQuantity} × {formatRupees(price)}</span>
          <span className="amount">{formatRupees(total)}</span>
        </div>
        <div className="summary__row is-total">
          <span>Total</span>
          <span className="amount">{formatRupees(total)}</span>
        </div>
        <p className="summary__note">No delivery charge — collect it yourself.</p>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
}
