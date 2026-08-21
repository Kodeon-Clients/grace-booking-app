import { useBooking } from "../context/BookingContext";

const PAYASAMS = [
    { name: "Pal payasam", price: 600, image: "/assets/images/payasam/Pal payasam.webp" },
    { name: "Palada", price: 600, image: "/assets/images/payasam/Pal ada payasam.webp" },
    { name: "Ada pradaman", price: 650, image: "/assets/images/payasam/Ada pradhman.webp" },
    { name: "Parippu pradaman", price: 650, image: "/assets/images/payasam/Parippu-Pradhaman.webp" },
    { name: "Semiya payasam", price: 550, image: "/assets/images/payasam/Semiya payasam.webp" },
    { name: "Gothambu pradaman", price: 550, image: "/assets/images/payasam/Gothambu payasam.webp" },
    { name: "Mango payasam", price: 550, image: "/assets/images/payasam/Mango payasam.webp" },
    { name: "Mathanga pradaman", price: 500, image: "/assets/images/payasam/Matanga pradhaman.webp" },
    { name: "Pineapple payasam", price: 600, image: "/assets/images/payasam/Pineapple payasam.webp" },
    { name: "Carrot payasam", price: 600, image: "/assets/images/payasam/Carrot payasam.webp" },
    { name: "Pazha pradaman", price: 550, image: "/assets/images/payasam/Pazham pradhman.webp" },
    { name: "Tender coconut payasam", price: 700, image: "/assets/images/payasam/Tender coconut payasam.webp" },
    { name: "Aval payasam", price: 650, image: "/assets/images/payasam/Aval payasam.webp" },
    { name: "Mixed fruit payasam", price: 600, image: "/assets/images/payasam/Mix fruit payasam.webp" },
    { name: "Lotus seed Payasam", price: 750, image: "/assets/images/payasam/Lotus seed ayasam.webp" },
];

export default function StepAddons() {
    const { booking, update } = useBooking();

    const selectedPayasams = booking.payasamOption || [];

    function getQuantity(name) {
        return selectedPayasams.find(
            (item) => item.name === name
        )?.quantity || 0;
    }

    function calculatePayasamTotal(items) {
        return items.reduce(
            (total, item) =>
                total + item.price * item.quantity * booking.takeawayQuantity,
            0
        );
    }

    function updateQuantity(payasam, quantity) {
        const updatedPayasams = selectedPayasams.filter(
            (item) => item.name !== payasam.name
        );

        if (quantity > 0) {
            updatedPayasams.push({
                ...payasam,
                quantity,
            });
        }

        const oldPayasamTotal = calculatePayasamTotal(selectedPayasams);
        const newPayasamTotal = calculatePayasamTotal(updatedPayasams);

        const baseTotal =
            booking.totalAmount - oldPayasamTotal;

        update({
            payasamOption: updatedPayasams,
            wantsAddOns: updatedPayasams.length > 0,
            totalAmount: baseTotal + newPayasamTotal,
        });
    }

    return (
        <div className="choice-grid addon-grid" style={{
            marginBottom: "20px",
        }}>
            {PAYASAMS.map((payasam) => {
                const quantity = getQuantity(payasam.name);
                const selected = quantity > 0;

                return (
                    <div
                        key={payasam.name}
                        className={`choice-card ${selected ? "is-selected" : ""}`}
                        style={{
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                                width: "100%"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
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
                                    <div
                                        className="choice-card__title"
                                        style={{
                                            lineHeight: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {payasam.name}
                                    </div>

                                    <div className="choice-card__meta">
                                        1 litre · ₹{payasam.price}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <button
                                    type="button"
                                    className="stepper__btn"
                                    onClick={() =>
                                        updateQuantity(
                                            payasam,
                                            quantity - 1
                                        )
                                    }
                                    disabled={quantity === 0}
                                >
                                    −
                                </button>

                                <span className="stepper__value">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    className="stepper__btn"
                                    onClick={() =>
                                        updateQuantity(
                                            payasam,
                                            quantity + 1
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}