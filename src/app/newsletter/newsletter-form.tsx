"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const newsletterSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
})

type SubmitState =
  | {
      type: "success" | "error"
      message: string
    }
  | null

export function NewsletterForm() {
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

      const response = await fetch("/api/newsletter/subscribe", {
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
    <section className="bg-white pt-32 pb-20 text-foreground">
      <div className="container mx-auto flex max-w-7xl flex-col gap-12 px-4 md:px-6">
        <div className="max-w-3xl">
          <h4 className="mb-2 text-3xl tracking-tighter">
            <span className="font-serif font-normal text-primary">
              (Newsletter)
            </span>{" "}
            Updates
          </h4>
          <h1 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl">
            Stay Updated
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-foreground/80 md:text-xl">
            Join our newsletter to stay informed about upcoming events, new
            projects, and the latest AI community news from the KTH AI Society.
          </p>
        </div>

        <Card className="mx-auto w-full max-w-3xl rounded-3xl border shadow-lg">
          <CardHeader className="gap-3 p-6 md:p-8">
            <CardTitle className="text-2xl tracking-tight md:text-3xl">
              Sign up
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-relaxed">
              Share your name and email to receive major community updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 md:p-8 md:pt-0">
            <form
              noValidate
              className="w-full"
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
                        <Input
                          id={field.name}
                          name={field.name}
                          type="text"
                          placeholder="Alan"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            setSubmitState(null)
                            field.handleChange(event.target.value)
                          }}
                          aria-invalid={isInvalid}
                          className="h-12"
                        />
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
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          placeholder="alan@turing.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            setSubmitState(null)
                            field.handleChange(event.target.value)
                          }}
                          aria-invalid={isInvalid}
                          className="h-12"
                        />
                        <FieldDescription>
                          We&apos;ll only send updates related to the KTH AI
                          community.
                        </FieldDescription>
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      size="xl"
                      disabled={!canSubmit || isSubmitting}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            data-icon="inline-start"
                            className="animate-spin"
                          />
                          Subscribing...
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  )}
                </form.Subscribe>

                {submitState ? (
                  <Alert
                    variant={
                      submitState.type === "error" ? "destructive" : "success"
                    }
                  >
                    {submitState.type === "error" ? (
                      <AlertCircle />
                    ) : (
                      <CheckCircle2 />
                    )}
                    <AlertTitle>
                      {submitState.type === "error"
                        ? "Subscription failed"
                        : "Subscription confirmed"}
                    </AlertTitle>
                    <AlertDescription>{submitState.message}</AlertDescription>
                  </Alert>
                ) : null}
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
