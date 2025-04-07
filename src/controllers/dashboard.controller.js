import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"



// Get the channel stats like total video views, total subscribers, total videos, total likes etc.

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.query

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "channel id is not valid")
  }

  // channel total video views through aggregation pipeline

  const channelTotalVideoViewsAgg = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(channelId) } // match the feild required
    },
    {
      $group: { // group all videos founded views and save in totalViews by summing $views feild
        _id: null,
        totalViews: { $sum: "$views" }
      }
    }

  ])

  // channel total subscribers

  const channelTotalSubscriberAgg = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $group: {
        _id: null,
        totalSubscriber: {
          $sum: 1 // "$sum: 1" is used inside a "$group" stage to count documents. It adds 1 for each document that passes through the pipeline 
        }
      }
    }
  ])

  // channel total video videos

  const channelTotalVideosAgg = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(channelId) }
    },
    {
      $group: {
        _id: null,
        totalVideos: {
          $sum: 1
        }
      }
    }
  ])

  // channel total videos likes

  const channelTotalVideoLikesAgg = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likedVideos"
      }
    },
    {
      $project: {
        likesCount: { $size: "$likedVideos" }
      }
    },
    {
      $group: {
        _id: null,
        totalVideoLikes: {
          $sum: "$likesCount"
        }
      }
    }
  ])

  const channelStats = {
    totalVideoViews: channelTotalVideoViewsAgg[0]?.totatViews || 0,
    totalSubscriberCount: channelTotalSubscriberAgg[0]?.totalSubscriber || 0,
    totalVideos: channelTotalVideosAgg[0]?.totalVideos || 0,
    totalVideoLikes: channelTotalVideoLikesAgg[0]?.totalVideoLikes || 0
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channelStats, "channel stats fetched successfully"))

})



// Get all the videos uploaded by the channel

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.query

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "channel id is not valid")
  }

  const channelVideos = await Video.find({
    owner: channelId,
    isPublished: true
  }).sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, channelVideos, "channel all videos fetched successfully"))


})


export {
  getChannelStats,
  getChannelVideos
}