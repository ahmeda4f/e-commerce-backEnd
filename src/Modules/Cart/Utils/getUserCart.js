import Cart from "../../../../DB/Models/cart.model.js";

export async function getUserCart(userId) {
  const cart = await Cart.findOne({ userId });
  return cart;
}
