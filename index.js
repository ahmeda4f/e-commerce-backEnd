import express from "express";
import { gracefulShutdown } from "node-schedule";
import dotenv from "dotenv";

import userRouter from "./src/Modules/User/user.router.js";
import categoryRouter from "./src/Modules/Category/category.router.js";
import subCategoryRouter from "./src/Modules/subCategory/subCategory.router.js";
import brandRouter from "./src/Modules/Brand/brand.router.js";
import productRouter from "./src/Modules/Product/product.router.js";
import cartRouter from "./src/Modules/Cart/cart.router.js";
import couponRouter from "./src/Modules/Coupon/coupon.router.js";
import orderRouter from "./src/Modules/Order/order.router.js";
import reviewRouter from "./src/Modules/Review/review.router.js";

import db_connection from "./DB/connection.js";
import { globalResponse } from "./src/Middlewares/globalResponse.js";
import { rollbackSavedDocument } from "./src/Middlewares/rollbackSavedDocuments.js";
import { rollbackUplpadedFiles } from "./src/Middlewares/rollbackUpoladedFiles.js";
import { cronToChangeExpiredCoupons } from "./src/Utils/crons.js";

const app = express();

dotenv.config();

app.use(express.json());

app.use(userRouter);
app.use(categoryRouter);
app.use(brandRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(couponRouter);
app.use(orderRouter);
app.use(reviewRouter);

app.use("*", (req, res) => {
  return res.status(404).json({ message: "Route not found" });
});
// gracefulShutdown();

cronToChangeExpiredCoupons();

db_connection();

app.use(globalResponse, rollbackSavedDocument, rollbackUplpadedFiles);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
