export const globalResponse = (err, req, res, next) => {
  if (err) {
    console.log(err);
    console.log("hi");
    res.status(500).json({
      message: "global error",
      error: err.message,
    });
    next();
  }
};
