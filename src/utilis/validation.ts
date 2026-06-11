import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';
import { StatusCodes } from 'http-status-codes';

export function validateData(
  schema: ZodTypeAny,
  source: 'body' | 'query' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = source === 'query' ? req.query : req.body ?? {};
      const parsed = schema.parse(payload);

      if (source === 'query') {
        (req as Request & { validatedQuery?: unknown }).validatedQuery = parsed;
      } else {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }));
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid data', details: errorMessages });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
      }
    }
  };
}