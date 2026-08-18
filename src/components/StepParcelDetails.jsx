import { useState } from "react";
import { useBooking } from "../context/BookingContext";
import QuantityStepper from "./QuantityStepper";

import {
  MAX_DELIVERY_KM,
  deliveryChargeForDistance,
  deliverySlabLabel,
  formatRupees,
  getSadhyaPrice,
  bookingTotal,
} from "../lib/pricing";

import { OUTLETS } from "../data/outlets";
import GoogleAddressSearch from "./GoogleAddressSearch";
import { calculateDistance } from "../lib/calculateDistance";

export default function StepParcelDetails() {
  const { booking, update, goNext, goBack } = useBooking();

  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const price = getSadhyaPrice(
    booking.date,
    booking.orderType
  );

  const charge = deliveryChargeForDistance(
    booking.distanceKm
  );

  const outOfRange =
    booking.distanceKm != null &&
    booking.distanceKm > MAX_DELIVERY_KM;

  const total =
    charge != null
      ? bookingTotal({
        ...booking,
        deliveryCharge: charge,
      })
      : null;

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

      // console.log(
      //   "calculateDistance result:",
      //   result
      // );

      if (
        !result ||
        typeof result.distanceKm !== "number"
      ) {
        throw new Error(
          `Invalid distance result: ${JSON.stringify(result)}`
        );
      }

      const distanceKm = Number(
        result.distanceKm.toFixed(2)
      );

      const deliveryCharge =
        deliveryChargeForDistance(distanceKm);

      update({
        distanceKm,
        deliveryCharge,
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

  function validate() {
    if (!booking.door?.trim()) {
      return "Please enter your door/flat number.";
    }

    if (!booking.address?.trim()) {
      return "Please enter your delivery address.";
    }

    if (!booking.postcode?.trim()) {
      return "Please enter your postcode.";
    }

    if (
      booking.latitude == null ||
      booking.longitude == null
    ) {
      return "Please search for your address first.";
    }

    if (booking.distanceKm == null) {
      return "Please calculate your delivery charge before continuing.";
    }

    if (outOfRange) {
      return `Sorry, we don't deliver beyond ${MAX_DELIVERY_KM} km.`;
    }

    return null;
  }

  function handleContinue() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (total == null) {
      setError(
        "Please calculate your delivery charge before continuing."
      );
      return;
    }

    setError(null);

    update({
      totalAmount: total,
    });

    goNext();
  }

  return (
    <div className="step-card">
      <div className="back-nav">
        <button
          className="btn-ghost"
          onClick={goBack}
        >
          ← Back
        </button>
      </div>

      <h2
        className="choice-card__title"
        style={{
          fontSize: 20,
          marginBottom: 16,
        }}
      >
        Parcel — home delivery
      </h2>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Quantity */}
      <div className="field">
        <label className="field__label">
          How many Sadhya?
        </label>

        <QuantityStepper
          value={booking.quantity}
          onChange={(v) =>
            update({
              quantity: v,
            })
          }
          unitLabel={`${formatRupees(price)} each`}
        />
      </div>

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

      {/* Calculate delivery */}
      {booking.distanceKm == null ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginBottom: 20 }}
          onClick={handleCheckDistance}
          disabled={checking}
        >
          {checking
            ? "Calculating…"
            : "Calculate delivery charge"}
        </button>
      ) : checking ? null : (
        <div className="summary">
          {outOfRange ? (
            <p
              className="summary__note"
              style={{
                fontSize: 14,
                margin: 0,
              }}
            >
              Sorry, we don't deliver beyond{" "}
              {MAX_DELIVERY_KM} km. Please choose
              another Grace outlet closer to you,
              or switch to takeaway.
            </p>
          ) : (
            <>
              <div className="summary__row">
                <span>Distance</span>

                <span className="amount">
                  {booking.distanceKm} km
                </span>
              </div>

              <div className="summary__row">
                <span>
                  Sadhya × {booking.quantity}
                </span>

                <span className="amount">
                  {formatRupees(
                    booking.quantity * price
                  )}
                </span>
              </div>

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

              <div className="summary__row is-total">
                <span>Total</span>

                <span className="amount">
                  {formatRupees(total)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

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

      {/* Continue */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleContinue}
        disabled={
          checking ||
          outOfRange ||
          total == null ||
          booking.distanceKm == null
        }
      >
        Continue
      </button>
    </div>
  );
}