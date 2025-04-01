import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'


// function to connect to database(mongoose.connect(DB_URL/DB_NAME) return connection instance object)

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    // console.log(connectionInstance)
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)

  } catch (error) {
    console.log("MONGODB connection FAILED", error)
    process.exit(1)
  }

}

export default connectDB