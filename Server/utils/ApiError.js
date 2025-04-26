class ApiError extends Error {
    constructor(
        message = 'Something went wrong',
        statusCode,
        error = [],
        stack = '',
    ) {
        super(message);
        this.data = null;
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
        this.stack = stack;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;