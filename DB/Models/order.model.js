import mongoose, { Schema } from "mongoose";

import { paymentMethods } from "../../src/Utils/paymentMethods.js";
import { orderStatus } from "../../src/Utils/orderStatus.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        title: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        product: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
      },
    ],

    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    shippingPrice: {
      type: Number,
      required: true,
    },

    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: [paymentMethods.Cash, paymentMethods.Stripe, paymentMethods.Paymob],
      required: true,
    },

    orderStatus: {
      type: String,
      enum: [
        orderStatus.Cancelled,
        orderStatus.Delivered,
        orderStatus.Pending,
        orderStatus.Paid,
        orderStatus.Placed,
      ],
      required: true,
      default: orderStatus.Pending,
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: String,
      //   required: true,
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: String,
      //   required: true,
    },
    deliveredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledAt: {
      type: String,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    paymentIntent: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
