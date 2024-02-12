export const rollbackSavedDocument = async (req, res, next) => {
  console.log(" rollback saved document");
  if (req.savedDocument) {
    console.log("hello rollback saved document");
    const { model, _id } = req.savedDocument;
    console.log(model, _id);
    await model.findByIdAndDelete(_id);
    next();
  }
  next();
};
