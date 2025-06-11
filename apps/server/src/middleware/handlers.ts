import { Request, Response, NextFunction } from 'express';

// Middleware for logging requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

// Middleware for handling "Not Found" errors
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
};


// Middleware for handling errors
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  console.error(err.stack);
  
  notFoundHandler(req, res);
}; 