import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import { uploadonCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponses.js'

const generateAccessAndRefreshTokens = async (userId) => {
  try {

    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")

  }

}


// register user
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation on the user submitted data - not empty
  // check if user not already exists - check by ussername,email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body

  console.log(req)

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Email is not correct")

  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  // console.log(req.files)

  const avatarLocalPath = req.files?.avatar[0]?.path

  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  // response comming from cloudinary 
  const avatar = await uploadonCloudinary(avatarLocalPath)
  const coverImage = await uploadonCloudinary(coverImageLocalPath)

  // console.log(avatar)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select("-password")


  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered Successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {
  // access token - short lived token(during authentication )
  // refresh token - long lived token(User sends refresh token to get a new access token.)

  //we have to login our user

  // take data email and password from user 
  // validate email and password
  // find the email in database by findOne()
  // if match take password and bcrypt compare it with hashed password if right give access token and refresh token
  // send cookies

  const { email, username, password } = req.body

  if (!email || !username) {
    throw new ApiError(400, "username or email is required")
  }



  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)


  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
      },
        "User loggedIn Successfully")
    )













})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logout"))
})

export { registerUser, loginUser, logoutUser }