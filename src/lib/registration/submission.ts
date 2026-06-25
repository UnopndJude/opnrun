import type {
  FormField,
  RegistrationFormConfig
} from "@/lib/config/form-schema";
import { getFormFields } from "@/lib/config/form-schema";
import type { RegistrationValue } from "@/lib/registration/domain/reservation";

export type { RegistrationValue } from "@/lib/registration/domain/reservation";
export type RegistrationInput = Record<string, RegistrationValue | undefined>;

export type ValidationResult =
  | {
      ok: true;
      data: Record<string, RegistrationValue>;
    }
  | {
      ok: false;
      fieldErrors: Record<string, string>;
    };

export function formDataToRegistrationInput(
  formData: FormData
): RegistrationInput {
  const input: RegistrationInput = {};

  for (const [key, value] of formData.entries()) {
    input[key] = typeof value === "string" ? value : value.name;
  }

  return input;
}

export function validateRegistrationInput(
  config: RegistrationFormConfig,
  input: RegistrationInput
): ValidationResult {
  const fieldErrors: Record<string, string> = {};
  const data: Record<string, RegistrationValue> = {};

  for (const field of getFormFields(config)) {
    const value = normalizeFieldValue(field, input[field.id]);
    const error = validateFieldValue(field, value);

    if (error) {
      fieldErrors[field.id] = error;
      continue;
    }

    data[field.id] = value;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      fieldErrors
    };
  }

  return {
    ok: true,
    data
  };
}

function normalizeFieldValue(
  field: FormField,
  value: RegistrationValue | undefined
): RegistrationValue {
  if (field.type === "checkbox") {
    return value === true || value === "true" || value === "on";
  }

  return typeof value === "string" ? value.trim() : "";
}

function validateFieldValue(
  field: FormField,
  value: RegistrationValue
): string | null {
  if (field.type === "checkbox") {
    if (field.required && value !== true) {
      return "Required";
    }

    return null;
  }

  if (typeof value !== "string") {
    return "Invalid value";
  }

  if (field.required && value.length === 0) {
    return "Required";
  }

  if (value.length === 0) {
    return null;
  }

  if ("minLength" in field && field.minLength && value.length < field.minLength) {
    return `Use at least ${field.minLength} characters`;
  }

  if ("maxLength" in field && field.maxLength && value.length > field.maxLength) {
    return `Use ${field.maxLength} characters or fewer`;
  }

  if (field.type === "email" && !isEmail(value)) {
    return "Enter a valid email";
  }

  if (field.type === "url" && !isUrl(value)) {
    return "Enter a valid URL";
  }

  if (
    (field.type === "select" || field.type === "radio") &&
    !field.options.some((option) => option.value === value)
  ) {
    return "Choose one of the available options";
  }

  return null;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
