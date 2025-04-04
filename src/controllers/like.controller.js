import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Like } from '../models/like.model.js'


// toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {

})


// toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {

})

// toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {

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

