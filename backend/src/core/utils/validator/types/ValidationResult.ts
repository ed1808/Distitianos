import type { ValidationError } from './ValidationError';

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};
