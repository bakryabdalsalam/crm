import { useFormValidation } from './useFormValidation';

// More precise patterns
export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phonePattern = /^(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
export const websitePattern = /^(https?:\/\/)?([\da-z]([.-]?[\da-z]+)*\.)+[a-z]{2,}(\/.*)?$/i;
export const currencyPattern = /^-?\$?\d{1,3}(,\d{3})*(\.\d{1,2})?$/;
export const postalCodePattern = /^[A-Z\d]{3,10}(\s[A-Z\d]{3,10})?$/i;

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: string) => true | string;
  errorMessage?: string;
}

export const useCrmValidation = () => {
  const defaultRules = {
    email: {
      pattern: emailPattern,
      errorMessage: 'Please enter a valid email address'
    },
    phone: {
      pattern: phonePattern,
      errorMessage: 'Please enter a valid phone number (e.g., +1 (555) 123-4567)'
    },
    website: {
      pattern: websitePattern,
      errorMessage: 'Please enter a valid website URL (e.g., https://example.com)'
    },
    currency: {
      pattern: currencyPattern,
      errorMessage: 'Please enter a valid amount (e.g., $1,234.56)'
    },
    postalCode: {
      pattern: postalCodePattern,
      errorMessage: 'Please enter a valid postal/zip code'
    },
    password: {
      minLength: 8,
      maxLength: 128,
      validate: (value: string) => {
        const requirements = [
          { regex: /\d/, message: 'one number' },
          { regex: /[a-z]/, message: 'one lowercase letter' },
          { regex: /[A-Z]/, message: 'one uppercase letter' },
          { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'one special character' }
        ];

        const missingRequirements = requirements
          .filter(req => !req.regex.test(value))
          .map(req => req.message);

        if (missingRequirements.length > 0) {
          return `Password must contain at least ${missingRequirements.join(', ')}`;
        }
        return true;
      }
    }
  };

  const { validateField, validateForm, clearErrors, clearError, setFieldError, errors } = useFormValidation(defaultRules);

  const getEmailValidation = (required = true): ValidationRules => ({
    required,
    pattern: emailPattern,
    errorMessage: 'Please enter a valid email address'
  });

  const getPhoneValidation = (required = false): ValidationRules => ({
    required,
    pattern: phonePattern,
    errorMessage: 'Please enter a valid phone number (e.g., +1 (555) 123-4567)'
  });

  const getWebsiteValidation = (required = false): ValidationRules => ({
    required,
    pattern: websitePattern,
    errorMessage: 'Please enter a valid website URL (e.g., https://example.com)'
  });

  const getNameValidation = (required = true, minLength = 2, maxLength = 100): ValidationRules => ({
    required,
    minLength,
    maxLength,
    validate: (value: string) => {
      if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      return true;
    },
    errorMessage: `Name must be between ${minLength} and ${maxLength} characters`
  });

  const getCurrencyValidation = (required = true, min?: number, max?: number): ValidationRules => ({
    required,
    pattern: currencyPattern,
    validate: (value: string) => {
      const numValue = parseFloat(value.replace(/[$,]/g, ''));
      if (min !== undefined && numValue < min) return `Amount must be at least ${min}`;
      if (max !== undefined && numValue > max) return `Amount must not exceed ${max}`;
      return true;
    },
    errorMessage: 'Please enter a valid amount (e.g., $1,234.56)'
  });

  const getPasswordValidation = (checkStrength = true): ValidationRules => ({
    required: true,
    minLength: 8,
    maxLength: 128,
    validate: (value: string) => {
      if (!checkStrength) return true;
      
      const requirements = [
        { regex: /\d/, message: 'one number' },
        { regex: /[a-z]/, message: 'one lowercase letter' },
        { regex: /[A-Z]/, message: 'one uppercase letter' },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'one special character' }
      ];

      const missingRequirements = requirements
        .filter(req => !req.regex.test(value))
        .map(req => req.message);

      if (missingRequirements.length > 0) {
        return `Password must contain at least ${missingRequirements.join(', ')}`;
      }

      return true;
    },
    errorMessage: 'Password must be between 8 and 128 characters'
  });

  const getPostalCodeValidation = (required = false): ValidationRules => ({
    required,
    pattern: postalCodePattern,
    errorMessage: 'Please enter a valid postal/zip code'
  });

  const getRequiredValidation = (fieldName: string): ValidationRules => ({
    required: true,
    errorMessage: `${fieldName} is required`
  });

  const getDateValidation = (required = true, { 
    minDate, 
    maxDate 
  }: { 
    minDate?: Date, 
    maxDate?: Date 
  } = {}): ValidationRules => ({
    required,
    validate: (value: string) => {
      const date = new Date(value);
      if (minDate && date < minDate) return `Date must be after ${minDate.toLocaleDateString()}`;
      if (maxDate && date > maxDate) return `Date must be before ${maxDate.toLocaleDateString()}`;
      return true;
    },
    errorMessage: 'Please enter a valid date'
  });

  return {
    validateField,
    validateForm,
    clearErrors,
    clearError,
    setFieldError,
    errors,
    getEmailValidation,
    getPhoneValidation,
    getWebsiteValidation,
    getNameValidation,
    getCurrencyValidation,
    getPasswordValidation,
    getPostalCodeValidation,
    getRequiredValidation,
    getDateValidation
  };
};