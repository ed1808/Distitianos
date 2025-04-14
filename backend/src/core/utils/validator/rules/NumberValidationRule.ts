export type NumberValidationRule = {
  type: 'number';
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
};
