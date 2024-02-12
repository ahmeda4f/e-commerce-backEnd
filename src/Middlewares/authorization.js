import jsonwebtoken from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";

export const authorization = (accessRoles) => {
  return async (req, res, next) => {
    try {
      const { token } = req.headers;
      if (!token) {
        return res.status(400).json({
          message: "please login first",
        });
      }
      const decoded = jsonwebtoken.verify(token, "secret");
      if (!decoded || !decoded.id) {
        return res.status(400).json({
          message: "Invalid token payload",
        });
      }
      const userFound = await User.findOne({ _id: decoded.id });
      if (!userFound) {
        return res.status(404).json({
          message: " no user found",
        });
      }
      if (!accessRoles.includes(userFound.role)) {
        return res.status(401).json({
          message: "user not authorized to do that action",
        });
      }
      req.userFound = userFound;
      next();
    } catch (err) {
      next(err);
    }
  };
};
