import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import slugify from "slugify";

import Brand from "../../../DB/Models/brand.model.js";
import SubCategory from "../../../DB/Models/subCategory.model.js";

import generateUniqueFileName from "../../Utils/generateUniqueString.js";
import cloudinaryConnection from "../../Utils/cloudinary.js";
import Category from "../../../DB/Models/category.model.js";
import { response } from "express";
import { systemRoles } from "../../Utils/systemRoles.js";
import Product from "../../../DB/Models/product.model.js";
import { ApiFeatures } from "../../Utils/apiFeatures.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addBrand = async (req, res, next) => {
  const { name } = req.body;
  const { _id } = req.userFound;
  const { subCategoryId, categoryId } = req.query;
  const subCategory = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  if (!subCategory) {
    return res.status(404).json({
      message: "subCategory not found",
    });
  }
  if (categoryId != subCategory.categoryId.id) {
    return res.status(400).json({
      message: "sub category doesn't belong to this category",
    });
  }
  console.log(_id);
  // console.log(req.userFound);
  const brandFound = await Brand.findOne({ name, subCategoryId });
  if (brandFound) {
    return res.status(409).json({
      message: "subCategory already exists",
    });
  }
  const slug = slugify(name, "-");

  const writeFile = util.promisify(fs.writeFile);
  const tempFilePath = path.join(__dirname, `${name}`);
  await writeFile(tempFilePath, req.file.buffer);
  const folderId = generateUniqueFileName(4);

  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(tempFilePath, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}/Brands/${folderId}`,
    });
  fs.unlink(tempFilePath, (err) => {
    if (err) console.error("Error deleting temporary file:", err);
  });
  if (!req.file) {
    return res.status(400).json({
      message: "you must upload image",
    });
  }
  console.log(secure_url + " " + public_id + name + _id + slug + folderId);

  const newBrand = {
    name,
    slug,
    image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    categoryId: subCategory.categoryId._id,
    subCategoryId,
  };
  console.log(newBrand.addedBy);
  const brandAdded = await Brand.create(newBrand);
  if (!brandAdded) {
    return res.status(400).json({
      message: "Error creating brand",
    });
  }
  return res.status(200).json({
    message: "brand added successfully",
    category: newBrand,
  });
};

export const getAllBrands = async (req, res) => {
  const brands = await Brand.find().populate([
    {
      path: "subCategoryId",
      populate: [
        {
          path: "categoryId",
        },
      ],
    },
  ]);
  if (!brands) {
    return res.status(204).json({
      message: "no brands found",
    });
  }
  return res.status(200).json({
    message: "brands found successfully",
    brands,
  });
};

//brand owner only
export const updateBrand = async (req, res) => {
  const { name, oldPublicId } = req.body;
  const { brandId } = req.params;

  const brandFound = await Brand.findOne({ _id: brandId });
  if (!brandFound) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }
  if (brandFound.addedBy.toHexString() != req.userFound._id.toHexString()) {
    return res.status(401).json({
      message: "Brand owner only has the authorization to update the brand",
    });
  }

  if (name) {
    brandFound.name = name;
    const slug = slugify(name, "-");
    brandFound.slug = slug;
  }
  if (oldPublicId) {
    if (!req.file) {
      return res.status(400).json({
        message: "you must upload image",
      });
    }
    const writeFile = util.promisify(fs.writeFile);
    const tempFilePath = path.join(__dirname, `${name}`);
    await writeFile(tempFilePath, req.file.buffer);
    const newPublicId = oldPublicId.split(`${brandFound.folderId}/`)[1];
    const category = await Category.findOne({
      _id: brandFound.categoryId,
    });
    const subCategoryFound = await SubCategory.findOne({
      _id: brandFound.subCategoryId,
    });
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(tempFilePath, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${subCategoryFound.folderId}/Brands/${brandFound.folderId}`,
        public_id: newPublicId,
      });
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });

    brandFound.image.secure_url = secure_url;
    brandFound.image.public_id = public_id;
  }
  const updatedBrand = await brandFound.save();
  if (updatedBrand)
    return res.status(200).json({
      message: "brand updated successfully",
      updatedBrand,
    });
  else {
    return res.status(400).json({
      message: "error updating brand",
    });
  }
};
//brand owner and superadmin
export const deleteBrand = async (req, res) => {
  const { brandId } = req.params;
  const userId = req.userFound._id;
  const brandFound = await Brand.findOne({ _id: brandId });
  if (!brandFound) {
    return res.status(404).json({
      message: "Couldn't find brand",
    });
  }
  if (
    userId.toHexString() != brandFound.addedBy &&
    req.userFound.role != systemRoles.superAdmin
  ) {
    return res.status(401).json({
      message: "user not authorized to delete this brand",
    });
  }
  const deletedProducts = await Product.deleteMany({ brandId });
  if (deletedProducts.length <= 0) {
    console.log("no related products");
  }
  const deletedBrand = await Brand.findOneAndDelete({ _id: brandId });
  if (!deletedBrand) {
    return response.status(400).json({
      message: "error deleting brand",
    });
  }
  return res.status(200).json({
    message: "successfully deleted brand",
  });
};

export const getAllBrandsFeatures = async (req, res) => {
  // Destructure query parameters
  const { page, size, sort, ...searchOptions } = req.query;

  // Apply pagination and filter based on search options
  const apiFeatures = new ApiFeatures(req.query, Brand.find())
    .pagination({
      page,
      size,
    })
    .filter(searchOptions)
    .sort(sort);

  // Log the page and size
  console.log(page + "" + size + "getAll");

  // Execute the query and return the brands
  const brands = await apiFeatures.mongooseQuery;
  return res.status(200).json({ brands });
};
