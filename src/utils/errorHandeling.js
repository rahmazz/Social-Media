import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "./errorClass.js"; 
export const asyncHandeller = (controller) => {
  return (req, res, next) => {
    controller(req, res, next).catch((error) => {
      return next(new ErrorClass(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    });
  };
};

export const globalErrorHandelling = (error, req, res, next) => {
  return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: error.cause || "error",
    msgError: error.message,
    stack:error.stack
  });
};


