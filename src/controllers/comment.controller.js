import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponses.js'
import { Comment } from '../models/comment.model.js'
import mongoose from 'mongoose'


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
// to get all video comments
const getVideoComments = asyncHandler(async (req, res) => {

  const { videoId } = req.query

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video id is not valid")
  }

  const comments = await Comment.find({ video: videoId }).sort({ createdAt: -1 })

  res
    .status(200)
    .json(new ApiResponse(200, comments, "video comments fetched"))
})

// to add comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { content, videoId } = req.body
  const userId = req.user?._id

  if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "video id is not valid")
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "content is not present")
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not accessed to authorized")
  }

  const newComment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: userId
  })

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "comment created successfully"))
})


// update a comment to a video
const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body
  const { commentId } = req.params
  const userId = req.user?._id

  if (!content || content.trim() === "") {
    throw new ApiError(400, "content is not present")
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "not authorized to access or comment not found")
  }

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "comment id not valid")
  }

  const oldComment = await checkOwner(Comment, commentId, userId)

  if (!oldComment) {
    throw new ApiError(403, "not authorized to access or comment not found")
  }

  oldComment.content = content.trim()

  await oldComment.save()

  return res
    .status(200)
    .json(new ApiResponse(200, oldComment, "comment updated successfully"))

})


// delete a comment to a video
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const userId = req.user?._id

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(403, "user id is not valid")
  }

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "comment id not valid")
  }

  const oldComment = await checkOwner(Comment, commentId, userId)

  if (!oldComment) {
    throw new ApiError(403, "not authorized to access or comment not found")
  }

  await Comment.findByIdAndDelete(commentId)

  return res
    .status(200)
    .json(new ApiResponse(200, oldComment, "comment deleted successfully"))
})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}