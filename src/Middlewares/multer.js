import multer from "multer";
import generateUniqueFileName from "../Utils/generateUniqueString.js";
import { allowedExtensions } from "../Utils/allowedExtensions.js";
import fs from "fs";
import path from "path";
export const multerMiddleHost = ({ extensions }) => {
  const fileFilter = (req, file, cb) => {
    if (extensions.includes(file.mimetype.split("/")[1])) {
      return cb(null, true);
    }
    cb(
      new Error(file.mimetype.split("/")[1] + " is not a valid format"),
      false
    );
  };

  return multer({ fileFilter });
};
