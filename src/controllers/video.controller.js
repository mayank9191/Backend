import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import mongoose from "mongoose";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { deleteonCloudinary } from "../utils/cloudinary.js";
import { Video } from '../models/video.model.js'


// check whether request made by owner and return data founded
const checkOwner = async (model, findId, userId) => {
  try {

    const data = await model.findById(findId)

    if (!data || String(data.owner) !== String(userId)) {
      return false;
    }
    return data;


  } catch (error) {
    throw error
  }
}

// get all videos stored
const getAllVideos = asyncHandler(async (req, res) => {

  const {
    page = 1, // Default page number is 1 if not provided
    limit = 10, // Default limit per page is 10
    query = "",  // Default query is an empty string
    sortBy = "createdAt",  // Default sorting field is :createdAt
    sortType = "desc",  // Default sorting order is descending
    userId // User Id (optional to filter videos by a specific user) 
  } = req.query

  if (!req.user) {
    throw new ApiError(401, "user needs to be logged in");
  }

  const match = {
    ...(query ? { title: { $regex: query, $options: "i" } } : {}), // If query exists, match titles that contain the search term (case-insensitive)
    ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}), // If userId exists, filter videos by that owner
  }

  const videos = await Video.aggregate([
    {
      $match: match
    },
    {
      $lookup: {
        from: "user",
        localField: "owner",
        foreignField: "_id",
        as: "videoByOwner"
      }

    },
    {
      /*
        $project: Selecting only the necessary fields to return in the response

      */
      $project: {
        videoFile: 1, // Video file link
        thumbnail: 1, // Thumbnail image link
        title: 1, // Video title
        description: 1, // Video description
        duration: 1, // Video duration
        views: 1, // Number of views
        isPublished: 1, // Whether the video is published or not
        owner: {
          $arrayElemAt: ["$videosByOwner", 0], // Extracts the first user object from the array
        },
      },
    },

    {
      /*
        $sort: Sorting videos based on the specified field
        - If sortType is "desc", sort in descending order (-1)
        - If sortType is "asc", sort in ascending order (1)
      */
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
      },
    },

    {
      /*
        $skip: Skipping records for pagination
        - Formula: (page number - 1) * limit
        - If page = 2 and limit = 10, skips (2-1) * 10 = 10 records
      */
      $skip: (page - 1) * parseInt(limit),
    },

    {
      /*
        $limit: Limits the number of results per page
        - Ensures that the number of results does not exceed the "limit" value
      */
      $limit: parseInt(limit),
    },
  ])

  if (!videos?.length) {
    throw new ApiError(404, "Videos are not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));

})

// publish a video to cloudinary
const publishAVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  const { title, description, isPublished } = req.body

  if (!title || !description) {
    throw new ApiError(400, "Enter valid video details");
  }

  if (!userId) {
    throw new ApiError(401, "unauthorized access")
  }

  const videoLocalPath = req.files?.video?.[0]?.path || "";
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path || "";


  if (!(videoLocalPath || thumbnailLocalPath)) {
    throw new ApiError(400, "Both video and thumbnail files are required")
  }

  const video = await uploadonCloudinary(videoLocalPath)
  const thumbnail = await uploadonCloudinary(thumbnailLocalPath)

  if (!video?.url || !thumbnail?.url) {
    throw new ApiError(501, "Internal Server error while uploading")
  }

  const user = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    owner: userId,
    title: title,
    description: description,
    duration: video.duration,
    views: 0,
    isPublished: isPublished ?? false,
  })

  return res.status(200)
    .json(new ApiResponse(200, user, "video and thumbnail uploaded", "success"))

})

// get video by ID
const getVideoById = asyncHandler(async (req, res) => {

  const { v } = req.query

  if (!v || !mongoose.Types.ObjectId.isValid(v)) {
    throw new ApiError(400, "Invalid or missing video ID")
  }

  const video = await Video.findById(v)

  if (!video) {
    throw new ApiError(404, "video not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))

})

// update a video stored
const updateVideo = asyncHandler(async (req, res) => {

  const { v } = req.query
  const userId = req.user?._id

  if (!mongoose.Types.ObjectId.isValid(v)) {
    throw new ApiError(400, "video id missing")
  }

  const oldVideo = await checkOwner(Video, v, userId)

  if (!oldVideo) {
    throw new ApiError(404, "video not found or not authorized")
  }

  console.log(oldVideo)

  const { title, description, isPublished } = req.body

  const videoLocalPath = req.files?.video?.[0]?.path || ""
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path || ""

  if (!(videoLocalPath || thumbnailLocalPath)) {
    throw new ApiError(400, "file not found")
  }

  console.log(videoLocalPath, thumbnailLocalPath)

  let video = {}
  let thumbnail = {}

  if (videoLocalPath) {
    video = await uploadonCloudinary(videoLocalPath);
    await deleteonCloudinary(oldVideo.videoFile, "video");
  }

  if (thumbnailLocalPath) {
    thumbnail = await uploadonCloudinary(thumbnailLocalPath);
    await deleteonCloudinary(oldVideo.thumbnail);
  }

  const newVideo = await Video.findByIdAndUpdate(v,
    {
      $set: {
        videoFile: video.url || oldVideo.videoFile,
        thumbnail: thumbnail.url || oldVideo.thumbnail,
        owner: req.user._id,
        title: title || oldVideo.title,
        description: description || oldVideo.description,
        duration: video.duration || oldVideo.duration,
        views: oldVideo.views,
        isPublished: typeof isPublished === "boolean" ? isPublished : oldVideo.isPublished,
      }
    },
    {
      new: true
    }
  )

  // every time if i have to delete a video i have to specify resource type

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "video updated"))

})

// delete a video 
const deleteVideo = asyncHandler(async (req, res) => {
  const { v } = req.query
  const userId = req.user?._id

  if (!v || !mongoose.Types.ObjectId.isValid(v)) {
    throw new ApiError(400, "Invalid or missing video ID")
  }

  if (!await checkOwner(Video, v, userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  const deletedVideo = await Video.findByIdAndDelete(v)

  if (!deletedVideo) {
    throw new ApiError(404, "video not found")
  }

  if (deletedVideo.videoFile) {
    await deleteonCloudinary(deletedVideo.videoFile, "video");
  }
  if (deletedVideo.thumbnail) {
    await deleteonCloudinary(deletedVideo.thumbnail);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"))

})

// switch the publish status (wether true or false)
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { v } = req.query
  const { status } = req.body
  const userId = req.user?._id

  if (!v || !mongoose.Types.ObjectId.isValid(v)) {
    throw new ApiError(400, "video id not exist")
  }

  if (!await checkOwner(Video, v, userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  if (typeof status !== "boolean") {
    throw new ApiError(400, "status not defined")
  }

  const updatedVideo = await Video.findByIdAndUpdate(v,
    {
      $set: {
        isPublished: status
      }
    },
    {
      new: true
    }
  )

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, `Video publish status updated to ${status}`))
})


export {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}