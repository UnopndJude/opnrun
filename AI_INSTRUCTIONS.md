# AI Instructions

Use these prompts when adapting opnrun for a specific race.

## Add a Registration Field

Update `src/config/form-schema.json` to add an emergency contact field to the Safety section. Run `npm test`, `npm run typecheck`, and `npm run build` after the change.

## Change Event Branding

Update `src/config/theme.json` with the event primary color, accent color, logo path, and sponsor labels. Do not modify `src/lib/queue` or `src/lib/payment`.

## Validate a Schema Change

After editing `src/config/form-schema.json`, run the config tests and confirm that the dynamic registration form still renders all required fields.
