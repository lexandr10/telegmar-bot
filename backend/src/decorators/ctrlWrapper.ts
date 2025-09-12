import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const ctrlWrapper = (ctrl: AsyncController): RequestHandler => {
  const wrapper: RequestHandler = async (req, res, next) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  };
  return wrapper;
};

export default ctrlWrapper;
