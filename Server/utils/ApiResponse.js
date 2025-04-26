class ApiResponse {
    constructor(
        message = 'Success',
        statusCode,
        data,
        error,
    ) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
        this.success = statusCode < 400;
    }
}

export default ApiResponse;