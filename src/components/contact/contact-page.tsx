"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContactMessage } from "@/hooks/contact";
import { fieldIsInvalid } from "@/lib/form-field-utils";
import { CONTACT_TEAM_LABELS, CONTACT_TEAMS } from "@/types/contact";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(120, "Please keep your name under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  team: z.enum(CONTACT_TEAMS),
  subject: z
    .string()
    .trim()
    .min(1, "Please enter a subject.")
    .max(160, "Please keep the subject under 160 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Please write a short message (at least 10 characters).")
    .max(4000, "Please keep your message under 4000 characters."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const defaultContactValues: ContactFormValues = {
  name: "",
  email: "",
  team: "board",
  subject: "",
  message: "",
};

const contactFieldValidators = {
  name: { onBlur: contactSchema.shape.name },
  email: { onBlur: contactSchema.shape.email },
  team: { onChange: contactSchema.shape.team },
  subject: { onBlur: contactSchema.shape.subject },
  message: { onBlur: contactSchema.shape.message },
};

export function ContactPage() {
  const [contactTextMask, setContactTextMask] = useState<string | undefined>();
  const [submittedTo, setSubmittedTo] = useState<string | null>(null);
  const submitContact = useSubmitContactMessage();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 160px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("CONTACT", canvas.width / 2, 0);

    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => {
      setContactTextMask(dataUrl);
    });
  }, []);

  const form = useForm({
    defaultValues: defaultContactValues,
    validators: {
      onSubmit: contactSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await submitContact.mutateAsync(value);
      setSubmittedTo(result.team || CONTACT_TEAM_LABELS[value.team]);
      form.reset();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-white pt-64 pb-24 text-secondary-black">
        <div className="pointer-events-none absolute inset-0">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={contactTextMask}
            logoPosition="center"
            logoScale={0.9}
            enableDripping={false}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-8 md:px-6">
          <h4 className="mb-2 text-3xl tracking-tighter">
            <span className="font-times font-normal text-primary">
              (Get in touch)
            </span>{" "}
            Organization
          </h4>
          <h1 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            Contact
          </h1>
        </div>
      </section>

      <div className="px-4 pb-24 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 lg:p-12 shadow-lg border">
          <div className="mb-10">
            <div>
              <Link
                href="/"
                className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-primary font-medium text-sm">Contact</span>
            </div>
            <p className="text-lg md:text-xl max-w-3xl opacity-95 leading-relaxed font-serif text-secondary-black mt-4">
              Choose the team your message is for and we will send it to that
              inbox. For membership applications, use{" "}
              <Link
                href="/apply"
                className="font-medium text-primary hover:underline decoration-2 underline-offset-4"
              >
                Apply
              </Link>{" "}
              instead.
            </p>
          </div>

          {submittedTo ? (
            <div className="max-w-2xl rounded-lg border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">Message sent</h2>
                  <p className="text-sm text-muted-foreground">
                    Your message was sent to the {submittedTo} team. They will
                    reply to the email you provided.
                  </p>
                  <button
                    type="button"
                    className="mt-3 text-sm font-medium text-primary hover:underline decoration-2 underline-offset-4"
                    onClick={() => setSubmittedTo(null)}
                  >
                    Send another message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              noValidate
              className="max-w-2xl font-arial"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <form.Field
                    name="name"
                    validators={contactFieldValidators.name}
                  >
                    {(field) => {
                      const isInvalid = fieldIsInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            autoComplete="name"
                            placeholder="Ada Lovelace"
                            aria-invalid={isInvalid}
                            className="text-sm"
                          />
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Field
                    name="email"
                    validators={contactFieldValidators.email}
                  >
                    {(field) => {
                      const isInvalid = fieldIsInvalid(field.state.meta);
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            autoComplete="email"
                            placeholder="ada@example.com"
                            aria-invalid={isInvalid}
                            className="text-sm"
                          />
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </div>

                <form.Field name="team" validators={contactFieldValidators.team}>
                  {(field) => {
                    const isInvalid = fieldIsInvalid(field.state.meta);
                    const selectedTeam = field.state.value;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel id="contact-team-label">Team</FieldLabel>
                        <FieldDescription>
                          Your message is sent to this team&apos;s inbox.
                        </FieldDescription>
                        <div
                          role="radiogroup"
                          aria-labelledby="contact-team-label"
                          className="flex flex-wrap gap-2"
                        >
                          {CONTACT_TEAMS.map((team) => {
                            const selected = selectedTeam === team;
                            return (
                              <button
                                key={team}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.handleChange(team)}
                                className={`font-mono text-xs px-4 py-2 rounded-full transition-all duration-200 border ${
                                  selected
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-white text-secondary-black border-secondary-light-gray hover:border-primary"
                                }`}
                              >
                                {CONTACT_TEAM_LABELS[team]}
                              </button>
                            );
                          })}
                        </div>
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="subject"
                  validators={contactFieldValidators.subject}
                >
                  {(field) => {
                    const isInvalid = fieldIsInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Subject</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder="Partnership inquiry"
                          aria-invalid={isInvalid}
                          className="text-sm"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="message"
                  validators={contactFieldValidators.message}
                >
                  {(field) => {
                    const isInvalid = fieldIsInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          rows={7}
                          placeholder="Write a short note for the team."
                          aria-invalid={isInvalid}
                          className="min-h-40 text-sm"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              {submitContact.isError ? (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {submitContact.error.message}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={submitContact.isPending}
                className="mt-8"
              >
                {submitContact.isPending ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
