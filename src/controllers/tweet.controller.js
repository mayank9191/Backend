import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Tweet } from '../models/tweet.model.js'



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

// create tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  const userId = req.user?._id

  if (!userId) {
    throw new ApiError(403, "not authorized to access")
  }

  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new ApiError(400, "Tweet content is required and cannot be empty")
  }

  const tweet = await Tweet.create({
    owner: userId,
    content: content
  })

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet created successfully"))

})

// get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user Id not correct")
  }

  const userTweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 }) // sort function gives latest tweets first

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "tweets fetched successfully"))

})

// update tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  const { tweetId } = req.params
  const userId = req.user?._id

  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new ApiError(400, "tweet content is required and cannot be empty present")
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invaild or missing tweet Id")
  }

  if (!await checkOwner(Tweet, tweetId, userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  const newTweet = await Tweet.findByIdAndUpdate(tweetId,
    {
      $set: {
        content: content
      }
    },
    {
      new: true
    }
  )

  if (!newTweet) {
    throw new ApiError(404, "tweet not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "tweet updated successfully"))
})

// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {

  const { tweetId } = req.params
  const userId = req.user?._id

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "tweet id not correct")
  }

  if (!await checkOwner(Tweet, tweetId, userId)) {
    throw new ApiError(403, "not authorized to access")
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "tweet successfully deleted"))

})


export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}