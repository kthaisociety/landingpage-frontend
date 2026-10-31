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
import { useShowApplyCta } from "@/hooks/applications";
import { useHydrated } from "@/hooks/use-hydrated";
import { fieldIsInvalid } from "@/lib/form-field-utils";
import {
  CONTACT_TEAM_GUIDANCE,
  CONTACT_TEAM_LABELS,
  CONTACT_TEAMS,
  type ContactTeam,
} from "@/types/contact";

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
  team: "business",
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

function createContactAsciiMask(): string | undefined {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "bold 120px Arial, Helvetica, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const word = "CONTACT ";
  const wordWidth = Math.max(ctx.measureText(word).width, 1);
  const lineHeight = 140;

  for (let row = 0, y = 0; y < canvas.height + lineHeight; row += 1, y += lineHeight) {
    const offsetX = row % 2 === 0 ? 0 : -wordWidth * 0.35;
    for (let x = offsetX; x < canvas.width + wordWidth; x += wordWidth) {
      ctx.fillText(word, x, y);
    }
  }

  return canvas.toDataURL("image/png");
}

function OrganisationDetails() {
  return (
    <div className="border-t border-white/25 pt-10 text-white">
      <p className="font-mono text-xs uppercase tracking-wider text-white/70">
        Organisation
      </p>
      <div className="mt-6 grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/50">
            Name
          </p>
          <p className="mt-2 font-arial text-base text-white">KTH AI Society</p>
          <p className="mt-1 font-mono text-xs text-white/65">802518-7249</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/50">
            Address
          </p>
          <p className="mt-2 font-arial leading-relaxed text-white">
            Drottning Kristinas väg 15-19
            <br />
            100 44 Stockholm
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/50">
            Email
          </p>
          <a
            href="mailto:contact@kthais.com"
            className="mt-2 inline-block font-arial text-base text-white transition-opacity hover:opacity-80"
          >
            contact@kthais.com
          </a>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/50">
            Banking
          </p>
          <p className="mt-2 font-arial leading-relaxed text-white">
            Bankgiro 000-0000
            <br />
            <span className="font-mono text-xs text-white/65">
              IBAN SE00 0000 0000 0000 0000 0000
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [contactTextMask, setContactTextMask] = useState<string | undefined>();
  const [submittedTo, setSubmittedTo] = useState<string | null>(null);
  const isHydrated = useHydrated();
  const submitContact = useSubmitContactMessage();
  const showApplyCta = useShowApplyCta();
  const showApply = isHydrated && showApplyCta;

  useEffect(() => {
    const dataUrl = createContactAsciiMask();
    if (!dataUrl) return;
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
    <div className="min-h-screen bg-primary pb-20 text-white">
      <section className="relative overflow-hidden pt-64 pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <AsciiGrid
            color="rgba(255, 255, 255, 0.28)"
            cellSize={12}
            logoSrc={contactTextMask}
            logoPosition="center"
            logoScale={1.35}
            enableDripping={false}
            className="h-full w-full"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-center text-sm font-medium">
            <Link
              href="/"
              className="text-white/65 transition-colors hover:text-white"
            >
              Home
            </Link>
            <span className="mx-2 text-white/35">/</span>
            <span className="text-white">Contact</span>
          </div>

          <p className="mt-14 font-times text-2xl text-white/80 md:text-3xl">
            (Get in touch)
          </p>

          <div className="mt-3 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16">
            <div>
              <h1 className="font-arial text-[4.25rem] leading-[0.9] font-bold tracking-tight-2 md:text-[7rem] lg:text-[8.5rem]">
                Contact
              </h1>
              <p className="mt-8 max-w-md font-serif text-lg leading-relaxed text-white/80 md:text-xl">
                Ideas, partnerships, and projects that move AI forward at KTH.
                Tell us what you need. We route it to the right team.
              </p>
              <p className="mt-6 max-w-md font-arial text-sm leading-relaxed text-white/65">
                Start with{" "}
                <span className="font-medium text-white">
                  Business Development
                </span>{" "}
                for company collaborations.
                {showApply ? (
                  <>
                    {" "}
                    Membership applications go through{" "}
                    <Link
                      href="/apply"
                      className="font-medium text-white underline underline-offset-4"
                    >
                      Apply
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 text-secondary-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] md:p-8 lg:p-10">
              {submittedTo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="size-5" />
                    <h2 className="font-arial text-lg font-bold tracking-tight">
                      Message sent
                    </h2>
                  </div>
                  <p className="font-serif text-base leading-relaxed text-secondary-black/70">
                    Sent to {submittedTo}. They will reply to the email you
                    provided.
                  </p>
                  <button
                    type="button"
                    className="mt-4 font-mono text-xs text-primary underline-offset-4 hover:underline"
                    onClick={() => setSubmittedTo(null)}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void form.handleSubmit();
                  }}
                >
                  <h2 className="font-arial text-xl font-bold tracking-tight md:text-2xl">
                    Send a message
                  </h2>
                  <p className="mt-2 font-serif text-sm text-secondary-black/65">
                    We read every note and reply from the team inbox.
                  </p>

                  <FieldGroup className="mt-8">
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
                                className="h-10 rounded-lg border-secondary-black/15 font-arial text-sm"
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
                                className="h-10 rounded-lg border-secondary-black/15 font-arial text-sm"
                              />
                              {isInvalid ? (
                                <FieldError errors={field.state.meta.errors} />
                              ) : null}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </div>

                    <form.Field
                      name="team"
                      validators={contactFieldValidators.team}
                    >
                      {(field) => {
                        const isInvalid = fieldIsInvalid(field.state.meta);
                        const selectedTeam = field.state.value as ContactTeam;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel id="contact-team-label">
                              Route to
                            </FieldLabel>
                            <FieldDescription>
                              Choose the team that matches your request.
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
                                    className={`rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                                      selected
                                        ? "border-primary bg-primary text-white"
                                        : "border-secondary-black/20 bg-transparent text-secondary-black hover:border-primary"
                                    }`}
                                  >
                                    {CONTACT_TEAM_LABELS[team]}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="mt-3 font-serif text-sm leading-relaxed text-secondary-black/70">
                              <span className="font-arial font-medium text-primary">
                                {CONTACT_TEAM_LABELS[selectedTeam]}.
                              </span>{" "}
                              {CONTACT_TEAM_GUIDANCE[selectedTeam]}
                            </p>
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
                              className="h-10 rounded-lg border-secondary-black/15 font-arial text-sm"
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
                              rows={6}
                              placeholder="Write a short note for the team."
                              aria-invalid={isInvalid}
                              className="min-h-36 rounded-xl border-secondary-black/15 font-arial text-sm"
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
                    className="mt-8 h-11 rounded-lg px-8 font-arial"
                  >
                    {submitContact.isPending ? (
                      <>
                        <Loader2
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      "Send message"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-20 pb-8 md:mt-28">
            <OrganisationDetails />
          </div>
        </div>
      </section>
    </div>
  );
}
