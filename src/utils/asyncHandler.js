// it is a higher order function thats acts as a wrapper on another async function

// So asyncHandler function takes an async function and returns a new function that calls requestHandler(res,req,next)

// In Express, if an async function inside a route handler throws an error, it does not automatically pass to the error-handling middleware. This function ensures that all errors in asynchronous code are caught and forwarded properly.

// Advantage of asycHandler
// Avoids try-catch blocks in every async route handler.
// Automatically forwards errors to Express error-handling middleware.
// Keeps code clean and readable.

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    //     This ensures that requestHandler always returns a Promise, even if it's a normal function.

    // If requestHandler is an async function, it already returns a Promise, but this ensures consistency.

    // If an error occurs inside requestHandler, the Promise will be rejected.
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))

    // .catch((err) => next(err)) catches that error and forwards it to the next middleware using next(err).

    // This allows Express's error-handling middleware to process the error instead of the app crashing.
  }
}

export { asyncHandler }

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// Another method to create an asyncHandler function
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next)

//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }