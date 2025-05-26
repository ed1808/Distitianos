import type { Schema } from '../../core/utils/validator/schemas/Schema';

export const citySchema: Schema = {
  city_name: {
    type: 'string',
    required: true,
  },
  city_code: {
    type: 'string',
    required: true,
  },
  department_id: {
    type: 'number',
    required: true,
  },
};

export const cityUpdateSchema: Schema = {
  city_name: {
    type: 'string',
    required: false,
  },
  city_code: {
    type: 'string',
    required: false,
  },
};
