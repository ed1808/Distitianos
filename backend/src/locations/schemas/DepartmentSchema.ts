import type { Schema } from '../../core/utils/validator/schemas/Schema';

export const departmentSchema: Schema = {
  department_name: {
    type: 'string',
    required: true,
  },
  department_code: {
    type: 'string',
    required: true,
  },
};

export const departmentUpdateSchema: Schema = {
  department_name: {
    type: 'string',
    required: false,
  },
  department_code: {
    type: 'string',
    required: false,
  },
};
