class ForbiddenError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForbiddenError);
    }
    
    this.name = 'ForbiddenError';
    // Custom debugging information
    this.httpStatusCode = 403;
    this.statusCode = 403;
    this.date = new Date();
  }
}

module.exports = ForbiddenError;
