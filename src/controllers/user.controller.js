import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import { uploadonCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponses.js'
import jwt from 'jsonwebtoken'
import { response } from 'express'
import mongoose from 'mongoose'

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

  // console.log(req)

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

// login user
const loginUser = asyncHandler(async (req, res) => {
  // access token - short lived token(during authentication )
  // refresh token - long lived token(User sends refresh token to get a new access token.)

  //we have to login our user

  // take data email and password from user 
  // validate email and password
  // find the email in database by findOne()
  // if match take password and bcrypt compare it with hashed password if right give access token and refresh token
  // send cookies

  const { username, email, password } = req.body

  // console.log(email, password)

  if (!(email || username)) {
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

// logout user
const logoutUser = asyncHandler(async (req, res) => {

  // To logout user we first want to check whether user is authenticated or not then we delete the refresh token from database to logout and also clear cookies

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

// refresh access Token through refresh Token

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "invalid refresh token")
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

    const options = {
      httpOnly: true,
      secure: true
    }

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed")
      )

  } catch (error) {

    throw new ApiError(401, error?.message || "Invalid refresh token")

  }
})

// change the current password

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword && !newPassword) {
    throw new ApiError(400, "password is  not correct")
  }

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user?.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password")
  }

  user.password = newPassword

  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))

})

// get current user

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req?.user

  return res
    .status(200)
    .json(200, user, "current user fetched successfully")
}
)

// update Account Details 

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }

  const user = User.findByIdAndUpdate(
    res.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    {
      new: true
    }).select("-password")


  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

// update avatar image

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = res.files?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "file is not uploaded")
  }

  const avatar = await uploadonCloudinary(avatarLocalPath)

  if (!avatar) {
    throw new ApiError(500, "Internal server error")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {
      new: true
    })

  return res
    .status(200)
    .json(200, user, "user avatar is updated")
})

// update cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = res.files?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "file is not uploaded")
  }

  const coverImage = await uploadonCloudinary(coverImageLocalPath)

  if (!coverImage) {
    throw new ApiError(500, "Internal server error")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {
      new: true
    })

  return res
    .status(200)
    .json(200, user, "user cover image is updated")
})



// get user channel profile

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),

      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        channelSubscribedTocount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscriber.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelSubscriberCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  console.log(channel)

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "User channel fetched successfully"))
})


// get user watch history

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{
                $project: {
                  username: 1,
                  fullName: 1,
                  avatar: 1
                }
              }]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }]
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "watch history is fetched"))

})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory
}