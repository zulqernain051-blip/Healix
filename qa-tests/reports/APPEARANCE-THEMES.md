# Mobile appearance themes — 9 October 2026

Registered `minimal-clean` (Minimal Clean / Light) and `dark-futuristic` (Dark Futuristic / Neon) in `mobile/src/theme.ts`. Patient Account Settings → Appearance selects either theme, applies it immediately, and saves the choice on the device using existing cross-platform storage. The light theme is the initial default. Invalid saved IDs fall back safely; failed preference writes keep the selected appearance and show a retry message.

Color-dependent screen styles and shared workflow styles now read the active palette. Paper providers, inputs, dialogs, navigation, native date-picker appearance, system status bars, clinical status colors, and existing gradients use the registered colors. All mobile roles share the same appearance provider. No backend, API, authentication, care workflow, navigation destination, imagery, spacing, typography, radius, or screen layout changes were made.

Validation:

- Mobile TypeScript check passed.
- All 26 mobile tests passed, including valid theme IDs, matching token coverage, and text/control contrast for both palettes.
- An isolated Expo web patient session verified Settings selection and persistence after reload; request and home previews rendered without runtime errors.
- Changing the active theme with a request form open preserved its entered note and every input's position and dimensions while its colors updated.
- Source comparison across 213 existing modules preserved numerical layout values, event handlers, data bindings, and visible text; the existing appearance description in Settings was replaced by the authorized theme selector.
- Repository lint has existing failures. No unrelated lint or workflow repairs were included.

Browser checks used mocked patient data and did not submit care requests or modify live records. Native emulator/device behavior was not exercised.
