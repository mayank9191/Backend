// Cloudinary is a cloud platform used to upload an image

import { v2 as cloudinary } from "cloudinary"
import fs from "fs" // file sysytem module in nodejs


// configuring cloudinary sdk
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// function to upload an file to cloudinary by localpath stored in public folder

const uploadonCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,
      { resource_type: "auto" },
    )

    // file has been uploaded successfully
    console.log("file is uploaded on cloudinary", response.url);
    // fs.unlinkSync() acts as delete or removal of file after upload successfully from local storage
    fs.unlinkSync(localFilePath)
    return response; // response contains detailed object about file uploaded

  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the local saved temporary file as the upload operation got failed

    return null;

  }
}

// function to delete the previous uploaded file from cloudinay by file publicId
const deleteonCloudinary = async (url, resourceType = "image") => {
  try {

    if (!url) return null

    const publicId = url.split("upload/")[1].split("/")[1].split(".")[0]

    if (!publicId) return null

    const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })

    console.log("previous file is deleted on cloudinary", response);

    return response //contains status of deletion 
  } catch (error) {
    console.log(error)
  }

}


export { uploadonCloudinary, deleteonCloudinary }


