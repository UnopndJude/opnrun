"use server";

import formSchemaConfig from "@/config/form-schema.json";
import { parseRegistrationFormConfig } from "@/lib/config/form-schema";
import { reserveRegistration } from "@/lib/registration/application/reserve-registration";
import { createMockReservationDependencies } from "@/lib/registration/infrastructure/reservation-adapters";
import type { RegistrationActionState } from "@/lib/registration/action-state";
import {
  formDataToRegistrationInput,
  validateRegistrationInput
} from "@/lib/registration/submission";

const formConfig = parseRegistrationFormConfig(formSchemaConfig);
const reservationDependencies = createMockReservationDependencies();

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

  const reservation = await reserveRegistration(
    {
      eventId: formConfig.event.id,
      registration: validation.data
    },
    reservationDependencies
  );

  return {
    status: "success",
    fieldErrors: {},
    message: "Registration reserved.",
    reservation
  };
}
