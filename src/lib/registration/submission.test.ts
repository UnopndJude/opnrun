import { describe, expect, it } from "vitest";
import formSchemaConfig from "@/config/form-schema.json";
import { parseRegistrationFormConfig } from "@/lib/config/form-schema";
import { validateRegistrationInput } from "@/lib/registration/submission";

const config = parseRegistrationFormConfig(formSchemaConfig);

const validInput = {
  fullName: "Kim Minjun",
  email: "runner@example.com",
  phone: "010-1234-5678",
  distance: "10k",
  shirtSize: "m",
  recordProofUrl: "https://example.com/result",
  shuttleBus: "true",
  emergencyContact: "Lee 010-9876-5432",
  medicalNotes: "",
  privacyConsent: "true"
};

describe("registration submission", () => {
  it("validates a complete registration payload", () => {
    const result = validateRegistrationInput(config, validInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("runner@example.com");
      expect(result.data.shuttleBus).toBe(true);
    }
  });

  it("returns field errors for required and invalid values", () => {
    const result = validateRegistrationInput(config, {
      ...validInput,
      email: "not-an-email",
      distance: "ultra",
      privacyConsent: undefined
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.email).toBe("Enter a valid email");
      expect(result.fieldErrors.distance).toBe(
        "Choose one of the available options"
      );
      expect(result.fieldErrors.privacyConsent).toBe("Required");
    }
  });
});
