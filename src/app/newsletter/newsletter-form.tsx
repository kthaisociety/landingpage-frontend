"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "@tanstack/react-form"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { AsciiGrid } from "@/components/ui/ascii-grid"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ProgrammeSelect } from "@/components/member/programme-select"
import { InterestsField } from "@/components/applications/interests-field"
import {
  APPLICATION_GENDERS,
  APPLICATION_INTERESTS,
  OTHER_PROGRAMME_VALUE,
  OTHER_UNIVERSITY_VALUE,
  UNIVERSITIES,
  getGraduationYearOptions,
  resolveUniversity,
  resolveProgramme,
  type ApplicationGender,
} from "@/types/applications"
import { fieldIsInvalid } from "@/lib/form-field-utils"
import { useSubmitNewsletterSubscription } from "@/hooks/newsletter"

const GRADUATION_YEAR_OPTIONS = getGraduationYearOptions()

type NewsletterFormValues = {
  firstName: string
  lastName: string
  email: string
  gender: ApplicationGender | ""
  university: string
  universityOther: string
  programme: string
  programmeOther: string
  graduationYear: string
  interests: (typeof APPLICATION_INTERESTS)[number][]
  dataRetentionConsent: boolean
}

const newsletterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Please enter your first name.")
      .max(80, "Please keep your first name under 80 characters."),
    lastName: z
      .string()
      .trim()
      .min(1, "Please enter your last name.")
      .max(80, "Please keep your last name under 80 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email address.")
      .email("Please enter a valid email address."),
    gender: z
      .union([z.enum(APPLICATION_GENDERS), z.literal("")])
      .refine((value) => value !== "", "Please select your gender."),
    university: z.string().trim().min(1, "Please select your university."),
    universityOther: z
      .string()
      .trim()
      .max(120, "Please keep your university under 120 characters."),
    programme: z.string().trim().min(1, "Please select your programme."),
    programmeOther: z
      .string()
      .trim()
      .max(120, "Please keep your programme under 120 characters."),
    graduationYear: z
      .string()
      .trim()
      .refine(
        (value) => GRADUATION_YEAR_OPTIONS.includes(value),
        "Please select your expected graduation year.",
      ),
    interests: z
      .array(z.enum(APPLICATION_INTERESTS))
      .min(1, "Choose at least one area of interest.")
      .refine(
        (interests) => new Set(interests).size === interests.length,
        "Each interest can appear only once.",
      ),
    dataRetentionConsent: z
      .boolean()
      .refine(
        (value) => value,
        "You need to consent to data collection and storage before subscribing.",
      ),
  })
  .superRefine((value, ctx) => {
    if (
      value.university === OTHER_UNIVERSITY_VALUE &&
      value.universityOther.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["universityOther"],
        message: "Please enter your university.",
      })
    }
  })
  .superRefine((value, ctx) => {
    if (
      value.programme === OTHER_PROGRAMME_VALUE &&
      value.programmeOther.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["programmeOther"],
        message: "Please enter your programme or degree.",
      })
    }
  })

const defaultNewsletterValues: NewsletterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  university: "",
  universityOther: "",
  programme: "",
  programmeOther: "",
  graduationYear: "",
  interests: [],
  dataRetentionConsent: false,
}

type SubmitState =
  | {
      type: "success" | "error"
      message: string
    }
  | null

type NewsletterFormProps = {
  variant?: "page" | "card"
  className?: string
}

function NewsletterFormFields({
  className,
}: Omit<NewsletterFormProps, "variant">) {
  const [submitState, setSubmitState] = useState<SubmitState>(null)
  const submitNewsletterSubscription = useSubmitNewsletterSubscription()

  const form = useForm({
    defaultValues: defaultNewsletterValues,
    validators: {
      onMount: newsletterSchema,
      onBlur: newsletterSchema,
      onSubmit: newsletterSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitState(null)

      try {
        await submitNewsletterSubscription.mutateAsync({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          gender: value.gender as ApplicationGender,
          university: resolveUniversity(value),
          programme: resolveProgramme(value),
          graduationYear: Number(value.graduationYear),
          interests: value.interests,
          dataRetentionConsent: value.dataRetentionConsent,
        })
      } catch (error) {
        setSubmitState({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to subscribe.",
        })
        return
      }

      setSubmitState({
        type: "success",
        message: "Successfully subscribed to our newsletter!",
      })
      form.reset()
    },
  })

  return (
    <form
      id="newsletter-form"
      noValidate
      className={cn("w-full", className)}
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <form.Field name="firstName">
            {(field) => {
              const isInvalid = fieldIsInvalid(field.state.meta)
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      setSubmitState(null)
                      field.handleChange(event.target.value)
                    }}
                    placeholder="Alan"
                    autoComplete="given-name"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="lastName">
            {(field) => {
              const isInvalid = fieldIsInvalid(field.state.meta)
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      setSubmitState(null)
                      field.handleChange(event.target.value)
                    }}
                    placeholder="Turing"
                    autoComplete="family-name"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="email">
          {(field) => {
            const isInvalid = fieldIsInvalid(field.state.meta)

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>@</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      setSubmitState(null)
                      field.handleChange(event.target.value)
                    }}
                    placeholder="alan@turing.com"
                    autoComplete="email"
                    aria-invalid={isInvalid}
                  />
                </InputGroup>
                <FieldDescription>
                  We&apos;ll only send updates related to the KTH AI community.
                </FieldDescription>
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="gender">
          {(field) => {
            const isInvalid = fieldIsInvalid(field.state.meta)
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                <NativeSelect
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    setSubmitState(null)
                    field.handleChange(event.target.value as ApplicationGender | "")
                  }}
                  aria-invalid={isInvalid}
                >
                  <NativeSelectOption value="">
                    Select your gender
                  </NativeSelectOption>
                  {APPLICATION_GENDERS.map((gender) => (
                    <NativeSelectOption key={gender} value={gender}>
                      {gender}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <form.Field name="university">
            {(field) => {
              const isInvalid = fieldIsInvalid(field.state.meta)
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>University</FieldLabel>
                  <NativeSelect
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      setSubmitState(null)
                      field.handleChange(event.target.value)
                    }}
                    aria-invalid={isInvalid}
                  >
                    <NativeSelectOption value="">
                      Select your university
                    </NativeSelectOption>
                    {UNIVERSITIES.map((university) => (
                      <NativeSelectOption key={university} value={university}>
                        {university}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.university}>
            {(university) =>
              university === OTHER_UNIVERSITY_VALUE ? (
                <form.Field name="universityOther">
                  {(field) => {
                    const isInvalid = fieldIsInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Other university
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            setSubmitState(null)
                            field.handleChange(event.target.value)
                          }}
                          placeholder="Enter your university"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    )
                  }}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          <form.Field name="programme">
            {(field) => {
              const isInvalid = fieldIsInvalid(field.state.meta)
              return (
                <Field data-invalid={isInvalid}>
                  <ProgrammeSelect
                    id={field.name}
                    value={field.state.value}
                    onValueChange={(programme) => {
                      setSubmitState(null)
                      field.handleChange(programme)
                      field.handleBlur()
                    }}
                    placeholder="Engineering Physics"
                    customOptions={[OTHER_PROGRAMME_VALUE]}
                  />
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.programme}>
            {(programme) =>
              programme === OTHER_PROGRAMME_VALUE ? (
                <form.Field name="programmeOther">
                  {(field) => {
                    const isInvalid = fieldIsInvalid(field.state.meta)
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Programme or degree
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            setSubmitState(null)
                            field.handleChange(event.target.value)
                          }}
                          placeholder="Enter your programme or degree"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    )
                  }}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          <form.Field name="graduationYear">
            {(field) => {
              const isInvalid = fieldIsInvalid(field.state.meta)
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Expected graduation year
                  </FieldLabel>
                  <NativeSelect
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      setSubmitState(null)
                      field.handleChange(event.target.value)
                    }}
                    aria-invalid={isInvalid}
                  >
                    <NativeSelectOption value="">
                      Select graduation year
                    </NativeSelectOption>
                    {GRADUATION_YEAR_OPTIONS.map((year) => (
                      <NativeSelectOption key={year} value={year}>
                        {year}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="interests">
          {(field) => {
            const isInvalid = fieldIsInvalid(field.state.meta)
            return (
              <InterestsField
                id={field.name}
                value={field.state.value}
                onChange={(value) => {
                  setSubmitState(null)
                  field.handleChange(value)
                }}
                onBlur={field.handleBlur}
                isInvalid={isInvalid}
                errors={isInvalid ? field.state.meta.errors : undefined}
                description="Select at least one industry or area that you are interested in."
              />
            )
          }}
        </form.Field>

        <form.Field name="dataRetentionConsent">
          {(field) => {
            const isInvalid = fieldIsInvalid(field.state.meta)
            return (
              <Field data-invalid={isInvalid}>
                <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                  <Checkbox
                    className="mt-0.5"
                    checked={field.state.value}
                    onCheckedChange={(value) => {
                      setSubmitState(null)
                      field.handleChange(Boolean(value))
                      field.handleBlur()
                    }}
                    aria-invalid={isInvalid}
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">
                      I consent to KTH AI Society collecting and storing my
                      information to send me newsletter updates.
                    </span>
                    <span className="block text-muted-foreground">
                      You can unsubscribe at any time.
                    </span>
                  </span>
                </label>
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        {submitState ? (
          <Alert
            variant={submitState.type === "error" ? "destructive" : "success"}
          >
            {submitState.type === "error" ? <AlertCircle /> : <CheckCircle2 />}
            <AlertTitle>
              {submitState.type === "error"
                ? "Subscription failed"
                : "Subscription confirmed"}
            </AlertTitle>
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        ) : null}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  )
}

export function NewsletterForm({
  variant = "card",
  className,
}: NewsletterFormProps) {
  const [newsletterTextMask, setNewsletterTextMask] = useState<
    string | undefined
  >(undefined)

  useEffect(() => {
    if (variant !== "page") {
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 400
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "bold 180px system-ui, -apple-system, sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText("NEWSLETTER", 40, 70)

    const dataUrl = canvas.toDataURL("image/png")
    requestAnimationFrame(() => {
      setNewsletterTextMask(dataUrl)
    })
  }, [variant])

  if (variant === "card") {
    return <NewsletterFormFields className={className} />
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-white pt-64 pb-24 text-secondary-black">
        <div className="pointer-events-none absolute inset-0">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={newsletterTextMask}
            logoPosition="center"
            logoScale={0.58}
            enableDripping={false}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,white_100%)]" />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl px-4 pb-8 md:px-6">
          <h4 className="mb-2 text-3xl tracking-tighter">
            <span className="font-times font-normal text-primary">
              (Newsletter)
            </span>{" "}
            Updates
          </h4>
          <h1 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            Stay Updated
          </h1>
        </div>
      </section>

      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative z-20 mx-auto -mt-24 mb-24 flex max-w-7xl flex-col gap-8 rounded-3xl border bg-neutral-50 p-4 shadow-lg md:p-8">
          <div className="flex max-w-3xl flex-col gap-2">
            <div>
              <Link
                href="/"
                className="text-sm font-medium text-secondary-gray transition-colors hover:text-primary"
              >
                Home
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-sm font-medium text-primary">
                Newsletter
              </span>
            </div>
            <p className="max-w-2xl text-lg leading-relaxed opacity-95 md:text-xl">
              Join our mailing list for major society updates, upcoming
              events, new projects, and curated AI community news.
            </p>
          </div>

          <NewsletterFormFields className={cn("max-w-2xl", className)} />
        </section>
      </div>
    </div>
  )
}
