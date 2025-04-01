import multer from 'multer';

// it is used to store a file in server locally as middleware from form data 


// we created a diskstorage by specifying destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})


// Returns a Multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format.
export const upload = multer({ storage })


