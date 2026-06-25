import { z } from "zod";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color.");

export const themeSchema = z.object({
  $schema: z.string().url().optional(),
  version: z.literal(1),
  brand: z.object({
    name: z.string().min(1),
    primary: hexColorSchema,
    accent: hexColorSchema,
    success: hexColorSchema,
    ink: hexColorSchema,
    surface: hexColorSchema,
    logo: z.string().min(1)
  }),
  event: z.object({
    eyebrow: z.string().min(1),
    status: z.string().min(1),
    heroAlt: z.string().min(1)
  }),
  sponsors: z
    .array(
      z.object({
        name: z.string().min(1),
        tier: z.string().min(1)
      })
    )
    .default([])
});

export type ThemeConfig = z.infer<typeof themeSchema>;

export function parseThemeConfig(config: unknown): ThemeConfig {
  return themeSchema.parse(config);
}
