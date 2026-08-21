import { useBooking } from "../context/BookingContext";
import QuantityStepper from "./QuantityStepper";
import { takeawayTotal, formatRupees, getSadhyaPrice } from "../lib/pricing";
import StepAddons from "./StepAddons";

export default function StepTakeawayDetails() {
  const { booking, update, goNext, goBack, showAddons } = useBooking();

  const total = booking.wantsOnlyPayasam
    ? 0
    : takeawayTotal(
      booking.date,
      booking.takeawayQuantity
    );

  const payasamTotal = (booking.payasamOption || []).reduce(
    (sum, payasam) => sum + payasam.price,
    0
  );
  const price = getSadhyaPrice(booking.date, booking.orderType);

  const finalTotal = total + payasamTotal;

  function handleContinue() {
    const total = booking.wantsOnlyPayasam
      ? 0
      : takeawayTotal(
        booking.date,
        booking.takeawayQuantity
      );

    const payasamTotal = (booking.payasamOption || []).reduce(
      (sum, payasam) => sum + payasam.price * (payasam.quantity || 1),
      0
    );

    const finalTotal = total + payasamTotal;

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

      <div>
        <p className="choice-card__title">Sadhya</p>
        <div className="choice-card ">
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <img
              src="/sadhya.png"
              alt=""
              style={{
                width: 56,
                height: 56,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                className="choice-card__title"
                style={{
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                Sadhya
              </div>

              <div className="choice-card__meta">
                {formatRupees(price)} each
              </div>
            </div>
          </div>
          <QuantityStepper
            value={booking.takeawayQuantity}
            onChange={(v) => update({ takeawayQuantity: v })}
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
                  totalAmount: checked
                    ? 0
                    : booking.totalAmount,
                });
              }}
            />

            <span>I want to buy only Payasam</span>
          </label>
        )}
      </div>
      {showAddons && (<StepAddons />)}

      {!showAddons && (
        <div className="summary" style={{ marginTop: "16px" }}>
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
