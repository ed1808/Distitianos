import type { Schema } from '../validator/schemas/Schema';

export const numericIdParamSchema: Schema = {
  id: {
    type: 'number',
    required: true,
  },
};
