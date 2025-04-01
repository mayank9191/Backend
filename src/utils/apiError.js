// here we are creating custom error claass which inherits from Error class in javascript so which we create object error from here and throw it 

class ApiError extends Error {
  // constructor function called at time of creation of object taking parameters constructor(){}
  constructor(
    statusCode,
    message = "Something went wrong",// Default
    error = {},
    stack = ""
  ) {
    super(message) // Calls the parent class Error constructor to set the message property inherited from the Error class.
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false;
    this.errors = error

    // stack trace handling if given by user take that else by Error Class method captureStackTrace()
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }

  }
}

export { ApiError }