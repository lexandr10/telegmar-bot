import { Request, Response, NextFunction } from "express";

const emptyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { length } = Object.keys(req.body);
  if (!length) {
    return next({ status: 404, message: "we can`t create empty obj" });
  }
  next();
};

export default emptyMiddleware;
