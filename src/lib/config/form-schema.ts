import { z } from "zod";

const fieldIdSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, "Use camelCase field ids.");

const sectionIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "Use lowercase section ids.");

const optionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().min(1).optional()
});

const baseFieldSchema = z.object({
  id: fieldIdSchema,
  label: z.string().min(1),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  autocomplete: z.string().optional(),
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional()
});

const textFieldSchema = baseFieldSchema.extend({
  type: z.enum(["text", "email", "tel", "url", "textarea"])
});

const optionFieldSchema = baseFieldSchema.extend({
  type: z.enum(["select", "radio"]),
  options: z.array(optionSchema).min(1)
});

const checkboxFieldSchema = baseFieldSchema.extend({
  type: z.literal("checkbox")
});

export const formFieldSchema = z.discriminatedUnion("type", [
  textFieldSchema,
  optionFieldSchema,
  checkboxFieldSchema
]);

export const registrationFormSchema = z
  .object({
    $schema: z.string().url().optional(),
    version: z.literal(1),
    event: z.object({
      id: sectionIdSchema,
      name: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      location: z.string().min(1),
      capacity: z.number().int().positive()
    }),
    sections: z
      .array(
        z.object({
          id: sectionIdSchema,
          title: z.string().min(1),
          description: z.string().min(1).optional(),
          fields: z.array(formFieldSchema).min(1)
        })
      )
      .min(1)
  })
  .superRefine((schema, context) => {
    const fieldIds = new Set<string>();
    const sectionIds = new Set<string>();

    for (const section of schema.sections) {
      if (sectionIds.has(section.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate section id: ${section.id}`,
          path: ["sections"]
        });
      }
      sectionIds.add(section.id);

      for (const field of section.fields) {
        if (fieldIds.has(field.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate field id: ${field.id}`,
            path: ["sections", section.id, "fields", field.id]
          });
        }
        fieldIds.add(field.id);
      }
    }
  });

export type FormField = z.infer<typeof formFieldSchema>;
export type RegistrationFormConfig = z.infer<typeof registrationFormSchema>;

export function parseRegistrationFormConfig(
  config: unknown
): RegistrationFormConfig {
  return registrationFormSchema.parse(config);
}

export function getFormFields(config: RegistrationFormConfig): FormField[] {
  return config.sections.flatMap((section) => section.fields);
}
