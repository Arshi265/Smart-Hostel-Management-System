import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const roleMiddleware = (...allowedRoles) => {
  return asyncHandler(async (req, _, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  });
};    

export default roleMiddleware;