import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Subscription } from '../models/subscription.model.js'


// toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {

  const userId = req.user?._id
  const { channelId } = req.params // channel id is same as userId of some other user published video


  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user id not valid")
  }

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "channel id not valid")
  }

  // user cannot subscribe to his own channel

  if (userId.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId })

  // already subscribed we have to unsuscribe the channel
  if (existingSubscription) {
    await existingSubscription.deleteOne()

    return res
      .status(200)
      .json(new ApiResponse(200, null, "unsubscribed from channel successfully"))

  }

  const newSubscription = await Subscription.create({ subscriber: userId, channel: channelId })

  return res
    .status(200)
    .json(new ApiResponse(200, newSubscription, "subscribed to channel successfully"))

})


// controller to return subscriber list of a channelId
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

  const { channelId } = req.params

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "channel id not valid")
  }

  const channelSubscriber = await Subscription.find({ channel: channelId }).select("subscriber -_id")

  return res
    .status(200)
    .json(new ApiResponse(200, channelSubscriber, "channel subscribers fetched successfully"))

})


// controller to return channelId list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

  const { subscriberId } = req.params

  if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "subscriber id not valid")
  }

  const channelSubscribed = await Subscription.find({ subscriber: subscriberId }).select("channel -_id")


  return res
    .status(200)
    .json(new ApiResponse(200, channelSubscribed, "channels subscribed fetched successfully"))


})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}