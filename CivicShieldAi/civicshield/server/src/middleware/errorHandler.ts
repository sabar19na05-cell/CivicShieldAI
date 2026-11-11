import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Catches errors from async route handlers without try/catch boilerplate everywhere.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message =
    status === 500 ? "Something went wrong on our end. Please try again." : err.message || "Request failed.";
  if (status === 500) {
    console.error("[CivicShieldAI] Unhandled error:", err);
  }
  res.status(status).json({ message });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `No route matches ${req.method} ${req.originalUrl}` });
}
