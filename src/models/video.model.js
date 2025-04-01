import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// creating video schema from mongoose.Schema()
const videoSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId, // take from user collection
    ref: "User"
  },
  videoFile: {
    type: String, // cloudinary url
    required: true,
  },
  thumbnail: {
    type: String, // cloudinary url
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
}, { timestamps: true })


// Pagination is the process of dividing large sets of data into smaller chunks (pages) to improve performance, efficiency, and user experience when displaying data in an application.

// Instead of fetching all the records at once, pagination retrieves a specific number of records per request, reducing load time and memory usage.

// It is a pagination plugin for Mongoose aggregation queries. It helps paginate large datasets efficiently when using MongoDB's aggregation framework.

//  Why use it?

// Handles large datasets efficiently

// Provides an easy-to-use pagination structure

// Works with Mongoose's aggregation pipeline

videoSchema.plugin(mongooseAggregatePaginate)

// exporting by creating mongoose.model from videoSchema and name goes all in lowercase and s at last
export const Video = mongoose.model("Video", videoSchema)