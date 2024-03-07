import Joi from "joi";

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required().alphanum(),
    couponAmount: Joi.number().required().min(1),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
    isFixed: Joi.boolean(),
    isPercentage: Joi.boolean(),
    Users: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
        maxUsage: Joi.number().required().min(1),
      })
    ),
  }),
};
