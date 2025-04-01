import { asyncHandler } from "../utils/asyncHandler.js  ";
import { ApiError } from '../utils/apiError.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

// Middleware Algo:
// Steps follow to check if user is authenticated or not 
// Step-1> we take cookies from req and get accessToken from req
// Step-2> if accesstoken is not there thats means user is not authenticated 
// Step-3> if we get accessToken use jwt.verify() to decode accessToken from access_Token_Seceret after decodedToken take out _id
// Step-4> find user by _id from colllection User.findById(decodedToken_id) and get user details except password and refreshToken by select("-password -refreshToken")
// Step-5 if user there add it into req.user = user if not throw error invalid accessToken
// Step-6 next() to pass control to next middleware function in the stack. Middleware functions are executed in sequence 

export const verifyJWT = asyncHandler(async (req, _, next) => {

  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
      throw new ApiError(401, "Invalid Access Token")
    }

    req.user = user;

    next()
  } catch (error) {

    throw new ApiError(401, error?.message || "Invalid access Token")

  }

})