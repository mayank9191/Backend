import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponses.js'
import { comment } from '../models/comment.model.js'
import mongoose from 'mongoose'



// to get all video comments
const getVideoComments = asyncHandler(async (req, res) => {

})

// to add comment to a video
const addComment = asyncHandler(async (req, res) => {


})


// update a comment to a video
const updateComment = asyncHandler(async (req, res) => {

})


// delete a comment to a video
const deleteComment = asyncHandler(async (req, res) => {

})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}