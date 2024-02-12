export const validationHandler = (schema) => {
  const keys = ["body", "params", "query", "Headers"];
  return (req, res, next) => {
    let errorArray = [];
    for (const key of keys) {
      const validationResult = schema[key]?.validate(req[key], {
        abortEarly: false,
      });
      if (validationResult?.error) {
        errorArray.push(...validationResult.error.details);
      }
    }
    if (errorArray.length > 0) {
      return res.status(400).json({
        errorMessage: "validation error",
        error: errorArray.map((err) => err.message),
      });
    }
    next();
  };
};
