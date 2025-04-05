import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Like } from '../models/like.model.js'


// toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video id not valid")
  }

  const likeStatus = await Like.create({
    video: videoId,
    likedBy: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Video liked"))

})


// toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video id not valid")
  }

  const likeStatus = await Like.create({
    video: videoId,
    likedBy: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Video liked"))

})

// toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video id not valid")
  }

  const likeStatus = await Like.create({
    video: videoId,
    likedBy: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Video liked"))

})


// get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {

})


export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}

