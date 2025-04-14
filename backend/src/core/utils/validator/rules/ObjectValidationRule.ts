import type { Schema } from '../schemas/Schema';

export type ObjectValidationRule = {
  type: 'object';
  required?: boolean;
  properties?: Schema;
};
