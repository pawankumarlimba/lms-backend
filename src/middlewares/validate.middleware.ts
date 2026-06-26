import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError as CVValidationError } from "class-validator";
import { ValidationError } from "@core/errors/ApiError";

type ClassConstructor<T> = new () => T;

function flattenErrors(errors: CVValidationError[]): Record<string, string[]> {
  const flattened: Record<string, string[]> = {};
  for (const err of errors) {
    if (err.constraints) {
      flattened[err.property] = Object.values(err.constraints);
    }
    if (err.children?.length) {
      Object.assign(flattened, flattenErrors(err.children));
    }
  }
  return flattened;
}

/**
 * validateBody(SomeDto) - drop this in front of any route. It guarantees
 * the controller only ever sees a strongly-typed, already-validated DTO
 * instance on req.body, so controllers never re-validate input themselves.
 */
export function validateBody<T extends object>(dtoClass: ClassConstructor<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(dtoClass, req.body, {
      enableImplicitConversion: true,
    });

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      return next(new ValidationError(flattenErrors(errors), "Validation failed"));
    }

    req.body = instance;
    next();
  };
}
