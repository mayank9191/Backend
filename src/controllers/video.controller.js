import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import mongoose from "mongoose";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { deleteonCloudinary } from "../utils/cloudinary.js";
import { Video } from '../models/video.model.js'

// get all videos stored
const getAllVideos = asyncHandler(async (req, res) => {

})

// publish a video to cloudinary
const publishAVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  const { title, description, isPublished } = req.body

  if ([title, description, isPublished].some((feild) => feild?.trim === ""
  )) {
    throw new ApiError(400, "enter video details")
  }

  if (!userId) {
    throw new ApiError(402, "unauthorized access")
  }

  const videoLocalPath = req.files?.video[0]?.path
  const thumbnailLocalPath = req.files.thumbnail[0].path

  if (!(videoLocalPath || thumbnailLocalPath)) {
    throw new ApiError(400, "file not found")
  }

  const video = await uploadonCloudinary(videoLocalPath)
  const thumbnail = await uploadonCloudinary(thumbnailLocalPath)

  if (!(video || thumbnail)) {
    throw new ApiError(501, "Internal Server error while uploading")
  }

  const user = Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    owner: userId,
    title: title,
    description: description,
    duration: video.duration,
    views: 0,
    isPublished: isPublished,
  })

  return res.status(200)
    .json(new ApiResponse(200, "video and thumbnail uploaded", "success"))

})

// get video by ID
const getVideoById = asyncHandler(async (req, res) => {

  const { v } = req?.query

  if (!mongoose.Types.ObjectId.isValid(v)) {
    throw new ApiError(400, "video id missing")
  }

  const video = await Video.findById(v)

  if (!video) {
    throw new ApiError(404, "video not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video founded"))

})

// update a video stored
const updateVideo = asyncHandler(async (req, res) => {

  const { v } = req.query

  if (!mongoose.Types.ObjectId.isValid(v)) {
    throw new ApiError(400, "video id missing")
  }

  const { title, description, isPublished } = req.body

  if ([title, description, isPublished].some((field) => field === undefined)) {
    throw new ApiError(400, "details about videop missing")
  }

  const videoLocalPath = req.files?.video[0]?.path || ""
  const thumbnailLocalPath = req.files.thumbnail[0].path || ""

  if (!(videoLocalPath || thumbnailLocalPath)) {
    throw new ApiError(400, "file not found")
  }

  console.log(videoLocalPath, thumbnailLocalPath)

  const video = await uploadonCloudinary(videoLocalPath)
  const thumbnail = await uploadonCloudinary(thumbnailLocalPath)

  const oldVideo = await Video.findById(v)

  if (!oldVideo) {
    throw new ApiError(404, "video not found")
  }

  console.log(oldVideo)

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
        isPublished: isPublished || oldVideo.isPublished,
      }
    },
    {
      new: true
    }
  )

  //
  await deleteonCloudinary(oldVideo.videoFile)
  await deleteonCloudinary(oldVideo.thumbnail)

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "video updated"))

})

// delete a video 
const deleteVideo = asyncHandler(async (req, res) => {

})

// switch the publish status (wether true or false)
const togglePublishStatus = asyncHandler(async (req, res) => {

})


export {
  publishAVideo,
  getAllVideos,
  getVideoById,
  updateVideo
}