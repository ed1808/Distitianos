import { HttpStatusCode } from '../../router/utils/HttpStatusCodes';
import { Validator } from '../../utils/validator/Validator';
import type { Schema } from '../../utils/validator/schemas/Schema';
import type { ValidationResult } from '../../utils/validator/types/ValidationResult';

export function validateBody(
  schema: Schema
): (context: { req: Request }) => Promise<Response | null> {
  return async (context: { req: Request }) => {
    try {
      const body = await context.req.json();
      const result: ValidationResult = Validator.validate(body, schema);

      if (!result.valid) {
        return Response.json(
          { message: 'Wrong input data', details: result.errors },
          {
            status: HttpStatusCode.BAD_REQUEST,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      (context as any).body = body;

      return null;
    } catch (error) {
      return Response.json(
        { message: 'Invalid JSON' },
        {
          status: HttpStatusCode.BAD_REQUEST,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

export function validateQuery(
  schema: Schema
): (context: { query: Record<string, string> }) => Response | null {
  return (context: { query: Record<string, string> }) => {
    const result: ValidationResult = Validator.validate(context.query, schema);

    if (!result.valid) {
      return Response.json(
        { message: 'Invalid query params', details: result.errors },
        {
          status: HttpStatusCode.BAD_REQUEST,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return null;
  };
}

export function validateParams(schema: Schema) {
  return (context: { params: Record<string, string> }) => {
    const result: ValidationResult = Validator.validate(context.params, schema);

    if (!result.valid) {
      return Response.json(
        { message: 'Invalid route params', details: result.errors },
        {
          status: HttpStatusCode.BAD_REQUEST,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return null;
  };
}
