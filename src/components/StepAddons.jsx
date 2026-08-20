import { useBooking } from "../context/BookingContext";

const PAYASAMS = [
    { name: "Pal payasam", price: 600, image: "/assets/images/payasam/Pal payasam.webp", },
    { name: "Palada", price: 600, image: "/assets/images/payasam/Pal ada payasam.webp", },
    { name: "Ada pradaman", price: 650, image: "/assets/images/payasam/Ada pradhman.webp", },
    { name: "Parippu pradaman", price: 650, image: "/assets/images/payasam/Parippu-Pradhaman.webp", },
    { name: "Semiya payasam", price: 550, image: "/assets/images/payasam/Semiya payasam.webp", },
    { name: "Gothambu pradaman", price: 550, image: "/assets/images/payasam/Gothambu payasam.webp", },
    { name: "Mango payasam", price: 550, image: "/assets/images/payasam/Mango payasam.webp", },
    { name: "Mathanga pradaman", price: 500, image: "/assets/images/payasam/Matanga pradhaman.webp", },
    { name: "Pineapple payasam", price: 600, image: "/assets/images/payasam/Pineapple payasam.webp", },
    { name: "Carrot payasam", price: 600, image: "/assets/images/payasam/Carrot payasam.webp", },
    { name: "Pazha pradaman", price: 550, image: "/assets/images/payasam/Pazham pradhman.webp", },
    { name: "Tender coconut payasam", price: 700, image: "/assets/images/payasam/Tender coconut payasam.webp", },
    { name: "Aval payasam", price: 650, image: "/assets/images/payasam/Aval payasam.webp", },
    { name: "Mixed fruit payasam", price: 600, image: "/assets/images/payasam/Mix fruit payasam.webp", },
    { name: "Lotus seed Payasam", price: 750, image: "/assets/images/payasam/Lotus seed ayasam.webp", },
];

export default function StepAddons() {
    const { booking, update, goNext, goBack } = useBooking();

    const selectedPayasams = booking.payasamOption || [];

    function togglePayasam(payasam) {
        const exists = selectedPayasams.some(
            (item) => item.name === payasam.name
        );

        const updatedPayasams = exists
            ? selectedPayasams.filter(
                (item) => item.name !== payasam.name
            )
            : [...selectedPayasams, payasam];

        const payasamTotal = updatedPayasams.reduce(
            (total, item) =>
                total + item.price * booking.takeawayQuantity,
            0
        );

        const baseTotal =
            booking.totalAmount -
            selectedPayasams.reduce(
                (total, item) =>
                    total + item.price * booking.takeawayQuantity,
                0
            );

        update({
            payasamOption: updatedPayasams,
            wantsAddOns: updatedPayasams.length > 0,
            totalAmount: baseTotal + payasamTotal,
        });
    }

    function skip() {
        const payasamTotal = selectedPayasams.reduce(
            (total, item) =>
                total + item.price * booking.takeawayQuantity,
            0
        );

        update({
            wantsAddOns: false,
            payasamOption: [],
            totalAmount: booking.totalAmount - payasamTotal,
        });

        goNext();
    }

    function continueWithPayasams() {
        update({
            wantsAddOns: selectedPayasams.length > 0,
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
                Payasam Mela
            </h2>

            <p className="field__hint" style={{ marginBottom: 18 }}>
                14 payasams, one mela. Pick your favourite, or try a few.
            </p>

            <div className="choice-grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                {PAYASAMS.map((payasam) => {
                    const selected = selectedPayasams.some(
                        (item) => item.name === payasam.name
                    );

                    return (
                        <button
                            key={payasam.name}
                            type="button"
                            className={`choice-card ${selected ? "is-selected" : ""}`}
                            onClick={() => togglePayasam(payasam)}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                }}
                            >
                                <img
                                    src={payasam.image}
                                    alt={payasam.name}
                                    style={{
                                        width: 56,
                                        height: 56,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        flexShrink: 0,
                                    }}
                                />

                                <div>
                                    <div className="choice-card__title" style={{ lineHeight: 1, marginBottom: "4px" }}>
                                        {payasam.name}
                                    </div>

                                    <div className="choice-card__meta">
                                        1 litre · ₹{payasam.price}
                                    </div>
                                </div>
                            </div>

                            <span
                                className="choice-card__glyph"
                                aria-hidden
                            >
                                {selected ? "✓" : "+"}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: 20 }}>
                {selectedPayasams.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={continueWithPayasams}
                        disabled={selectedPayasams.length === 0}
                    >
                        Continue
                    </button>
                )}

                <button
                    type="button"
                    className="btn-ghost"
                    onClick={skip}
                    style={{
                        width: "100%",
                        marginTop: 10,
                        fontSize: "14px"
                    }}
                >
                    Skip — I don't want payasam
                </button>
            </div>
        </div>
    );
}