import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Tweet } from '../models/tweet.model.js'



// check whether request made by owner 
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

  if (!content) {
    throw new ApiError(400, "tweet content not present")
  }

  const tweet = await Tweet.create({
    owner: req.user?._id,
    content: content
  })

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"))

})

// get user tweets
const getUserTweets = asyncHandler(async (req, res) => {


})

// update tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  const { tweetId } = req.params

  if (!content) {
    throw new ApiError(400, "tweet content not present")
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

  if ((await Tweet.findById(tweetId))?.owner !== req.user?._id) {
    throw new ApiError(403, "not authorized")
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "tweet id not correct")
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