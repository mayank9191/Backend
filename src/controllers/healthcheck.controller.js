import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";


// build a healthcheck response that simply returns the OK status as json with a message

const healthcheck = asyncHandler(async (req, res) => {

  return res
    .status(200)
    .json(new ApiResponse(200, "OK", `Server is healthy and running fine 🚀 ${new Date()}`))


})

export {
  healthcheck
}
