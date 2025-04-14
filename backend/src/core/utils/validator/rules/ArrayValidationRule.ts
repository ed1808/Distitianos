import type { SchemaField } from '../schemas/SchemaField';

export type ArrayValidationRule = {
  type: 'array';
  required?: boolean;
  minItems?: number;
  maxItems?: number;
  items?: SchemaField;
};
