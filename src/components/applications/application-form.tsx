"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ProgrammeSelect } from "@/components/member/programme-select";
import { ResumeUploadField } from "@/components/applications/resume-upload-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { TeamBentoGrid, TEAM_ART } from "@/components/ui/team-bento-grid";
import { useSubmitGeneralApplication } from "@/hooks/applications";
import {
  APPLICATION_AVAILABILITY,
  APPLICATION_TEAM_DESCRIPTIONS,
  APPLICATION_TEAMS,
  type ApplicationAvailability,
  APPLICATION_GENDERS,
  type ApplicationGender,
  type ApplicationTeam,
} from "@/types/applications";

const OTHER_PROGRAMME_VALUE = "Other / not listed";

const LINKEDIN_HANDLE_PREFIX = "linkedin.com/in/";
const LINKEDIN_HANDLE_PATTERN = /^[A-Za-z0-9_-]{3,100}$/;

function normalizeLinkedInHandle(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?linkedin\.com\/in\//i, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function buildLinkedInUrl(handle: string) {
  return `https://${LINKEDIN_HANDLE_PREFIX}${normalizeLinkedInHandle(handle)}`;
}

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const APPLICATION_STEPS = [
  {
    title: "Welcome",
    description: "About KTH AI Society and the teams.",
    fields: [] as const,
  },
  {
    title: "Details",
    description: "Your contact and study information.",
    fields: [
      "firstName",
      "lastName",
      "email",
      "gender",
      "programme",
      "programmeOther",
      "graduationYear",
    ] as const,
  },
  {
    title: "Profile",
    description: "Links and resume.",
    fields: ["linkedinUrl", "additionalLinksText", "resume"] as const,
  },
  {
    title: "Teams",
    description: "Where you want to contribute.",
    fields: ["teams", "teamInterestReason"] as const,
  },
  {
    title: "Commitment",
    description: "Availability and motivation.",
    fields: ["availability", "contribution"] as const,
  },
  {
    title: "Review",
    description: "Confirm and submit.",
    fields: ["dataRetentionConsent"] as const,
  },
] as const;

type ApplicationStepField =
  (typeof APPLICATION_STEPS)[number]["fields"][number];

type SubmitState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

type ApplicationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  gender: ApplicationGender | "";
  programme: string;
  programmeOther: string;
  graduationYear: string;
  linkedinUrl: string;
  additionalLinksText: string;
  resume: File | null;
  teams: ApplicationTeam[];
  teamInterestReason: string;
  availability: ApplicationAvailability | "";
  contribution: string;
  dataRetentionConsent: boolean;
};

function resolveProgramme(values: Pick<ApplicationFormValues, "programme" | "programmeOther">) {
  return values.programme === OTHER_PROGRAMME_VALUE
    ? values.programmeOther.trim()
    : values.programme.trim();
}

function normalizeWebsiteLink(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function splitAdditionalLinks(value: string) {
  return value
    .split(/[\n,]+/)
    .map((link) => link.trim())
    .filter(Boolean)
    .map(normalizeWebsiteLink);
}

function isWebsiteLink(value: string) {
  try {
    const url = new URL(normalizeWebsiteLink(value));
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function isAllowedResume(file: File | null) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  const hasAllowedExtension = RESUME_EXTENSIONS.some((extension) =>
    name.endsWith(extension),
  );
  const hasAllowedType =
    file.type === "" ||
    file.type === "application/octet-stream" ||
    RESUME_MIME_TYPES.includes(
      file.type as (typeof RESUME_MIME_TYPES)[number],
    );
  return hasAllowedExtension && hasAllowedType;
}

const applicationBaseSchema = z.object({
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
  programme: z.string().trim().min(1, "Please select your programme."),
  programmeOther: z
    .string()
    .trim()
    .max(120, "Please keep your programme under 120 characters."),
  graduationYear: z
    .string()
    .trim()
    .min(1, "Please enter your expected graduation year.")
    .refine((value) => /^\d{4}$/.test(value), "Use the format YYYY.")
    .refine((value) => {
      const year = Number(value);
      return year >= 2026 && year <= 2100;
    }, "Graduation year must be 2026 or later."),
  linkedinUrl: z
    .string()
    .trim()
    .min(1, "Please enter your LinkedIn handle.")
    .refine(
      (value) => LINKEDIN_HANDLE_PATTERN.test(normalizeLinkedInHandle(value)),
      "Enter just your LinkedIn handle (e.g. dario-amodei).",
    ),
  additionalLinksText: z.string().refine((value) => {
    const links = value
      .split(/[\n,]+/)
      .map((link) => link.trim())
      .filter(Boolean);
    return links.length <= 5 && links.every(isWebsiteLink);
  }, "Share up to 5 valid links (e.g. example.com), separated by new lines or commas."),
  resume: z
    .custom<File | null>((value) => value instanceof File || value === null)
    .refine((file) => file instanceof File, "Please upload your resume.")
    .refine(
      (file) => !file || file.size <= MAX_RESUME_BYTES,
      "Resume must be at most 10 MiB.",
    )
    .refine(isAllowedResume, "Resume must be a PDF, DOC, or DOCX file."),
  teams: z
    .array(z.enum(APPLICATION_TEAMS))
    .min(1, "Select at least one team."),
  teamInterestReason: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters.")
    .max(2000, "Please keep this answer under 2000 characters."),
  availability: z
    .union([z.enum(APPLICATION_AVAILABILITY), z.literal("")])
    .refine((value) => value !== "", "Please select your weekly availability."),
  contribution: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters.")
    .max(2000, "Please keep this answer under 2000 characters."),
  dataRetentionConsent: z
    .boolean()
    .refine(
      (value) => value,
      "You need to consent to data collection and storage before submitting.",
    ),
});

function validateProgrammeOther(
  value: Pick<ApplicationFormValues, "programme" | "programmeOther">,
  ctx: z.RefinementCtx,
) {
  if (
    value.programme === OTHER_PROGRAMME_VALUE &&
    value.programmeOther.trim().length === 0
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["programmeOther"],
      message: "Please enter your programme or degree.",
    });
  }
}

const applicationSchema = applicationBaseSchema.superRefine(
  validateProgrammeOther,
);

const stepSchemas = [
  z.object({}),
  applicationBaseSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    gender: true,
    programme: true,
    programmeOther: true,
    graduationYear: true,
  }).superRefine(validateProgrammeOther),
  applicationBaseSchema.pick({
    linkedinUrl: true,
    additionalLinksText: true,
    resume: true,
  }),
  applicationBaseSchema.pick({
    teams: true,
    teamInterestReason: true,
  }),
  applicationBaseSchema.pick({
    availability: true,
    contribution: true,
  }),
  applicationBaseSchema.pick({
    dataRetentionConsent: true,
  }),
] as const;

const applicationFieldValidators = {
  firstName: { onBlur: applicationBaseSchema.shape.firstName },
  lastName: { onBlur: applicationBaseSchema.shape.lastName },
  email: { onBlur: applicationBaseSchema.shape.email },
  gender: { onChange: applicationBaseSchema.shape.gender },
  programme: { onBlur: applicationBaseSchema.shape.programme },
  programmeOther: { onBlur: applicationBaseSchema.shape.programmeOther },
  graduationYear: { onBlur: applicationBaseSchema.shape.graduationYear },
  linkedinUrl: { onBlur: applicationBaseSchema.shape.linkedinUrl },
  additionalLinksText: { onBlur: applicationBaseSchema.shape.additionalLinksText },
  resume: { onBlur: applicationBaseSchema.shape.resume },
  teams: { onChange: applicationBaseSchema.shape.teams },
  teamInterestReason: { onBlur: applicationBaseSchema.shape.teamInterestReason },
  availability: { onChange: applicationBaseSchema.shape.availability },
  contribution: { onBlur: applicationBaseSchema.shape.contribution },
  dataRetentionConsent: {
    onChange: applicationBaseSchema.shape.dataRetentionConsent,
  },
};

function fieldIsInvalid(
  meta: { isTouched: boolean; isValid: boolean },
  showErrors = false,
) {
  return (meta.isTouched || showErrors) && !meta.isValid;
}

const defaultApplicationValues: ApplicationFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  programme: "",
  programmeOther: "",
  graduationYear: "",
  linkedinUrl: "",
  additionalLinksText: "",
  resume: null,
  teams: [],
  teamInterestReason: "",
  availability: "",
  contribution: "",
  dataRetentionConsent: false,
};

function ApplicationWizardProgress({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  const step = APPLICATION_STEPS[currentStep];

  return (
    <nav aria-label="Application progress" className="space-y-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          Step {currentStep + 1} of {APPLICATION_STEPS.length}
        </p>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
      </div>

      <ol className="grid grid-cols-6 gap-2">
        {APPLICATION_STEPS.map((applicationStep, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep;

          return (
            <li key={applicationStep.title}>
              <button
                type="button"
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => {
                  if (isClickable) onStepClick(index);
                }}
                className={cn(
                  "group flex h-8 w-full items-center rounded-sm transition-colors",
                  isClickable ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2 w-full rounded-full bg-muted transition-colors",
                    isCurrent && "bg-primary",
                    isComplete && "bg-primary/70",
                    isClickable && "group-hover:bg-primary",
                  )}
                />
                <span className="sr-only">{applicationStep.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium wrap-break-word">{value}</dd>
    </div>
  );
}

function ApplicationStepPanel({
  step,
  currentStep,
  children,
}: {
  step: number;
  currentStep: number;
  children: React.ReactNode;
}) {
  const isActive = currentStep === step;

  return (
    <div
      className={cn("space-y-6", !isActive && "invisible")}
      inert={!isActive ? true : undefined}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}

function ApplicationWizardComplete() {
  return (
    <nav aria-label="Application progress" className="space-y-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          Step {APPLICATION_STEPS.length} of {APPLICATION_STEPS.length}
        </p>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Application submitted
          </h2>
          <p className="text-sm text-muted-foreground">
            Thanks. We have received your application.
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-6 gap-2" aria-hidden="true">
        {APPLICATION_STEPS.map((applicationStep) => (
          <li key={applicationStep.title}>
            <span className="flex h-8 w-full items-center">
              <span className="h-2 w-full rounded-full bg-primary" />
              <span className="sr-only">{applicationStep.title}</span>
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ApplicationSubmissionConfirmation({
  values,
}: {
  values: ApplicationFormValues;
}) {
  const applicantName = `${values.firstName} ${values.lastName}`.trim();

  return (
    <div className="space-y-8">
      <ApplicationWizardComplete />

      <div className="space-y-4">
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">You&apos;re all set</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ll review your application and follow up at{" "}
                <span className="font-medium text-foreground">{values.email}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-3 text-sm font-semibold">Application summary</h3>
          <dl className="space-y-2 text-sm">
            <ReviewItem label="Name" value={applicantName} />
            <ReviewItem label="Email" value={values.email} />
            <ReviewItem label="Programme" value={resolveProgramme(values)} />
            <ReviewItem label="Teams" value={values.teams.join(", ")} />
            <ReviewItem label="Availability" value={values.availability} />
          </dl>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <h3 className="text-sm font-semibold">What happens next</h3>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-medium text-foreground">1.</span>
              <span>Our team reviews your application and team preferences.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium text-foreground">2.</span>
              <span>You&apos;ll hear from us by email with next steps.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium text-foreground">3.</span>
              <span>
                Keep an eye on our events while you wait to get involved with
                the community.
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline">
          <Link href="/events">Explore events</Link>
        </Button>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

function ApplicationIntro({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          KTH AI Society is a student organisation cultivating the next
          generation of AI leaders. We grow AI literacy, bridge academia and
          industry, and share new insights through projects, research, and
          events.
        </p>
        <p>Find your team and help build the community.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Our teams</h3>
        <TeamBentoGrid
          items={APPLICATION_TEAMS.map((team) => ({
            title: team,
            description: APPLICATION_TEAM_DESCRIPTIONS[team],
            ...TEAM_ART[team],
          }))}
        />
      </div>

      <Button type="button" className="w-full sm:w-auto" onClick={onBegin}>
        Begin application
        <ChevronRight data-icon="inline-end" />
      </Button>
    </div>
  );
}

export function ApplicationForm() {
  const submitApplication = useSubmitGeneralApplication();
  const [submitState, setSubmitState] = useState<SubmitState>(null);
  const [fileInputKey] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStepErrors, setShowStepErrors] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    defaultValues: defaultApplicationValues,
    validators: {
      onSubmit: applicationSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitState(null);
      const parsed = applicationSchema.safeParse(value);
      if (!parsed.success) {
        setShowStepErrors(true);
        setSubmitState({
          type: "error",
          message: "Please fix the highlighted fields before submitting.",
        });
        return;
      }

      try {
        if (!parsed.data.resume) {
          setSubmitState({
            type: "error",
            message: "Please fix the highlighted fields before submitting.",
          });
          return;
        }

        const programme = resolveProgramme(parsed.data);
        await submitApplication.mutateAsync({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          gender: parsed.data.gender,
          programme,
          graduationYear: Number(parsed.data.graduationYear),
          linkedinUrl: buildLinkedInUrl(parsed.data.linkedinUrl),
          additionalLinks: splitAdditionalLinks(parsed.data.additionalLinksText),
          resume: parsed.data.resume,
          teams: parsed.data.teams,
          teamInterestReason: parsed.data.teamInterestReason,
          availability: parsed.data.availability,
          contribution: parsed.data.contribution,
          dataRetentionConsent: parsed.data.dataRetentionConsent,
        });
        setSubmitState({
          type: "success",
          message: "Thanks. We have received your application.",
        });
        setShowStepErrors(false);
      } catch (error) {
        const message =
          error instanceof Error && error.name === "DuplicateApplicationError"
            ? "An application already exists for this email address."
            : error instanceof Error
              ? error.message
              : "Failed to submit application. Please try again.";
        setSubmitState({ type: "error", message });
      }
    },
  });

  async function touchAndValidateStepFields(fields: readonly ApplicationStepField[]) {
    for (const fieldName of fields) {
      await form.validateField(fieldName, "blur");
      if (fieldName === "teams" || fieldName === "availability") {
        await form.validateField(fieldName, "change");
      }
    }
  }

  async function validateCurrentStep() {
    const step = APPLICATION_STEPS[currentStep];
    if (currentStep === APPLICATION_STEPS.length - 1) {
      return applicationSchema.safeParse(form.state.values).success;
    }

    await touchAndValidateStepFields(step.fields);
    const isValid = stepSchemas[currentStep].safeParse(form.state.values).success;
    if (!isValid) {
      setShowStepErrors(true);
    }
    return isValid;
  }

  async function goToNextStep() {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    setShowStepErrors(false);
    setCurrentStep((step) => Math.min(step + 1, APPLICATION_STEPS.length - 1));
  }

  function goToPreviousStep() {
    setSubmitState(null);
    setShowStepErrors(false);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function goToStep(step: number) {
    setSubmitState(null);
    setShowStepErrors(false);
    setCurrentStep(step);
  }

  const isReviewStep = currentStep === APPLICATION_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const isIntroStep = currentStep === 0;
  const isSubmitted = submitState?.type === "success";

  useEffect(() => {
    if (isSubmitted) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isSubmitted]);

  if (isSubmitted) {
    return (
      <div ref={formRef}>
        <ApplicationSubmissionConfirmation values={form.state.values} />
      </div>
    );
  }

  return (
    <div ref={formRef}>
    <form
      noValidate
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (isReviewStep) {
          void form.handleSubmit();
        } else {
          void goToNextStep();
        }
      }}
    >
      <ApplicationWizardProgress
        currentStep={currentStep}
        onStepClick={goToStep}
      />

      <FieldGroup className="space-y-6">
        {isReviewStep ? (
          <form.Subscribe selector={(state) => state.values}>
            {(values) => {
              const additionalLinks = splitAdditionalLinks(
                values.additionalLinksText,
              );

              return (
                <div className="space-y-4">
                  <ReviewSection title="Details" onEdit={() => goToStep(0)}>
                    <ReviewItem
                      label="Name"
                      value={`${values.firstName} ${values.lastName}`.trim()}
                    />
                    <ReviewItem label="Email" value={values.email} />
                    <ReviewItem label="Gender" value={values.gender} />
                    <ReviewItem
                      label="Programme"
                      value={resolveProgramme(values)}
                    />
                    <ReviewItem
                      label="Graduation"
                      value={values.graduationYear}
                    />
                  </ReviewSection>

                  <ReviewSection
                    title="Profile"
                    onEdit={() => goToStep(1)}
                  >
                    <ReviewItem
                      label="LinkedIn"
                      value={buildLinkedInUrl(values.linkedinUrl)}
                    />
                    <ReviewItem
                      label="Other links"
                      value={
                        additionalLinks.length > 0 ? (
                          <ul className="space-y-1">
                            {additionalLinks.map((link) => (
                              <li key={link}>{link}</li>
                            ))}
                          </ul>
                        ) : (
                          "None provided"
                        )
                      }
                    />
                    <ReviewItem
                      label="Resume"
                      value={values.resume?.name ?? "No file uploaded"}
                    />
                  </ReviewSection>

                  <ReviewSection title="Teams" onEdit={() => goToStep(2)}>
                    <ReviewItem
                      label="Teams"
                      value={values.teams.join(", ")}
                    />
                    <ReviewItem
                      label="Why these teams"
                      value={values.teamInterestReason}
                    />
                  </ReviewSection>

                  <ReviewSection
                    title="Commitment"
                    onEdit={() => goToStep(3)}
                  >
                    <ReviewItem
                      label="Availability"
                      value={values.availability}
                    />
                    <ReviewItem
                      label="Motivation"
                      value={values.contribution}
                    />
                  </ReviewSection>

                  <form.Field
                    name="dataRetentionConsent"
                    validators={applicationFieldValidators.dataRetentionConsent}
                  >
                    {(field) => {
                      const isInvalid = fieldIsInvalid(
                        field.state.meta,
                        showStepErrors,
                      );
                      return (
                        <Field data-invalid={isInvalid}>
                          <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                            <Checkbox
                              className="mt-0.5"
                              checked={field.state.value}
                              onCheckedChange={(value) => {
                                setSubmitState(null);
                                field.handleChange(Boolean(value));
                                field.handleBlur();
                              }}
                              aria-invalid={isInvalid}
                            />
                            <span className="space-y-1">
                              <span className="block font-medium">
                                I consent to KTH AI Society collecting and
                                storing my application data for up to 2 years.
                              </span>
                              <span className="block text-muted-foreground">
                                This includes the information in this form and
                                my uploaded resume for application review and
                                follow-up.
                              </span>
                            </span>
                          </label>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>
                </div>
              );
            }}
          </form.Subscribe>
        ) : (
          <div className="grid *:col-start-1 *:row-start-1 *:w-full">
            <ApplicationStepPanel step={0} currentStep={currentStep}>
              <ApplicationIntro onBegin={goToNextStep} />
            </ApplicationStepPanel>

            <ApplicationStepPanel step={1} currentStep={currentStep}>
            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field
                name="firstName"
                validators={applicationFieldValidators.firstName}
              >
                {(field) => {
                  const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          setSubmitState(null);
                          field.handleChange(event.target.value);
                        }}
                        autoComplete="given-name"
                        placeholder="Dario"
                        aria-invalid={isInvalid}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="lastName"
                validators={applicationFieldValidators.lastName}
              >
                {(field) => {
                  const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          setSubmitState(null);
                          field.handleChange(event.target.value);
                        }}
                        autoComplete="family-name"
                        placeholder="Amodei"
                        aria-invalid={isInvalid}
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
              name="email"
              validators={applicationFieldValidators.email}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setSubmitState(null);
                        field.handleChange(event.target.value);
                      }}
                      autoComplete="email"
                      placeholder="dario@anthropic.com"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="gender"
              validators={applicationFieldValidators.gender}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                    <NativeSelect
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setSubmitState(null);
                        field.handleChange(event.target.value as ApplicationGender | "");
                        field.handleBlur();
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
                );
              }}
            </form.Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field
                name="programme"
                validators={applicationFieldValidators.programme}
              >
                {(field) => {
                  const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                  return (
                    <Field data-invalid={isInvalid}>
                      <ProgrammeSelect
                        id={field.name}
                        value={field.state.value}
                        onValueChange={(programme) => {
                          setSubmitState(null);
                          field.handleChange(programme);
                          field.handleBlur();
                        }}
                        placeholder="Engineering Physics"
                        customOptions={[OTHER_PROGRAMME_VALUE]}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.programme}>
                {(programme) =>
                  programme === OTHER_PROGRAMME_VALUE ? (
                    <form.Field
                      name="programmeOther"
                      validators={applicationFieldValidators.programmeOther}
                    >
                      {(field) => {
                        const isInvalid = fieldIsInvalid(
                          field.state.meta,
                          showStepErrors,
                        );
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
                                setSubmitState(null);
                                field.handleChange(event.target.value);
                              }}
                              placeholder="Your university and degree"
                              aria-invalid={isInvalid}
                            />
                            <FieldDescription>
                              Non-KTH applicants can apply, but KTH students may
                              be prioritised.
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError errors={field.state.meta.errors} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ) : null
                }
              </form.Subscribe>

              <form.Field
                name="graduationYear"
                validators={applicationFieldValidators.graduationYear}
              >
                {(field) => {
                  const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Expected graduation year
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={2026}
                        max={2100}
                        placeholder="2028"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          setSubmitState(null);
                          field.handleChange(event.target.value);
                        }}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
            </ApplicationStepPanel>

            <ApplicationStepPanel step={2} currentStep={currentStep}>
            <form.Field
              name="linkedinUrl"
              validators={applicationFieldValidators.linkedinUrl}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      LinkedIn profile
                    </FieldLabel>
                    <InputGroup data-invalid={isInvalid}>
                      <InputGroupAddon className="text-muted-foreground">
                        {LINKEDIN_HANDLE_PREFIX}
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          setSubmitState(null);
                          field.handleChange(event.target.value);
                        }}
                        placeholder="dario-amodei"
                        aria-invalid={isInvalid}
                      />
                    </InputGroup>
                    
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="additionalLinksText"
              validators={applicationFieldValidators.additionalLinksText}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Other links</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setSubmitState(null);
                        field.handleChange(event.target.value);
                      }}
                      placeholder="darioamodei.com, anthropic.com"
                      className="min-h-20 resize-y"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      GitHub, portfolio, personal website, or other relevant
                      work. Add up to 5 links.
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="resume"
              validators={applicationFieldValidators.resume}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Resume</FieldLabel>
                    <ResumeUploadField
                      id={field.name}
                      value={field.state.value}
                      inputKey={fileInputKey}
                      invalid={isInvalid}
                      onBlur={field.handleBlur}
                      onChange={(file) => {
                        setSubmitState(null);
                        field.handleChange(file);
                      }}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
            </ApplicationStepPanel>

            <ApplicationStepPanel step={3} currentStep={currentStep}>
            <form.Field
              name="teams"
              validators={applicationFieldValidators.teams}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Preferred teams</FieldLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {APPLICATION_TEAMS.map((team) => {
                        const checked = field.state.value.includes(team);
                        return (
                          <label
                            key={team}
                            className={cn(
                              "flex items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors hover:bg-secondary/20",
                              checked && "border-primary/40 bg-primary/5",
                            )}
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={checked}
                              onCheckedChange={(value) => {
                                setSubmitState(null);
                                field.handleChange(
                                  value
                                    ? [...field.state.value, team]
                                    : field.state.value.filter(
                                        (selected: ApplicationTeam) =>
                                          selected !== team,
                                      ),
                                );
                                field.handleBlur();
                              }}
                              aria-invalid={isInvalid}
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{team}</span>
                              <span className="text-xs leading-5 text-muted-foreground">
                                {APPLICATION_TEAM_DESCRIPTIONS[team]}
                              </span>
                            </div>
                          </label>
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
              name="teamInterestReason"
              validators={applicationFieldValidators.teamInterestReason}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Why these teams?
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setSubmitState(null);
                        field.handleChange(event.target.value.slice(0, 2000));
                      }}
                      className="min-h-24 resize-y"
                      maxLength={2000}
                      placeholder="Briefly explain what interests you and what you would like to work on."
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      {field.state.value.length} / 2000 characters
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
            </ApplicationStepPanel>

            <ApplicationStepPanel step={4} currentStep={currentStep}>
            <form.Field
              name="availability"
              validators={applicationFieldValidators.availability}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Weekly availability</FieldLabel>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) => {
                        setSubmitState(null);
                        field.handleChange(value as ApplicationAvailability);
                        field.handleBlur();
                      }}
                      className="gap-3"
                    >
                      {APPLICATION_AVAILABILITY.map((availability) => (
                        <label
                          key={availability}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-secondary/20",
                            field.state.value === availability &&
                              "border-primary/40 bg-primary/5",
                          )}
                        >
                          <RadioGroupItem
                            value={availability}
                            aria-invalid={isInvalid}
                          />
                          <span className="font-medium">{availability}</span>
                        </label>
                      ))}
                    </RadioGroup>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="contribution"
              validators={applicationFieldValidators.contribution}
            >
              {(field) => {
                const isInvalid = fieldIsInvalid(field.state.meta, showStepErrors);
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Motivation and contribution
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setSubmitState(null);
                        field.handleChange(event.target.value.slice(0, 2000));
                      }}
                      className="min-h-24 resize-y"
                      maxLength={2000}
                      placeholder="Tell us why you want to join KTH AI Society and how you would contribute."
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      {field.state.value.length} / 2000 characters
                    </FieldDescription>
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>
            </ApplicationStepPanel>
          </div>
        )}

        {submitState ? (
          <Alert
            variant={submitState.type === "error" ? "destructive" : "success"}
          >
            {submitState.type === "error" ? <AlertCircle /> : <CheckCircle2 />}
            <AlertTitle>
              {submitState.type === "error"
                ? "Application not submitted"
                : "Application submitted"}
            </AlertTitle>
            <AlertDescription>{submitState.message}</AlertDescription>
          </Alert>
        ) : null}

        {isIntroStep ? null : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isFirstStep}
            onClick={goToPreviousStep}
            className={cn(isFirstStep && "invisible")}
          >
            <ChevronLeft data-icon="inline-start" />
            Back
          </Button>

          {isReviewStep ? (
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    "Submit application"
                  )}
                </Button>
              )}
            </form.Subscribe>
          ) : (
            <Button type="submit">
              Continue
              <ChevronRight data-icon="inline-end" />
            </Button>
          )}
        </div>
        )}
      </FieldGroup>
    </form>
    </div>
  );
}
