import { useBooking } from "../context/BookingContext";
import QuantityStepper from "./QuantityStepper";
import { takeawayTotal, formatRupees, getSadhyaPrice } from "../lib/pricing";
import StepAddons from "./StepAddons";

export default function StepTakeawayDetails() {
  const { booking, update, goNext, goBack, showAddons } = useBooking();

  const total = takeawayTotal(
    booking.date,
    booking.takeawayQuantity
  );

  const payasamTotal = (booking.payasamOption || []).reduce(
    (sum, payasam) => sum + payasam.price,
    0
  );

  const finalTotal = total + payasamTotal;

  const price = getSadhyaPrice(
    booking.date,
    booking.orderType
  );

  function handleContinue() {
    update({
      totalAmount: finalTotal,
    });

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

      <div style={{ display: "flex", gap: "16px" }}>
        <div className="field">
          <label className="field__label">How many Sadhya?</label>
          <QuantityStepper
            value={booking.takeawayQuantity}
            onChange={(v) => update({ takeawayQuantity: v })}
            unitLabel={`${formatRupees(price)} each`}
            disabled={booking.wantsOnlyPayasam}
          />
        </div>
        {showAddons && (
          <label className="payasam-checkbox">
            <input
              type="checkbox"
              checked={booking.wantsOnlyPayasam}
              onChange={(e) => {
                const checked = e.target.checked;

                update({
                  wantsOnlyPayasam: checked,
                  takeawayQuantity: checked
                    ? 0
                    : Math.max(1, booking.takeawayQuantity),
                });
              }}
            />

            <span>I want to buy only Payasam</span>
          </label>
        )}
      </div>
      {showAddons && (<StepAddons />)}

      {!showAddons && (
        <div className="summary">
          <div className="summary__row">
            <div>
              <span>{booking.takeawayQuantity} × {formatRupees(price)}</span>

              {(booking.payasamOption || []).map((payasam) => (
                <span key={payasam.name}>
                  {" + "}
                  {booking.takeawayQuantity} × {formatRupees(payasam.price)}
                </span>
              ))}
            </div>
            <span className="amount">{formatRupees(finalTotal)}</span>
          </div>
          <div className="summary__row is-total">
            <span>Total</span>
            <span className="amount">{formatRupees(finalTotal)}</span>
          </div>
          <p className="summary__note">No delivery charge — collect it yourself.</p>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleContinue}
        disabled={booking.wantsOnlyPayasam && !(booking.payasamOption || []).some((payasam) => payasam.quantity > 0)}
      >
        Continue
      </button>
    </div>
  );
}
