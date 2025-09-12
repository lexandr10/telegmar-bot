const messageList: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
};

interface HttpErrorType extends Error {
  status?: number;
}

const HttpError = (
  status: number,
  message: string = messageList[status]
): HttpErrorType => {
  const error = new Error(message) as HttpErrorType;
  error.status = status;
  return error;
};

export default HttpError;
