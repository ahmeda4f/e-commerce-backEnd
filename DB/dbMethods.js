export const findDocument = async (model, query) => {
  const docFound = await model.findOne(query);
  if (docFound) {
    return { msg: `${docFound} found`, docFound, status: "success" };
  } else {
    return { msg: `${docFound} not found`, docFound, status: "failure" };
  }
};
