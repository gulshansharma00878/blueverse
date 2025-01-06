import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Request, Response, NextFunction } from 'express';

function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoObject = plainToClass(dtoClass, req.body);
      const errors = await validate(dtoObject);
      
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      next();
    } catch (error) {
      console.error('Error in DTO validation middleware:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
}

export { validateDto };
