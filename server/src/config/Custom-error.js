class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
