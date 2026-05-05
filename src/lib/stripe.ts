import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export async function createCheckoutSession({
  bookingId,
  artistName,
  bookingType,
  depositAmount,
  clientEmail,
  successUrl,
  cancelUrl,
}: {
  bookingId: string;
  artistName: string;
  bookingType: string;
  depositAmount: number;
  clientEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: clientEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tattoo Appointment Deposit — ${artistName}`,
            description: `${bookingType === "FLASH" ? "Flash" : "Custom"} tattoo booking deposit`,
          },
          unit_amount: Math.round(depositAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}
