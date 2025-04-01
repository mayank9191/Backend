import mongoose from "mongoose";


// here we are not maintaining any array we create a new document or entries for each time when a subscriber subscribe any channel so we follows two approach to finds number of subscriber for a channel and number of subscribing to another channel :

// > if we want to find no of subscriber for a channel we finds the number of occurence of channel in collection thats obvious that if someone subscribe there a entry with channel name and subscriber userId so we can count no of occurence of channel or userId in channel column or feild

// > if we want to find no of subscribing for a channel we need to count the no of occurence of channel or userId in collection as same goes with a channel if it subscribe another channel it comes in the collection as no of occurence in subscriber column or feild

// created subscriptionSchema schema from 'mongoose.Schema()'
const subscriptionSchema = mongoose.Schema(
  {

    subscriber: {
      type: mongoose.Schema.Types.ObjectId, // user who is subscribing a channel
      ref: "User"
    },


    channel: {
      type: mongoose.Schema.Types.ObjectId, //To whom 'subscriber or user' subscribing basically channel which is subscribed by user
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
)


// exporting by creating a mongoose model from subscriptionSchema with name saved in lowercase with s at last

export const Subscription = mongoose.model("Subscription", subscriptionSchema)