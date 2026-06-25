import { describe, expect, it } from "vitest";
import formSchemaConfig from "@/config/form-schema.json";
import {
  getFormFields,
  parseRegistrationFormConfig
} from "@/lib/config/form-schema";

describe("registration form config", () => {
  it("parses the checked-in form schema", () => {
    const config = parseRegistrationFormConfig(formSchemaConfig);

    expect(config.version).toBe(1);
    expect(config.sections.length).toBeGreaterThan(0);
    expect(getFormFields(config).some((field) => field.id === "email")).toBe(
      true
    );
  });

  it("rejects duplicate field ids", () => {
    const invalidConfig = structuredClone(formSchemaConfig);
    invalidConfig.sections[1].fields[0].id =
      invalidConfig.sections[0].fields[0].id;

    expect(() => parseRegistrationFormConfig(invalidConfig)).toThrow(
      /Duplicate field id/
    );
  });
});
