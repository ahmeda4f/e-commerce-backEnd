import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import slugify from "slugify";

import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/subCategory.model.js";
import Brand from "../../../DB/Models/brand.model.js";

import generateUniqueFileName from "../../Utils/generateUniqueString.js";
import cloudinaryConnection from "../../Utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addSubCategory = async (req, res, next) => {
  const { name } = req.body;
  const { _id } = req.userFound;
  const { categoryId } = req.params;
  const categoryFound = await Category.findOne({ _id: categoryId });

  if (!categoryFound) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  console.log(_id);
  // console.log(req.userFound);
  const subCategoryFound = await SubCategory.findOne({ name });
  if (subCategoryFound) {
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
      folder: `${process.env.MAIN_FOLDER}/Categories/${categoryFound.folderId}/SubCategories/${folderId}`,
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

  const newSubCategory = {
    name,
    slug,
    image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    categoryId: categoryFound._id,
  };
  console.log(newSubCategory.addedBy);
  const subCategoryAdded = await SubCategory.create(newSubCategory);
  if (!subCategoryAdded) {
    return res.status(400).json({
      message: "Error creating category",
    });
  }
  return res.status(200).json({
    message: "SubCategory added successfully",
    category: newSubCategory,
  });
};

export const getAllSubCategories = async (req, res) => {
  const subCategories = await SubCategory.find().populate([
    {
      path: "Brands",
    },
  ]);
  console.log(subCategories);
  if (!subCategories) {
    return res.status(204).json({
      message: "no subCategories found",
    });
  }
  return res.status(200).json({
    message: "subCategories found",
    subCategories,
  });
};

export const updateSubCategory = async (req, res, next) => {
  const user = req.userFound;
  const { name, oldPublicId } = req.body;
  const { subCategoryId } = req.params;
  const subCategoryFound = await SubCategory.findOne({ _id: subCategoryId });
  if (!subCategoryFound) {
    return res.status(404).json({
      message: "SubCategory not found",
    });
  }

  if (name) {
    if (name == subCategoryFound.name) {
      return res.status(409).json({
        message: "SubCategory name didn't change",
      });
    }
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(409).json({
        message: "category name already exists",
      });
    }
    subCategoryFound.name = name;
    const slug = slugify(name, "-");
    subCategoryFound.slug = slug;
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
    const newPublicId = oldPublicId.split(`${subCategoryFound.folderId}/`)[1];
    const category = await Category.findOne({
      _id: subCategoryFound.categoryId,
    });
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(tempFilePath, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${subCategoryFound.folderId}`,
        public_id: newPublicId,
      });
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });

    subCategoryFound.image.secure_url = secure_url;
    subCategoryFound.image.public_id = public_id;
  }
  subCategoryFound.updatedBy = user._id;
  const updatedSubCategory = await subCategoryFound.save();
  if (!updatedSubCategory) {
    return res.status(400).json({
      message: "error updating subcategory",
    });
  }
  return res.status(200).json({
    message: "subcategory updated successfully",
    updatedSubCategory,
  });
};

export const deleteSubCategory = async (req, res) => {
  const user = req.userFound;
  const { subCategoryId } = req.params;

  const subCategory = await SubCategory.findOne({
    _id: subCategoryId,
  });
  if (!subCategory) {
    return res.status(400).json({
      message: "error deleting subcategory",
    });
  }
  const brandsDeleted = await Brand.deleteMany({ subCategoryId });
  if (brandsDeleted.length <= 0) {
    console.log("no related brands");
  }
  const category = await Category.findOne({
    _id: subCategory.categoryId,
  });
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`
  );

  const subCategoryDeleted = await SubCategory.findByIdAndDelete({
    _id: subCategoryId,
  });
  if (subCategoryDeleted)
    return res.status(200).json({
      message: " subcategory Deleted Successfully",
    });
};
