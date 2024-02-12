import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import slugify from "slugify";

import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

import { systemRoles } from "../../Utils/systemRoles.js";
import generateUniqueFileName from "../../Utils/generateUniqueString.js";
import cloudinaryConnection from "../../Utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllProducts = async (req, res) => {
  const products = await Product.find();
  if (products.length <= 0) {
    return res.status(200).json({
      message: "No products found",
    });
  }
  return res.status(200).json({
    message: "Successfully retrieved all products",
    products,
  });
};

export const addProduct = async (req, res) => {
  const { title, desc, basePrice, discount, stock, specs } = req.body;
  console.log("debugging title error: " + title);
  const { categoryId, subCategoryId, brandId } = req.query;
  const brandFound = await Brand.findOne({ _id: brandId });

  //// conditions of finding the category , subcategory and brand ////

  if (!brandFound) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }
  if (brandFound.subCategoryId.toHexString() !== subCategoryId) {
    return res.status(409).json({
      message: "This brand doesn't belong to this subcategory",
    });
  }
  if (brandFound.categoryId.toHexString() !== categoryId) {
    return res.status(409).json({
      message: "This brand doesn't belong to this category",
    });
  }
  console.log(req.userFound.role);
  console.log(req.userFound._id.toHexString());
  console.log(brandFound.addedBy.toHexString());

  if (
    req.userFound.role !== systemRoles.superAdmin &&
    req.userFound._id.toHexString() != brandFound.addedBy.toHexString()
  ) {
    return res.status(401).json({
      message: "You are not authorized to add this product",
    });
  }
  console.log(title);
  const slug = slugify(title, "-");

  const appliedPrice = basePrice - basePrice * ((discount || 0) / 100);

  const writeFile = util.promisify(fs.writeFile);
  const folderId = generateUniqueFileName(4);

  let images = [];
  for (const file of req.files) {
    const sanitizedTitle = slugify(title, { replacement: "_", lower: true });
    const tempFilePath = path.join(__dirname, sanitizedTitle);
    await writeFile(tempFilePath, file.buffer);

    const folder = brandFound.image.public_id.split(
      `${brandFound.folderId}/`
    )[0];

    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(tempFilePath, {
        folder:
          folder + `${brandFound.folderId}` + "/Products/" + `${folderId}`,
      });

    images.push({ secure_url, public_id });

    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });
  }

  if (!req.files?.length) {
    return res.status(400).json({
      message: "You must upload images",
    });
  }

  const product = {
    title,
    desc,
    slug,
    folderId,
    discount,
    basePrice,
    appliedPrice,
    stock,
    addedBy: req.userFound._id,
    brandId,
    categoryId,
    subCategoryId,
    image: images,
    specs: JSON.parse(specs),
  };

  const newProduct = await Product.create(product);
  req.savedDocument = { model: Product, _id: newProduct._id };

  if (!newProduct) {
    return res.status(400).json({
      message: "Error creating product",
    });
  }

  return res.status(201).json({
    message: "Successfully created product",
    product: newProduct,
  });
};

export const updateProduct = async (req, res) => {
  const { title, desc, basePrice, discount, stock, specs, oldPublicId } =
    req.body;
  const { productId } = req.params;
  const productFound = await Product.findOne({ _id: productId });
  if (!productFound) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  if (
    req.userFound.role !== systemRoles.superAdmin &&
    req.userFound._id.toHexString() != productFound.addedBy.toHexString()
  ) {
    return res.status(401).json({
      message: "You are not authorized to add this product",
    });
  }
  if (title) {
    productFound.title = title;
    const slug = slugify(title, "-");
    productFound.slug = slug;
  }
  if (desc) productFound.desc = desc;
  if (specs) productFound.specs = JSON.parse(specs);

  if (stock) productFound.stock = stock;
  if (discount) productFound.discount = discount;

  if (basePrice) {
    productFound.basePrice = basePrice;
  }
  const appliedPrice =
    (basePrice || productFound.basePrice) -
    (basePrice || productFound.basePrice) *
      ((discount || productFound.discount) / 100);
  productFound.appliedPrice = appliedPrice;

  if (oldPublicId) {
    if (!req.file) {
      return res.status(400).json({
        message: "image is required",
      });
    }
    const writeFile = util.promisify(fs.writeFile);
    const tempFilePath = path.join(__dirname, `${title}`);
    await writeFile(tempFilePath, req.file.buffer);

    const newPublicId = oldPublicId.split(`${oldPublicId.folderId}/`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(tempFilePath, {
        folder: `${oldPublicId.split(`${oldPublicId.folderId}/`)[0]}${
          productFound.folderId
        }`,
        public_id: newPublicId,
      });
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });
    productFound.image.map((img) => {
      if (img.public_id == oldPublicId) {
        img.secure_url = secure_url;
      }
    });
  }
  const productUpdated = await productFound.save();
  if (!productUpdated) {
    return res.status(400).json({
      message: "error updating product",
    });
  }
  return res.status(200).json({
    message: "successfully updated product",
    productUpdated,
  });
};
