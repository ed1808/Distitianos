import type { Schema } from '../../core/utils/validator/schemas/Schema';

export const categorySchema: Schema = {
  category_name: {
    type: 'string',
    required: true,
    minLength: 4,
  },
};
