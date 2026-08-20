import { useState } from "react";
import { BookingProvider, useBooking } from "./context/BookingContext";

import ProgressTrail from "./components/ProgressTrail";
import StepDate from "./components/StepDate";
import StepOutlet from "./components/StepOutlet";
import StepType from "./components/StepType";
import StepParcelDetails from "./components/StepParcelDetails";
import StepTableDetails from "./components/StepTableDetails";
import StepTakeawayDetails from "./components/StepTakeawayDetails";
import StepCustomer from "./components/StepCustomer";
import StepConfirmation from "./components/StepConfirmation";
import StepAddons from "./components/StepAddons";

/* --------------------------------
   Header
-------------------------------- */

function AppHeader({ booking = false }) {
  return (
    <header className="app-header">
      <img
        src="/logo.png"
        width={36}
        height={36}
        alt="Grace Restaurant"
      />

      <div className="app-header__content">
        <div className="app-header__mark">Onam Sadhya</div>

        <h1 className="app-header__title">Grace Restaurant</h1>

        <p className="header__locations" style={{ fontSize: "14px" }}>
          Menu from God's own country
        </p>

        <p className="header__locations" style={{ fontSize: "11px" }}>
          Kharghar • Nerul (Navi Mumbai)
        </p>

        {booking && (
          <p className="app-header__subtitle">
            Book a parcel, a table, or a takeaway
          </p>
        )}
      </div>
    </header>
  );
}

/* --------------------------------
   Page Shell
-------------------------------- */

function AppShell({ children, booking = false }) {
  return (
    <div className="app-shell">
      <div className="kasavu-border" />

      <AppHeader booking={booking} />

      {children}
    </div>
  );
}

/* --------------------------------
   Booking Steps
-------------------------------- */

function FlowStep() {
  const { step, booking } = useBooking();

  const showAddons =
    booking.date === "2026-08-26" &&
    ["parcel", "takeaway"].includes(booking.orderType) &&
    ["grace-nerul", "grace-kharghar", "eternal-nerul"].includes(booking.outletId);

  const steps = {
    date: <StepDate />,
    outlet: <StepOutlet />,
    type: <StepType />,
    ...(showAddons && {
      addons: <StepAddons />,
    }),
    customer: <StepCustomer />,
    confirmation: <StepConfirmation />,
  };

  if (steps[step]) {
    return steps[step];
  }

  if (step === "details") {
    const detailSteps = {
      parcel: <StepParcelDetails />,
      table: <StepTableDetails />,
      takeaway: <StepTakeawayDetails />,
    };

    return detailSteps[booking.orderType] ?? null;
  }

  return null;
}

/* --------------------------------
   Booking App
-------------------------------- */

function BookingApp() {
  return (
    <AppShell booking>
      <ProgressTrail />

      <main className="app-main">
        <FlowStep />
      </main>
    </AppShell>
  );
}

/* --------------------------------
   Landing Page
-------------------------------- */

function LandingPage({ onStart }) {
  return (
    <AppShell>
      <main
        className="app-main"
      >
        <div
          className="step-card"
          style={{ minHeight: "640px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div>
            <img
              src="/sadhya.png"
              alt="Onam Sadhya"
              style={{
                width: "100%",
                height: "300px",
                borderRadius: "18px",
                objectFit: "cover",
              }}
            />

            <div style={{ margin: "14px 0 32px", }}>
              <p className="field__hint" style={{ fontSize: "14px" }}>
                Onam is Kerala's biggest festival: 10 days of homecoming,
                flowers at the doorstep, and one enormous meal that the whole
                state waits all year for. That meal is the Sadhya, curries and
                pachadis and pickles and payasam, all served together on a single
                banana leaf. It's not a menu you pick from. It's everything at
                once, and it only comes around once a year.

                <br />
                <br />

                Grace has been cooking it the same way for 16 years, 23+ dishes,
                without shortcuts for a menu, the way it's actually cooked back
                home in Kerala. What started as one dining room has grown into
                three across Navi Mumbai, but nothing about the kitchen has
                changed. This Onam, book your Sadhya from Grace and taste why
                people keep coming back.
              </p>
            </div>
          </div>

          <button
            onClick={onStart}
            className="btn btn-primary"
          >
            Book your Sadhya
          </button>
        </div>
      </main>
    </AppShell>
  );
}

/* --------------------------------
   App
-------------------------------- */

export default function App() {
  const [showBooking, setShowBooking] = useState(false);

  if (!showBooking) {
    return (
      <LandingPage
        onStart={() => setShowBooking(true)}
      />
    );
  }

  return (
    <BookingProvider>
      <BookingApp />
    </BookingProvider>
  );
}