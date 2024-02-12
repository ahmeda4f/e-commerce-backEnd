import express from "express";

import userRouter from "./src/Modules/User/user.router.js";
import categoryRouter from "./src/Modules/Category/category.router.js";
import subCategoryRouter from "./src/Modules/subCategory/subCategory.router.js";
import brandRouter from "./src/Modules/Brand/brand.router.js";
import productRouter from "./src/Modules/Product/product.router.js";

import db_connection from "./DB/connection.js";
import dotenv from "dotenv";
import { globalResponse } from "./src/Middlewares/globalResponse.js";
import { rollbackSavedDocument } from "./src/Middlewares/rollbackSavedDocuments.js";
import { rollbackUplpadedFiles } from "./src/Middlewares/rollbackUpoladedFiles.js";

const app = express();

dotenv.config();

app.use(express.json());

app.use(userRouter);
app.use(categoryRouter);
app.use(brandRouter);
app.use(subCategoryRouter);
app.use(productRouter);

db_connection();

app.use(globalResponse, rollbackSavedDocument, rollbackUplpadedFiles);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
