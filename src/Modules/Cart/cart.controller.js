import Cart from "../../../DB/Models/cart.model.js";
import Product from "../../../DB/Models/product.model.js";

// Function to add a product to the user's cart
export const addProductToCart = async (req, res) => {
  // Destructure productId and quantity from the request body
  const { productId, quantity } = req.body;

  // Check if quantity is less than 0, and return an error message if true
  if (quantity < 0) {
    return res.status(400).json({
      message: "Quantity cannot be less than 0",
    });
  }

  // Find the product in the database using the productId
  const productFound = await Product.findOne({ _id: productId });

  // Return an error message if the product is not found
  if (!productFound) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  // Find the user's cart in the database using the userId
  const userHasCart = await Cart.findOne({ userId: req.userFound._id });

  // If the user doesn't have a cart, create a new cart and add the product to it
  if (!userHasCart) {
    const cartObject = {
      userId: req.userFound._id,
      products: [
        {
          productId,
          quantity,
          title: productFound.title,
          basePrice: productFound.appliedPrice,
          finalPrice: productFound.appliedPrice * quantity,
        },
      ],
      subTotal: productFound.appliedPrice * quantity,
    };

    // Create a new cart in the database and return an error message if creation fails
    const newCart = await Cart.create(cartObject);
    if (!newCart) {
      return res.status(400).json({
        message: "Error creating cart",
      });
    }

    return res.status(201).json({
      message: "Successfully added product to cart",
      cart: newCart,
    });
  }

  // Initialize variables to track if the product exists in the cart and the total price of the cart
  let isProductExistsInCart = false;
  let subTotal = 0;

  // Loop through the products in the user's cart
  for (const product of userHasCart.products) {
    // If the product is found in the cart, update its quantity and final price
    if (product.productId.toHexString() === productId) {
      isProductExistsInCart = true;
      product.quantity = quantity;
      product.finalPrice = productFound.appliedPrice * quantity;
    }
    // Calculate the total price of the cart
    subTotal += product.finalPrice;
  }

  // If the product is not in the cart, add it to the cart
  if (!isProductExistsInCart) {
    userHasCart.products.push({
      productId,
      quantity,
      basePrice: productFound.appliedPrice,
      finalPrice: productFound.appliedPrice * quantity,
      title: productFound.title,
    });
    // Update the total price of the cart
    subTotal += productFound.appliedPrice * quantity;
  }

  // Update the cart's total price
  userHasCart.subTotal = subTotal;

  // Save the changes to the user's cart in the database
  await userHasCart.save();

  // Return a success message with the updated cart
  return res.status(200).json({
    message: "Product added to cart",
    cart: userHasCart,
  });
};

// This function removes a product from the user's cart
export const removeProductFromCart = async (req, res) => {
  // Extract the productId from the request parameters
  const { productId } = req.params;

  // Find the product by productId
  const productFound = await Product.findOne({ _id: productId });

  // If the product is not found, return a 404 status with an error message
  if (!productFound) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  // Find the user's cart by userId and productId
  const userCart = await Cart.findOne({
    userId: req.userFound._id,
    "products.productId": productId,
  });

  // If the cart is not found, return a 404 status with an error message
  if (!userCart) {
    return res.status(404).json({
      message: "product not found in cart",
    });
  }

  // Log the current products in the user's cart
  console.log(userCart.products);

  // Remove the product from the user's cart
  userCart.products = userCart.products.filter(
    (product) => product.productId.toHexString() !== productId
  );

  // Remove the cart if it has no products in it after removing the product
  if (userCart.products.length <= 0) {
    const deleteCart = await Cart.findOneAndDelete({
      userId: req.userFound._id,
    });
    if (deleteCart) {
      return res.status(200).json({
        message: "product removed from cart successfully",
      });
    }
  }
  // Log the updated products in the user's cart
  console.log(userCart.products);

  // Calculate the new subTotal by iterating through the products in the user's cart
  let subTotal = 0;
  for (const product of userCart.products) {
    subTotal += product.finalPrice;
  }

  // Update the subTotal in the user's cart
  userCart.subTotal = subTotal;

  // Save the updated cart
  const newCart = await userCart.save();

  // If the cart is successfully updated, return a 200 status with a success message
  if (newCart) {
    return res.status(200).json({
      message: "product removed from cart successfully",
    });
  }

  // If there is an error updating the cart, return a 400 status with an error message
  return res.status(400).json({
    message: "error removing product from cart",
  });
};
