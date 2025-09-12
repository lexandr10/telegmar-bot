import "express";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      sub: string;
      email: string;
      roles: string[];
      iat?: number;
      exp?: number;
    };
    token?: string;
  }
}

import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    validated?: {
      query?: any;
      params?: any;
      body?: any;
    };
  }
}