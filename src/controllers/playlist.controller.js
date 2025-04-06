import mongoose from "mongoose";
import { Playlist } from '../models/playlist.model.js'
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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


// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new ApiError(400, "Playlist name is required");
  }

  if (!description || typeof description !== "string" || description.trim() === "") {
    throw new ApiError(400, "Playlist description is required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description,
    owner: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"))

})

// get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  const userPlaylist = await Playlist.find({ owner: userId }).sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "user playlist fetched"))

})


// get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(400, "playlist not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"))
})


// add video to  playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId } = req.body
  const { playlistId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID")
  }

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }

  const oldPlaylist = await checkOwner(Playlist, playlistId, userId)

  if (!oldPlaylist) {
    throw new ApiError(403, "not authorized to access or playlist not found")
  }

  if (oldPlaylist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in the playlist");
  }

  oldPlaylist?.videos.push(videoId)
  await oldPlaylist.save()

  return res
    .status(201)
    .json(new ApiResponse(201, oldPlaylist.videos, "video added to the playlist"))

})


// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {

    throw new ApiError(400, "playllist Id not valid")
  }

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video Id not valid")
  }

  const oldPlaylist = await checkOwner(Playlist, playlistId, userId)

  if (!oldPlaylist.videos.includes(videoId)) {
    throw new ApiError(404, "video not found in playlist or not authorized to add video")
  }

  oldPlaylist.videos = oldPlaylist.videos.filter(id => id.toString() != videoId.toString())

  await oldPlaylist.save()

  return res
    .status(200)
    .json(new ApiResponse(200, oldPlaylist, "video deleted successfully "))

})

// delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }

  const playlistToDelete = await checkOwner(Playlist, playlistId, userId)

  if (!playlistToDelete) {
    throw new ApiError(404, "playlist not found or not authorized")
  }

  await Playlist.findByIdAndDelete(playlistId)

  return res
    .status(200)
    .json(new ApiResponse(200, playlistToDelete, "playlist deleted successfully"))

})

// update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const { playlistId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID")
  }

  if (!name && !description) {
    throw new ApiError(400, "At least one field is required to update");
  }

  if ((name && name.trim() === "") || (description && description.trim() === "")) {
    throw new ApiError(400, "Name and description cannot be empty");
  }

  const oldPlaylist = await checkOwner(Playlist, playlistId, userId)

  if (!oldPlaylist) {
    throw new ApiError(404, "playlist not found or not authorized")
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    $set: {
      name: name.trim() || oldPlaylist?.name,
      description: description.trim() || oldPlaylist?.description
    }
  },
    {
      new: true

    }
  )

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "playlist updated successfully"))
})

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}