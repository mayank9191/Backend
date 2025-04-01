// we created a class ApiResponse to send a structured object of api response during success of request

class ApiResponse {
  // constructor(){}
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = (statusCode < 400) // conditional assignment of success as pre-defined about status code
  }
}

export { ApiResponse }