import mongoose from "mongoose";



const subscriptionSchema = mongoose.Schema(
  {
    subscriber: [{
      type: mongoose.Schema.Types.ObjectId, // one who is subscribing
      ref: "User"
    }],
    channel: {
      type: mongoose.Schema.Types.ObjectId, // one to whom 'subscriber' subscribing
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)