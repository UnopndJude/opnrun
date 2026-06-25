import formSchemaConfig from "@/config/form-schema.json";
import themeConfig from "@/config/theme.json";
import { RegistrationExperience } from "@/components/registration/RegistrationExperience";
import { parseRegistrationFormConfig } from "@/lib/config/form-schema";
import { parseThemeConfig } from "@/lib/config/theme";

const formConfig = parseRegistrationFormConfig(formSchemaConfig);
const theme = parseThemeConfig(themeConfig);

export default function Home() {
  return <RegistrationExperience formConfig={formConfig} theme={theme} />;
}
