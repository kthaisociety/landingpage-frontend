---
name: create-forms
description: Use when creating or refactoring forms in `src/` and the desired implementation should match this app's newsletter form pattern: TanStack Form, Zod validation, local field primitives, and fetch-based submission to a Next route handler.
---

# Create Forms

Build forms the way this codebase already does it in [src/app/newsletter/newsletter-form.tsx](/Users/ludvigbergstrom/new_repos/aisprojects/kthais/frontend/src/app/newsletter/newsletter-form.tsx): simple TanStack Form state, Zod validators, local `Field` primitives, and a direct submit flow that is easy to follow.

## Canonical Reference

- Start from [src/app/newsletter/newsletter-form.tsx](/Users/ludvigbergstrom/new_repos/aisprojects/kthais/frontend/src/app/newsletter/newsletter-form.tsx).
- Follow its structure unless the surrounding feature already has a stronger local convention.
- Treat [src/app/api/newsletter/subscribe/route.ts](/Users/ludvigbergstrom/new_repos/aisprojects/kthais/frontend/src/app/api/newsletter/subscribe/route.ts) as the model for a form posting to a Next route handler.

## Workflow

1. Find the real form entrypoint and the real submit target before editing.
2. Inspect nearby code first:
   - local field and input primitives under `src/components/ui/`
   - the nearest existing form in the same feature
   - the route handler, hook, or backend client that receives the submit
3. Default to the newsletter stack:
   - `useForm` from `@tanstack/react-form`
   - a local Zod schema used for `onBlur` and `onSubmit`
   - `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, and `FieldError`
   - `form.Field` render props for each control
   - `form.Subscribe` for submit button state
4. Define defaults and validation before writing JSX:
   - keep `defaultValues` explicit
   - keep the schema near the form
   - trim strings before submit when the receiver expects normalized input
5. Build fields like the newsletter form:
   - compute `isInvalid` from `field.state.meta.isTouched` and `isValid`
   - put `data-invalid` on the `Field`
   - put `aria-invalid` on the control
   - show descriptions and inline field errors
6. Keep submit state separate from field state:
   - clear old submit messages when the user edits a field
   - render success and failure at form level
   - disable repeat submits while pending
   - reset only after confirmed success
7. Verify the exact changed files and the submit path if routing or server handlers are involved.

## Default Pattern

- Prefer `noValidate` on the `<form>` and let the schema own validation.
- Prefer a direct `onSubmit` that calls `event.preventDefault()` and then `void form.handleSubmit()`.
- Prefer `fetch()` to the feature's existing endpoint when the form already posts to `src/app/api/*`.
- Prefer form-owned values over mirrored `useState`.
- Prefer a small local `SubmitState` union for success and error messaging when the UI needs a status banner.

## Guardrails

- Do not introduce React Hook Form just because it is common elsewhere; the local newsletter form is TanStack Form and should be the default reference.
- Do not duplicate field values in local `useState` when TanStack Form should own them.
- Do not create a new shared abstraction unless multiple existing forms would clearly benefit.
- Do not normalize submit paths across route handlers, backend hooks, and `localStorage` flows without confirming the backend contract exists.
- Keep field validation errors separate from submit errors.
- Reuse local input primitives instead of raw HTML where the project already wraps them.

## Output Expectations

- Leave the form easier to extend than before: clear defaults, clear schema, predictable submit flow, and field markup that matches the newsletter pattern.
- Keep visual changes aligned with the current design system and surrounding pages.
- Scope migrations to the requested form unless the user explicitly asks for a broader conversion.
- Preserve public-facing copy and brand tone unless the task asks for content changes.

## Verification

- Run targeted lint on the changed form files.
- Run `npm run build` when the change affects routing, env usage, route handlers, or production-only behavior.
- If the change is React-heavy, run `$react-doctor` after substantial edits.
