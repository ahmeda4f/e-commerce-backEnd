import cloudinaryConnection from "../Utils/cloudinary.js";

export const rollbackUplpadedFiles = async (req, res, next) => {
  console.log("rollback Uplpaded Files");
  console.log(req.folder + " Uplpaded files");
  if (req.folder) {
    await cloudinaryConnection().api.delete_resources_by_prefix(req.folder);
    await cloudinaryConnection().api.delete_folder(req.folder);
    next();
  }
  next();
};
