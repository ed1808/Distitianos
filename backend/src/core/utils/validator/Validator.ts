import type { ArrayValidationRule } from './rules/ArrayValidationRule';
import type { BooleanValidationRule } from './rules/BooleanValidationRule';
import type { NumberValidationRule } from './rules/NumberValidationRule';
import type { ObjectValidationRule } from './rules/ObjectValidationRule';
import type { StringValidationRule } from './rules/StringValidationRule';
import type { Schema } from './schemas/Schema';
import type { ValidationResult } from './types/ValidationResult';

export class Validator {
  public static validate(data: any, schema: Schema): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    };

    if (!data) {
      const requiredFields = Object.entries(schema)
        .filter(([_, rules]) => rules.required)
        .map(([field, _]) => field);

      if (requiredFields.length > 0) {
        result.valid = false;
        requiredFields.forEach(field => {
          result.errors.push({
            field,
            message: 'Required field',
          });
        });
      }

      return result;
    }

    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !data[field]) {
        result.valid = false;
        result.errors.push({
          field,
          message: 'Required field',
        });

        continue;
      }

      if (!data[field]) continue;

      switch (rules.type) {
        case 'string':
          this.validateString(field, data[field], rules, result);
          break;

        case 'number':
          this.validateNumber(field, data[field], rules, result);
          break;

        case 'boolean':
          this.validateBoolean(field, data[field], rules, result);
          break;

        case 'array':
          this.validateArray(field, data[field], rules, result);
          break;

        case 'object':
          this.validateObject(field, data[field], rules, result);
          break;
      }
    }

    return result;
  }

  private static validateString(
    field: string,
    value: any,
    rules: StringValidationRule,
    result: ValidationResult
  ): void {
    if (typeof value !== 'string') {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be a string',
      });

      return;
    }

    if (rules.minLength !== undefined && value.length < rules.minLength) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must have at least ${rules.minLength} characters`,
      });
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must have maximum ${rules.minLength} characters`,
      });
    }

    if (rules.pattern !== undefined && !rules.pattern.test(value)) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Doesn't match the specified format`,
      });
    }

    if (rules.enum !== undefined && !rules.enum.includes(value)) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must be one of: ${rules.enum.join(', ')}`,
      });
    }
  }

  private static validateNumber(
    field: string,
    value: any,
    rules: NumberValidationRule,
    result: ValidationResult
  ): void {
    if (typeof value !== 'number') {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be a number',
      });

      return;
    }

    if (rules.integer !== undefined && !Number.isInteger(value)) {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be an integer number',
      });
    }

    if (rules.positive !== undefined && value < 1) {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be a postive number',
      });
    }

    if (rules.min !== undefined && value < rules.min) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must be greater or equal than ${rules.min}`,
      });
    }

    if (rules.max !== undefined && value > rules.max) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must be lesser or equal than ${rules.max}`,
      });
    }
  }

  private static validateBoolean(
    field: string,
    value: any,
    rules: BooleanValidationRule,
    result: ValidationResult
  ): void {
    if (typeof value !== 'boolean') {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be boolean',
      });

      return;
    }
  }

  private static validateArray(
    field: string,
    value: any,
    rules: ArrayValidationRule,
    result: ValidationResult
  ): void {
    if (!Array.isArray(value)) {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be an array',
      });

      return;
    }

    if (rules.minItems !== undefined && value.length < rules.minItems) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must have at least ${rules.minItems} items`,
      });
    }

    if (rules.maxItems !== undefined && value.length < rules.maxItems) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Must have maximum ${rules.maxItems} items`,
      });
    }

    if (rules.items && value.length > 0) {
      value.forEach((item, index) => {
        const itemField = `${field}[${index}]`;

        switch (rules.items?.type) {
          case 'string':
            this.validateString(
              itemField,
              item,
              rules.items as StringValidationRule,
              result
            );
            break;

          case 'number':
            this.validateNumber(
              itemField,
              item,
              rules.items as NumberValidationRule,
              result
            );
            break;

          case 'boolean':
            this.validateBoolean(
              itemField,
              item,
              rules.items as BooleanValidationRule,
              result
            );
            break;

          case 'array':
            this.validateArray(
              itemField,
              item,
              rules.items as ArrayValidationRule,
              result
            );
            break;

          case 'object':
            this.validateObject(
              itemField,
              item,
              rules.items as ObjectValidationRule,
              result
            );
            break;
        }
      });
    }
  }

  private static validateObject(
    field: string,
    value: any,
    rules: ObjectValidationRule,
    result: ValidationResult
  ): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      result.valid = false;
      result.errors.push({
        field,
        message: 'Must be an object',
      });

      return;
    }

    if (rules.properties) {
      const nestedResult = this.validate(value, rules.properties);

      if (!nestedResult.valid) {
        result.valid = false;

        nestedResult.errors.forEach(error => {
          result.errors.push({
            field: `${field}.${error.field}`,
            message: error.message,
          });
        });
      }
    }
  }
}
