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

  const existingVideoLike = await Like.findOne({ video: videoId, likedBy: userId })

  if (existingVideoLike) {
    await existingVideoLike.deleteOne() // if i find already liked a video by user it delete it from document or user disliked a video

    return res
      .status(200)
      .json(new ApiResponse(200, null, "video disliked successfully"))

  }

  const newVideoLike = await Like.create({
    video: videoId,
    likedBy: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newVideoLike, "video liked successfully"))

})


// toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "video id not valid")
  }

  const existingCommentLike = await Like.findOne({ comment: commentId, likedBy: userId })

  if (existingCommentLike) {
    await existingCommentLike.deleteOne()

    return res
      .status(200)
      .json(new ApiResponse(200, null, "comment disliked successfully "))
  }

  const newCommentLike = await Like.create({
    comment: commentId,
    likedBy: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newCommentLike, "comment liked successfully"))

})

// toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "video id not valid")
  }

  const existingTweetLike = await Like.findOne({ tweet: tweetId, likedBy: userId })

  if (existingTweetLike) {
    await existingTweetLike.deleteOne()

    return res
      .status(200)
      .json(new ApiResponse(200, null, "tweet disliked successfully"))

  }

  const newTweetLike = await Like.create({
    tweet: tweetId,
    likedBy: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newTweetLike, "tweet liked successfully"))

})


// get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  const likedVideosByUser = await Like.find({ likedBy: userId, video: { $exists: true } }).populate("video")

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideosByUser, "video liked by user fetched successfully"))
})


export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}

