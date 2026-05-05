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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { API_URL } from "@/config"

const newsletterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(80, "Please keep your name under 80 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .refine(
      (value) =>
        value.length === 0 || z.string().email().safeParse(value).success,
      "Please enter a valid email address."
    ),
})

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

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
    validators: {
      onBlur: newsletterSchema,
      onSubmit: newsletterSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitState(null)

      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: value.name.trim(),
          email: value.email.trim(),
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      if (!response.ok) {
        setSubmitState({
          type: "error",
          message: data?.error ?? "Failed to subscribe.",
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
      className={cn("w-full sm:max-w-md", className)}
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      setSubmitState(null)
                      field.handleChange(event.target.value)
                    }}
                    placeholder="Alan Turing"
                    autoComplete="name"
                    aria-invalid={isInvalid}
                  />
                </InputGroup>
                <FieldDescription>
                  We&apos;ll use your name in newsletter emails.
                </FieldDescription>
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

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
            <span className="font-serif font-normal text-primary">
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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
          </div>

          <NewsletterFormFields className={cn("sm:max-w-lg", className)} />
        </section>
      </div>
    </div>
  )
}
