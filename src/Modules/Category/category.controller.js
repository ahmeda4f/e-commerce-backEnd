import fs from "fs";
import util from "util";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import slugify from "slugify";

import generateUniqueFileName from "../../Utils/generateUniqueString.js";
import cloudinaryConnection from "../../Utils/cloudinary.js";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/subCategory.model.js";
import Brand from "../../../DB/Models/brand.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addCategory = async (req, res, next) => {
  const { name } = req.body;
  const { _id } = req.userFound;
  console.log(_id);
  // console.log(req.userFound);
  const categoryFound = await Category.findOne({ name });
  if (categoryFound) {
    return res.status(409).json({
      message: "category already exists",
    });
  }
  const slug = slugify(name, "-");

  const writeFile = util.promisify(fs.writeFile);
  const tempFilePath = path.join(__dirname, `${name}`);
  await writeFile(tempFilePath, req.file.buffer);
  const folderId = generateUniqueFileName(4);

  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(tempFilePath, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`,
    });
  fs.unlink(tempFilePath, (err) => {
    if (err) console.error("Error deleting temporary file:", err);
  });
  if (!req.file) {
    return res.status(400).json({
      message: "you must upload image",
    });
  }
  // console.log(secure_url + " " + public_id + name + _id + slug + folderId);
  const category = {
    name,
    slug,
    image: { secure_url, public_id },
    folderId,
    addedBy: _id,
  };
  req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`;
  const x = 9;
  x = 8;
  const categoryAdded = await Category.create(category);

  req.savedDocument = { model: Category, _id: categoryAdded._id };

  if (!categoryAdded) {
    return res.status(400).json({
      message: "Error creating category",
    });
  }

  return res.status(200).json({
    message: "Category added successfully",
    category: categoryAdded,
  });
};

export const updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const { oldPublicId } = req.body;
  const { categoryId } = req.params;
  const { _id } = req.userFound;
  console.log(_id);
  // console.log(req.userFound);
  const categoryFound = await Category.findOne({ _id: categoryId });
  if (!categoryFound) {
    return res.status(404).json({
      message: "category not found",
    });
  }
  if (name) {
    if (name == categoryFound.name)
      return res
        .status(409)
        .json({ message: "category name did not change , enter new name" });

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(409).json({
        message: "category name already exists",
      });
    }
    const slug = slugify(name, "-");
    categoryFound.name = name;
    categoryFound.slug = slug;
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
    const newPublicId = oldPublicId.split(`${categoryFound.folderId}/`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(tempFilePath, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${categoryFound.folderId}`,
        public_id: newPublicId,
      });
    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });
    categoryFound.image.secure_url = secure_url;
    categoryFound.image.public_id = public_id;
  }
  categoryFound.updatedBy = _id;
  const updatedCategory = await categoryFound.save();
  console.log(categoryFound.addedBy);
  if (!updatedCategory) {
    return res.status(400).json({
      message: "Error updating category",
    });
  }
  return res.status(200).json({
    message: "Category updated successfully",
    category: updatedCategory,
  });
};
export const getAllCategories = async (req, res) => {
  const categories = await Category.find().populate({
    path: "subCategories",
    populate: {
      path: "Brands",
    },
  });

  console.log(categories);
  if (!categories) {
    return res.status(204).json({
      message: "no categories found",
    });
  }
  return res.status(200).json({
    message: "categories found",
    categories,
  });
};

export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const categoryDeleted = await Category.findOneAndDelete({ _id: categoryId });
  if (!categoryDeleted) {
    return res.status(404).json({
      message: "category not found",
    });
  }
  const subCategoriesDeleted = await SubCategory.deleteMany({ categoryId });
  if (subCategoriesDeleted.length <= 0) {
    console.log("no related sub categories");
  }
  const brandsDeleted = await Brand.deleteMany({ categoryId });
  if (brandsDeleted.length <= 0) {
    console.log("no related brands");
  }
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${categoryDeleted.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${categoryDeleted.folderId}`
  );
  return res.status(200).json({
    message: " Category Deleted Successfully",
  });
};
