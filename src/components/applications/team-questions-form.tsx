"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useSubmitTeamQuestions,
  useTeamQuestionsForm,
} from "@/hooks/applications";
import {
  APPLICATION_TEAM_LABELS,
  type ApplicationTeam,
  type TeamQuestionsAnswers,
} from "@/types/applications";

type Draft = {
  answers: TeamQuestionsAnswers;
  withdrawnTeams: string[];
};

function draftStorageKey(token: string) {
  return `team-questions-draft:${token}`;
}

function loadDraft(token: string): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftStorageKey(token));
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch {
    window.localStorage.removeItem(draftStorageKey(token));
    return null;
  }
}

function saveDraft(token: string, draft: Draft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(draftStorageKey(token), JSON.stringify(draft));
  } catch {
    // Ignore quota errors — the draft is a convenience, not the source of truth.
  }
}

function clearDraft(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftStorageKey(token));
}

export function TeamQuestionsForm({ token }: { token: string }) {
  const { data: form, isLoading, error } = useTeamQuestionsForm(token);
  const submit = useSubmitTeamQuestions();

  // The draft only depends on the token (not the fetched form), so it can be
  // read synchronously on first render instead of round-tripping through an effect.
  const [answers, setAnswers] = useState<TeamQuestionsAnswers>(
    () => loadDraft(token)?.answers ?? {},
  );
  const [withdrawnTeams, setWithdrawnTeams] = useState<Set<string>>(
    () => new Set(loadDraft(token)?.withdrawnTeams ?? []),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    saveDraft(token, { answers, withdrawnTeams: Array.from(withdrawnTeams) });
  }, [answers, withdrawnTeams, token]);

  const activeTeams = useMemo(
    () => (form?.teams ?? []).filter((team) => !withdrawnTeams.has(team)),
    [form, withdrawnTeams],
  );

  function setAnswer(team: string, questionId: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [team]: { ...prev[team], [questionId]: value },
    }));
  }

  function toggleWithdrawn(team: string, withdrawn: boolean) {
    setWithdrawnTeams((prev) => {
      const next = new Set(prev);
      if (withdrawn) next.add(team);
      else next.delete(team);
      return next;
    });
  }

  function handleSubmit() {
    if (!form) return;
    setValidationError(null);

    for (const team of activeTeams) {
      for (const question of form.questions[team as ApplicationTeam] ?? []) {
        if (question.required && !answers[team]?.[question.id]?.trim()) {
          setValidationError(
            `Please answer all required questions for ${APPLICATION_TEAM_LABELS[team as ApplicationTeam] ?? team}.`,
          );
          return;
        }
      }
    }

    const scopedAnswers: TeamQuestionsAnswers = {};
    for (const team of activeTeams) {
      scopedAnswers[team] = answers[team] ?? {};
    }

    submit.mutate(
      {
        token,
        answers: scopedAnswers,
        withdrawn_teams: Array.from(withdrawnTeams),
      },
      {
        onSuccess: () => clearDraft(token),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-16">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="mx-auto w-full max-w-xl py-24">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Link invalid or expired</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "This link is invalid or has expired."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (submit.isSuccess) {
    return (
      <div className="mx-auto w-full max-w-xl py-24">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Thanks, {form.first_name}!</AlertTitle>
          <AlertDescription>
            Your team questions have been submitted. We&apos;ll be in touch about next steps.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Team questions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hi {form.first_name} — please answer the questions below for each team you applied to.
          If you&apos;re no longer interested in one of them, you can mark it as such instead.
        </p>
      </div>

      {form.teams.map((team) => {
        const questions = form.questions[team] ?? [];
        const isWithdrawn = withdrawnTeams.has(team);

        return (
          <Card key={team}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>{APPLICATION_TEAM_LABELS[team] ?? team}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>No longer interested</span>
                <Switch
                  checked={isWithdrawn}
                  onCheckedChange={(checked) => toggleWithdrawn(team, checked)}
                />
              </div>
            </CardHeader>
            {!isWithdrawn && (
              <CardContent>
                <FieldGroup>
                  {questions.map((question) => (
                    <Field key={question.id}>
                      <FieldLabel htmlFor={`${team}-${question.id}`}>
                        {question.text}
                        {question.required && (
                          <span className="text-destructive"> *</span>
                        )}
                      </FieldLabel>
                      <Textarea
                        id={`${team}-${question.id}`}
                        value={answers[team]?.[question.id] ?? ""}
                        onChange={(event) =>
                          setAnswer(team, question.id, event.target.value)
                        }
                        rows={4}
                      />
                    </Field>
                  ))}
                </FieldGroup>
              </CardContent>
            )}
          </Card>
        );
      })}

      {(validationError || submit.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationError ??
              (submit.error instanceof Error ? submit.error.message : "Failed to submit")}
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSubmit} disabled={submit.isPending} size="lg">
        {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit
      </Button>
    </div>
  );
}
