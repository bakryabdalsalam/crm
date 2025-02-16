import { useState, useCallback } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    validate?: (value: T[K], formData: T) => boolean | string;
    errorMessage?: string;
    dependencies?: Array<keyof T>;
  };
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormValidationResult<T> {
  errors: ValidationErrors<T>;
  validateField: (field: keyof T, value: T[keyof T], formData?: T) => boolean;
  validateForm: (data: T) => boolean;
  clearErrors: () => void;
  clearError: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

export const useFormValidation = <T extends object>(
  rules: ValidationRules<T>
): UseFormValidationResult<T> => {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T], formData?: T) => {
      const fieldRules = rules[field];
      if (!fieldRules) return true;

      let isValid = true;
      let errorMessage = '';

      // Value presence check
      const isEmpty = value === undefined || value === null || value === '';
      if (fieldRules.required && isEmpty) {
        isValid = false;
        errorMessage = fieldRules.errorMessage || 'This field is required';
      } else if (!isEmpty) { // Only validate non-empty optional fields
        // Pattern validation
        if (fieldRules.pattern && typeof value === 'string' && !fieldRules.pattern.test(value)) {
          isValid = false;
          errorMessage = fieldRules.errorMessage || 'Invalid format';
        }

        // Length validations
        if (typeof value === 'string') {
          if (fieldRules.minLength && value.length < fieldRules.minLength) {
            isValid = false;
            errorMessage = fieldRules.errorMessage || `Minimum ${fieldRules.minLength} characters required`;
          }
          if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            isValid = false;
            errorMessage = fieldRules.errorMessage || `Maximum ${fieldRules.maxLength} characters allowed`;
          }
        }

        // Custom validation
        if (isValid && fieldRules.validate && formData) {
          const validationResult = fieldRules.validate(value, formData);
          if (typeof validationResult === 'string') {
            isValid = false;
            errorMessage = validationResult;
          } else if (!validationResult) {
            isValid = false;
            errorMessage = fieldRules.errorMessage || 'Invalid value';
          }
        }
      }

      setErrors(prev => ({
        ...prev,
        [field]: isValid ? undefined : errorMessage,
      }));

      // If this field has dependencies, validate them too
      if (formData && fieldRules.dependencies) {
        fieldRules.dependencies.forEach(dependentField => {
          validateField(dependentField, formData[dependentField], formData);
        });
      }

      return isValid;
    },
    [rules]
  );

  const validateForm = useCallback(
    (data: T) => {
      const newErrors: ValidationErrors<T> = {};
      let isValid = true;

      // First pass: validate all fields
      for (const field of Object.keys(rules) as Array<keyof T>) {
        if (!validateField(field, data[field], data)) {
          isValid = false;
          newErrors[field] = errors[field];
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [rules, validateField, errors]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearError,
    setFieldError
  };
};

export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phonePattern = /^(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
export const urlPattern = /^(https?:\/\/)?([\da-z]([.-]?[\da-z]+)*\.)+[a-z]{2,}(\/.*)?$/i;