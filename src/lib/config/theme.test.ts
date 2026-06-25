import { describe, expect, it } from "vitest";
import themeConfig from "@/config/theme.json";
import { parseThemeConfig } from "@/lib/config/theme";

describe("theme config", () => {
  it("parses the checked-in theme", () => {
    const theme = parseThemeConfig(themeConfig);

    expect(theme.brand.name).toBe("opnrun");
    expect(theme.brand.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(theme.sponsors).toHaveLength(3);
  });
});
