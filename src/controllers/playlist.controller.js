import mongoose from "mongoose";
import { Playlist } from '../models/playlist.model.js'
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// create playlist
const createPlaylist = asyncHandler(async (req, res) => {

})

// get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {

})



// get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {

})


// add video to  playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {

})


// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

})

// delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {

})

// update playlist
const updatePlaylist = asyncHandler(async (req, res) => {

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