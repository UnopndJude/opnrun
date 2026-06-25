"use server";

import formSchemaConfig from "@/config/form-schema.json";
import { parseRegistrationFormConfig } from "@/lib/config/form-schema";
import type { RegistrationActionState } from "@/lib/registration/action-state";
import {
  createMockReservation,
  formDataToRegistrationInput,
  validateRegistrationInput
} from "@/lib/registration/submission";

const formConfig = parseRegistrationFormConfig(formSchemaConfig);

export async function submitRegistration(
  _previousState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const input = formDataToRegistrationInput(formData);
  const validation = validateRegistrationInput(formConfig, input);

  if (!validation.ok) {
    return {
      status: "error",
      fieldErrors: validation.fieldErrors,
      message: "Check the highlighted fields."
    };
  }

  const reservation = createMockReservation(validation.data, {
    eventId: formConfig.event.id
  });

  return {
    status: "success",
    fieldErrors: {},
    message: "Registration reserved.",
    reservation
  };
}
