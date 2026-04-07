---
name: create-forms
description: Build or refactor frontend forms for this Next.js project with accessible field structure, schema validation, submission handling, loading and error states, and project-native UI primitives. Use when Codex needs to create, convert, or review forms in `frontend/src`, especially for shadcn/ui field patterns, React Hook Form, TanStack Form, Zod, route-handler-backed submissions, or reusable form components.
---

# Create Forms

Build forms as end-to-end flows. Inspect the existing route, UI primitives, validation stack, and submit path before choosing abstractions.

## Project Context

- This frontend is a Next.js App Router app under `frontend/`.
- The repo already contains local UI primitives and form-related patterns under `src/components/ui/`.
- This codebase mixes route handlers, direct backend calls, and `localStorage`-backed flows. Do not normalize a form submit path without confirming the matching backend contract exists.
- Preserve public-facing copy and brand tone unless the task explicitly asks for content changes.

## Workflow

1. Find the real form entrypoint and the real submit target before editing.
2. Inspect nearby code first:
   - local `ui` primitives
   - existing forms in the same feature area
   - route handlers or hooks used by the submit path
3. Reuse the project’s current stack unless the user explicitly asks to migrate:
   - Use the existing form library already established in that feature.
   - Reuse local field wrappers and input components before adding new abstractions.
4. Model the form state and validation before writing markup:
   - define default values
   - define the schema or validator near the form
   - normalize strings before submit when the backend expects trimmed input
5. Build each field with explicit label, description, control, and error rendering.
6. Handle form-level behavior, not only field-level behavior:
   - pending state
   - submit success
   - submit failure
   - reset behavior
7. Verify the exact changed files and the route behavior if routing or server handlers are involved.

## Stack Selection

- Use React Hook Form when the target area already uses shadcn's RHF-oriented `Form`, `FormField`, `FormItem`, `FormControl`, and `FormMessage` helpers.
- Use TanStack Form when the target already uses it or the task explicitly asks for it. Prefer `form.Field` and form subscriptions over parallel `useState`.
- Use route handlers or fetch-based submit flows when the form already posts to `src/app/api/*`.
- Use server actions only when the feature already leans on them or the user explicitly asks for progressive enhancement.

## Guardrails

- Do not duplicate field values in local `useState` when the chosen form library should own them.
- Do not create a new shared abstraction unless at least one existing local form would clearly benefit from it.
- Prefer schema-driven validation with Zod or the local standard over ad hoc inline checks.
- Keep field validation errors separate from submission errors.
- Disable repeated submit attempts while pending when the action is not clearly idempotent.
- Reset the form only after confirmed success.
- Keep browser semantics unless there is a deliberate reason to opt out.

## shadcn Alignment

- Prefer `FieldGroup` and `Field` style layout when those primitives exist locally.
- Put `data-invalid` on the field wrapper and `aria-invalid` on the control.
- Reuse `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, and related local components instead of raw HTML when the project already wraps them.
- If a needed shadcn component is missing, use the local `$shadcn` skill to add or update it instead of hand-copying undocumented component code.

## Output Expectations

- Leave the form easier to extend than before: clear defaults, clear schema, predictable submit flow, and reusable field markup.
- Keep visual changes aligned with the current design system and surrounding pages.
- Scope migrations to the requested form unless the user asks for a broader conversion.
- If the change touches route handlers or production behavior, consider `npm run build` in addition to lint.

## Verification

- Run targeted lint on the changed form files.
- Run `npm run build` when the change affects routing, env usage, route handlers, or production-only behavior.
- If the change is React-heavy, run `$react-doctor` after substantial edits.
