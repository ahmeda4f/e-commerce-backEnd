import Stripe from "stripe";
import Coupon from "../../DB/Models/coupon.model.js";

export const creataCheckoutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata,
    discounts,
    line_items,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
  });
  return paymentData;
};

export const createStripeCoupon = async (couponId) => {
  const coupon = await Coupon.findOne({ _id: couponId });
  if (!coupon) {
    return { status: 404, message: "Coupon not found" };
  }

  console.log(coupon);
  let couponObject = {};
  if (coupon.isFixed) {
    couponObject = {
      currency: "EGP",
      name: coupon.couponCode,
      amount_off: coupon.couponAmount * 100,
    };
  } else if (coupon.isPercentage) {
    couponObject = {
      currency: "EGP",
      name: coupon.couponCode,
      percent_off: coupon.couponAmount,
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const stripeCoupon = await stripe.coupons.create(couponObject);
  return stripeCoupon;
};

export const createPaymentMethod = async (token) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token,
    },
  });
  return paymentMethod;
};

export const createPaymentIntent = async (amount) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await createPaymentMethod("tok_visa");
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "EGP",
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    payment_method: paymentMethod.id,
  });
  return paymentIntent;
};

export const retrievePaymentIntent = async ({ paymentIntentId }) => {
  console.log("Payment Intent ID:", paymentIntentId);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
};

export const confrimPaymentIntent = async ({ paymentIntentId }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await retrievePaymentIntent({ paymentIntentId });
  const paymenyIntentConfrimed = await stripe.paymentIntents.confirm(
    paymentIntent.id,
    {
      payment_method: paymentIntent.payment_method,
    }
  );
  return paymenyIntentConfrimed;
};

export const refundPaymentIntent = async ({ paymentIntentId }) => {
  console.log(paymentIntentId);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await retrievePaymentIntent({ paymentIntentId });
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntent.id,
  });
  return refund;
};
