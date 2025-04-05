import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"



// Get the channel stats like total video views, total subscribers, total videos, total likes etc.

const getChannelStats = asyncHandler(async (req, res) => {

})



// Get all the videos uploaded by the channel

const getChannelVideos = asyncHandler(async (req, res) => {

})


export {
  getChannelStats,
  getChannelVideos
}