import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Subscription } from '../models/subscription.model.js'


// toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {

})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}