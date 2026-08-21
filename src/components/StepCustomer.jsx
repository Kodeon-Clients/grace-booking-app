import { useState } from "react";
import { useBooking } from "../context/BookingContext";
import { OUTLETS, EVENT_DATES } from "../data/outlets";
import {
  MAX_DELIVERY_KM,
  deliveryChargeForDistance,
  deliverySlabLabel,
  formatRupees,
  getSadhyaPrice,
  bookingTotal,
} from "../lib/pricing";
import { createOrder } from "../lib/api";
import { isRazorpayConfigured, openRazorpayCheckout } from "../lib/razorpay";
import GoogleAddressSearch from "./GoogleAddressSearch";
import { calculateDistance } from "../lib/calculateDistance";

const TYPE_LABEL = { parcel: "Delivery", table: "Table", takeaway: "Takeaway" };

export default function StepCustomer() {
  const { booking, update, goNext, goBack, showAddons } = useBooking();
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  const outlet = OUTLETS.find((o) => o.id === booking.outletId);
  const dateLabel = EVENT_DATES.find((d) => d.id === booking.date)?.label;

  function validate() {
    const phone = booking.phone.replace(/\D/g, "");

    if (!booking.name.trim()) return "Please enter your name.";
    if (!/^\d{10}$/.test(phone)) {
      return "Please enter a valid 10-digit phone number.";
    }
    if (!booking.email?.trim()) {
      return "Email is required.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (booking.orderType === "parcel" && !booking.door?.trim()) {
      return "Please enter your door/flat number.";
    }

    if (booking.orderType === "parcel" && !booking.address?.trim()) {
      return "Please enter your delivery address.";
    }

    if (booking.orderType === "parcel" && !/^\d{6}$/.test(booking.postcode?.trim() || "")) {
      return "Please enter a valid 6-digit postcode.";
    }

    if (booking.orderType === "parcel" && (booking.latitude == null || booking.longitude == null)) {
      return "Please search for your address first.";
    }

    if (booking.orderType === "parcel" && booking.distanceKm == null) {
      return "Please calculate your delivery charge before continuing.";
    }

    if (outOfRange) {
      return `Sorry, we don't deliver beyond ${MAX_DELIVERY_KM} km.`;
    }


    return null;
  }

  async function handlePay() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setPaying(false);

    try {
      const result = await createOrder({
        date: booking.date,
        outlet_id: booking.outletId,
        order_type: booking.orderType,
        quantity: booking.orderType === "parcel" ? booking.quantity : booking.takeawayQuantity,
        party_size: booking.orderType === "table" ? booking.partySize : undefined,
        time_slot: booking.orderType === "table" ? booking.timeSlot : booking.pickupWindow,
        delivery_address: booking.orderType === "parcel" ? booking.address : undefined,
        distance_km: booking.orderType === "parcel" ? booking.distanceKm : undefined,
        total_amount: booking.totalAmount,
        customer_name: booking.name,
        customer_phone: booking.phone,
        customer_email: booking.email,
      });


      if (isRazorpayConfigured()) {
        // Opens the Razorpay checkout widget (spec §7). The webhook
        // (server/routes/payment.js) is the source of truth for marking
        // the order "paid" — this just moves the customer on to the
        // confirmation screen once they've completed payment.
        await openRazorpayCheckout({
          razorpayOrderId: result.razorpay_order_id,
          amount: result.amount,
          customer: { name: booking.name, phone: booking.phone, email: booking.email },
          description: `${TYPE_LABEL[booking.orderType]} — Onam Sadhya`,
        });
      }

      update({ orderId: result.order_id });
      goNext();
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {

    }
  }

  const detail = booking.orderType === "parcel" ? booking.quantity > 0 ? `${booking.quantity} × Sadhya` : "" : booking.orderType === "table" ? `${booking.partySize} people` : booking.takeawayQuantity > 0 ? `${booking.takeawayQuantity} × Sadhya` : "";
  const payasamDetail = (booking.payasamOption || []).map((payasam) => `${payasam.quantity} × ${payasam.name}`).join(" + ");
  const finalDetail = [detail, payasamDetail].filter(Boolean).join(" + ");

  const [checking, setChecking] = useState(false);

  const price = getSadhyaPrice(
    booking.date,
    booking.orderType
  );

  const payasamTotal = (booking.payasamOption || []).reduce(
    (sum, payasam) => sum + payasam.price,
    0
  );

  const charge = deliveryChargeForDistance(
    booking.distanceKm
  );

  const outOfRange =
    booking.distanceKm != null &&
    booking.distanceKm > MAX_DELIVERY_KM;

  const total =
    booking.orderType === "parcel"
      ? bookingTotal(booking) + (charge ?? 0)
      : bookingTotal(booking);


  const finalTotal = booking.totalAmount;

  async function handleCheckDistance() {
    if (!booking.address?.trim()) {
      setError("Enter a delivery address.");
      return;
    }

    if (
      booking.latitude == null ||
      booking.longitude == null
    ) {
      setError("Please search for your address first.");
      return;
    }

    const outlet = OUTLETS.find(
      (o) => o.id === booking.outletId
    );

    if (!outlet) {
      setError("Outlet not found.");
      return;
    }

    setError(null);
    setChecking(true);

    try {
      const result = await calculateDistance({
        latitude: booking.latitude,
        longitude: booking.longitude,
        outlet,
      });


      if (
        !result ||
        typeof result.distanceKm !== "number"
      ) {
        throw new Error(
          `Invalid distance result: ${JSON.stringify(result)}`
        );
      }

      const distanceKm = Number(result.distanceKm.toFixed(2));

      const deliveryCharge = deliveryChargeForDistance(distanceKm);

      const updatedBooking = {
        ...booking,
        distanceKm,
        deliveryCharge,
      };

      const foodTotal = bookingTotal(updatedBooking);

      const finalTotals =
        foodTotal +
        (deliveryCharge ?? 0) +
        payasamTotal;

      update({
        distanceKm,
        deliveryCharge,
        totalAmount: finalTotals,
      });

      if (deliveryCharge === null) {
        setError(
          `Sorry, this address is outside our ${MAX_DELIVERY_KM} km delivery range.`
        );
      }
    } catch (error) {
      console.error(
        "Distance calculation failed:",
        error
      );

      setError(
        "Couldn't calculate distance. Please check your address and try again."
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="step-card">
      <div className="back-nav">
        <button className="btn-ghost" onClick={goBack}>← Back</button>
      </div>
      <h2 className="choice-card__title" style={{ fontSize: 20, marginBottom: 16 }}>
        Your details
      </h2>

      {error && <div className="error-banner">{error}</div>}

      <div className="field">
        <label className="field__label">Name</label>
        <input
          className="field__input"
          value={booking.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Your full name"
        />
      </div>

      <div className="field">
        <label className="field__label">Phone number</label>
        <input
          className="field__input"
          value={booking.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="10-digit mobile number"
          inputMode="numeric"
        />
      </div>

      <div className="field">
        <label className="field__label">Email</label>
        <input
          className="field__input"
          value={booking.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@example.com"
          type="email"
        />
      </div>
      {booking.orderType === "parcel" && (
        <>
          {/* Door / Flat */}
          <div className="field">
            <label className="field__label">
              Door/Flat no.
            </label>

            <input
              className="field__input"
              value={booking.door || ""}
              onChange={(e) =>
                update({
                  door: e.target.value,
                })
              }
            />
          </div>

          {/* Address */}
          <div className="field">
            <GoogleAddressSearch
              value={booking.address || ""}
              onChange={(address) =>
                update({
                  address,
                  latitude: null,
                  longitude: null,
                  distanceKm: null,
                  deliveryCharge: null,
                })
              }
              onSelect={({ address, lat, lng }) =>
                update({
                  address,
                  latitude: lat,
                  longitude: lng,
                  distanceKm: null,
                  deliveryCharge: null,
                })
              }
            />
          </div>

          {/* Landmark */}
          <div className="field">
            <label className="field__label">
              Landmark (optional)
            </label>

            <input
              className="field__input"
              value={booking.landmark || ""}
              onChange={(e) =>
                update({
                  landmark: e.target.value,
                })
              }
            />
          </div>

          {/* Postcode */}
          <div className="field">
            <label className="field__label">
              Postcode
            </label>

            <input
              className="field__input"
              placeholder="e.g. 410210"
              value={booking.postcode || ""}
              onChange={(e) =>
                update({
                  postcode: e.target.value,
                })
              }
            />

            <p className="field__hint">
              Helps us calculate your delivery charge accurately.
            </p>
          </div>



          {/* Loader */}
          {checking && (
            <div className="loader-row">
              <div
                className="pookalam-loader"
                role="status"
                aria-label="Calculating distance"
              />

              <span className="loader-row__label">
                Calculating distance…
              </span>
            </div>
          )}
        </>
      )}
      <div className="summary">
        <div className="summary__row"><span>Outlet</span><span>{outlet?.name}</span></div>
        <div className="summary__row"><span>Date</span><span>{dateLabel}</span></div>
        <div className="summary__row"><span>Order type</span><span>{TYPE_LABEL[booking.orderType]}</span></div>
        <div className="summary__row"><span>Details</span><span>{finalDetail}</span></div>
        {(!checking && !outOfRange && booking.distanceKm != null && booking.orderType === "parcel") && (
          <>
            <div className="summary__row">
              <span>Delivery Address</span>
              <span>{booking.address}</span>
            </div>
            <div className="summary__row">
              <span>Distance</span>

              <span className="amount">
                {booking.distanceKm} km
              </span>
            </div>
            {booking.payasamOption?.length > 0 && (
              <div className="summary__row">
                <span>
                  Payassam × {booking.payasamOption?.length}
                </span>

                <span className="amount">
                  {formatRupees(
                    payasamTotal
                  )}
                </span>
              </div>
            )}
            <div className="summary__row">
              <span>Delivery charge</span>

              <span className="amount">
                {deliverySlabLabel(
                  booking.distanceKm
                )}{" "}
                -{" "}
                {formatRupees(charge)}
              </span>
            </div>


          </>
        )}
        <div className="summary__row is-total">
          <span>Total</span>

          <span className="amount">
            {formatRupees(finalTotal)}
          </span>
        </div>
      </div>
      {/* Calculate delivery */}
      {booking.orderType === "parcel" && booking.distanceKm == null ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginBottom: 20 }}
          onClick={handleCheckDistance}
          disabled={checking}
        >
          {checking ? "Calculating…" : "Calculate delivery charge"}
        </button>
      ) : checking ? null : (
        <>
          {outOfRange && (
            <p
              className="summary__note"
              style={{
                fontSize: 14,
                margin: 0,
              }}
            >
              Sorry, we don't deliver beyond{" "}
              {MAX_DELIVERY_KM} km. Please choose another Grace outlet
              closer to you, or switch to takeaway.
            </p>
          )}

          <p>
            Grace's team will call you shortly to confirm details and collect payment. For any queries contact <a href="tel:+919321573234">+919321573234</a>
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePay}
          >
            Confirm booking
          </button>
        </>
      )}
    </div>
  );
}
