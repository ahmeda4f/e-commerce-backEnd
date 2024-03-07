import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        basePrice: {
          type: Number,
          required: true,
          default: 0,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
