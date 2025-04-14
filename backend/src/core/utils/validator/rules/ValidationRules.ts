import type { ArrayValidationRule } from './ArrayValidationRule';
import type { BooleanValidationRule } from './BooleanValidationRule';
import type { NumberValidationRule } from './NumberValidationRule';
import type { ObjectValidationRule } from './ObjectValidationRule';
import type { StringValidationRule } from './StringValidationRule';

export type ValidationRules =
  | StringValidationRule
  | NumberValidationRule
  | BooleanValidationRule
  | ArrayValidationRule
  | ObjectValidationRule;
