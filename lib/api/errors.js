export class ApiError extends Error {
  constructor(message, { status, data, requestId } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.requestId = requestId;
  }
}
