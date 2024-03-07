import { DateTime } from "luxon";
import Coupon from "../../../DB/Models/coupon.model.js";
import Order from "../../../DB/Models/order.model.js";
import Product from "../../../DB/Models/product.model.js";
import { couponValidation } from "../../Utils/couponValidation.js";
import { orderStatus } from "../../Utils/orderStatus.js";
import { paymentMethods } from "../../Utils/paymentMethods.js";
import { getUserCart } from "../Cart/Utils/getUserCart.js";
import Cart from "../../../DB/Models/cart.model.js";
import { generateQrCode } from "../../Utils/qrCodeGenerator.js";
import CouponUsers from "../../../DB/Models/couponUsers.model.js";
import {
  confrimPaymentIntent,
  creataCheckoutSession,
  createPaymentIntent,
  createStripeCoupon,
  refundPaymentIntent,
} from "../../paymentHandler/stripe.js";

export const createOrder = async (req, res) => {
  const {
    product,
    quantity,
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;
  const { _id: userId } = req.userFound;

  let couponFound = null;

  if (couponCode) {
    const couponAva = await couponValidation(couponCode, userId);

    if (couponAva.status) {
      return res.status(couponAva.status).json({
        message: couponAva.message,
      });
    }
    couponFound = couponAva;
  }

  const productAvaliable = await Product.findOne({ _id: product });
  if (productAvaliable.stock < quantity || !productAvaliable.stock) {
    return res.status(400).json({
      message: "product not avaliable",
    });
  }

  let orderItems = [
    {
      title: productAvaliable.title,
      quantity,
      price: productAvaliable.appliedPrice,
      product: productAvaliable._id,
    },
  ];

  let shippingPrice = orderItems[0].price * quantity;
  let totalPrice = shippingPrice;

  if (couponCode) {
    console.log(couponFound?.isPercentage && couponFound.couponAmount <= 100);
    if (couponFound?.isFixed && couponFound.couponAmount <= shippingPrice)
      totalPrice = shippingPrice - couponFound.couponAmount;
    else if (couponFound?.isPercentage && couponFound.couponAmount <= 100)
      totalPrice =
        shippingPrice - (shippingPrice * couponFound.couponAmount) / 100;
    else {
      return res.status(400).json({
        message: "coupon not valid",
      });
    }
  }
  let orderStatuss;
  if (paymentMethod == paymentMethods.Cash) orderStatuss = orderStatus.Placed;

  const order = {
    user: userId,
    orderItems,
    phoneNumbers,
    shippingAddress: { address, city, postalCode, country },
    paymentMethod,
    coupon: couponFound ? couponFound._id : null,
    shippingPrice,
    totalPrice,
    orderStatus: orderStatuss,
  };

  if (couponFound) {
    const couponUsersFound = await CouponUsers.findOneAndUpdate(
      {
        couponId: couponFound._id,
      },
      {
        $inc: {
          usageCount: 1,
        },
      },
      { new: true }
    );
  }

  const orderCreated = await Order.create(order);

  productAvaliable.stock -= quantity;
  await productAvaliable.save();

  const qrCode = await generateQrCode([
    orderCreated._id,
    orderCreated.orderStatus,
    orderCreated.user,
    orderCreated.totalPrice,
  ]);

  if (orderCreated)
    return res.status(201).json({
      message: "Order created successfully",
      orderCreated,
      qrCode,
    });
};

export const cartToOrder = async (req, res) => {
  const { _id: userId } = req.userFound;
  const {
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const cartFound = await getUserCart(userId);
  if (!cartFound)
    return res.status(404).json({
      message: "cart not found",
    });

  let couponFound = null;

  if (couponCode) {
    const couponAva = await couponValidation(couponCode, userId);

    if (couponAva.status) {
      return res.status(couponAva.status).json({
        message: couponAva.message,
      });
    }
    couponFound = couponAva;
  }

  let orderItems = cartFound.products.map((item) => {
    return {
      title: item.title,
      quantity: item.quantity,
      price: item.basePrice,
      product: item._id,
    };
  });
  // let products = [];
  for (const product of orderItems) {
    //   products.push(product.product);
    console.log(product.product);
    const productAvaliable = await Product.findOne({ _id: product.product });
    if (productAvaliable?.stock < product.quantity) {
      return res.status(400).json({
        message: "product not avaliable",
      });
    }
  }

  let shippingPrice = cartFound.subTotal;
  let totalPrice = shippingPrice;

  if (couponCode) {
    console.log(couponFound?.isPercentage && couponFound.couponAmount <= 100);
    if (couponFound?.isFixed && couponFound.couponAmount <= shippingPrice)
      totalPrice = shippingPrice - couponFound.couponAmount;
    else if (couponFound?.isPercentage && couponFound.couponAmount <= 100)
      totalPrice =
        shippingPrice - (shippingPrice * couponFound.couponAmount) / 100;
    else {
      return res.status(400).json({
        message: "coupon not valid",
      });
    }
  }
  let orderStatuss;
  if (paymentMethod == paymentMethods.Cash) orderStatuss = orderStatus.Placed;

  const order = {
    user: userId,
    orderItems,
    phoneNumbers,
    shippingAddress: { address, city, postalCode, country },
    paymentMethod,
    coupon: couponFound ? couponFound._id : null,
    shippingPrice,
    totalPrice,
    orderStatus: orderStatuss,
  };

  const orderCreated = await Order.create(order);

  for (const item of order.orderItems) {
    await Product.findOneAndUpdate(
      { _id: item.product },
      { $inc: { stock: -item.quantity } }
    );
  }

  if (couponFound) {
    await couponFound.updateOne(
      { _id: couponFound._id },
      { $inc: { usageCount: 1 } }
    );
  }
  await Cart.deleteOne({ _id: cartFound._id });

  if (orderCreated)
    return res.status(201).json({
      message: "Order created successfully",
      orderCreated,
    });
};
export const deliverOrder = async (req, res) => {
  const { orderId: orderId } = req.params;
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: [orderStatus.Placed, orderStatus.Paid] },
    },
    {
      orderStatus: orderStatus.Delivered,
      deliveredAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
      deliveredBy: req.userFound._id,
      isDelivered: true,
    },
    {
      new: true,
    }
  );

  if (updatedOrder)
    return res.status(200).json({
      message: "order delivered successfully",
    });
  return res.status(404).json({
    message: "order not found or cannot be delivered",
  });
};

export const payWithStripe = async (req, res) => {
  const { orderId } = req.params;
  const { _id: userId } = req.userFound;

  const order = await Order.findOne({
    _id: orderId,
    orderStatus: orderStatus.Pending,
    user: userId,
  });
  if (!order) {
    return res.status(404).json({
      message: "Order not found or cannot be paid",
    });
  }

  console.log(order);
  const paymentObject = {
    customer_email: req.userFound.email,
    metadata: { orderId: order._id.toString() },
    discounts: [],
    line_items: order.orderItems.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    }),
  };
  if (order.coupon) {
    console.log(order.coupon);
    const stripeCoupon = await createStripeCoupon(order.coupon);
    paymentObject.discounts.push({
      coupon: stripeCoupon.id,
    });
  }
  console.log(paymentObject.line_items);
  const paymentData = await creataCheckoutSession(paymentObject);
  const paymentIntent = await createPaymentIntent(order.totalPrice);
  order.paymentIntent = paymentIntent.id;
  await order.save();
  return res.status(200).json({
    message: "done",
    paymentData,
  });
};

export const stripeWebHookLocal = async (req, res) => {
  console.log(req.body);
  const orderId = req.body.data.object.metadata.orderId;
  const confrimOrder = await Order.findOne({ _id: orderId });
  if (!confrimOrder) {
    return res.status(404).json({
      message: "Order not found",
    });
  }
  console.log(confrimOrder + "webhook");
  confrimOrder.orderStatus = orderStatus.Paid;
  console.log(req.body.data.object.paymentIntent + "id payment");
  confrimOrder.paidAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  confrimOrder.isPaid = true;
  await confrimOrder.save();
  const paymenyIntentConfrim = await confrimPaymentIntent({
    paymentIntentId: req.body.data.object.payment_intent,
  });
  console.log(paymenyIntentConfrim);
  return res.status(200).json({
    message: "done",
  });
};

export const refundPayment = async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({
    _id: orderId,
    orderStatus: orderStatus.Paid,
  });
  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const refundedPaymentIntent = await refundPaymentIntent({
    paymentIntentId: order.paymentIntent,
  });
  if (!refundedPaymentIntent) {
    return res.status(400).json({
      message: "error refunding payment",
    });
  }
  order.orderStatus = orderStatus.Refunded;
  await order.save();
  return res.status(200).json({
    message: "done",
  });
};

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findOne({
    _id: orderId,
    user: req.userFound._id,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  } else {
    if (
      order.orderStatus === orderStatus.Delivered ||
      order.orderStatus === orderStatus.Cancelled ||
      order.orderStatus === orderStatus.Refunded
    ) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    if (order.createdAt < DateTime.now().minus({ days: 1 }).toJSDate()) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = orderStatus.Cancelled;

    await order.save();

    return res
      .status(200)
      .json({ message: "Order cancelled successfully", order });
  }
};
