"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ListChecks, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTeamQuestion,
  useDeleteTeamQuestion,
  useReorderTeamQuestions,
  useTeamQuestionDefinitions,
  useUpdateTeamQuestion,
} from "@/hooks/applications";
import {
  APPLICATION_TEAMS,
  APPLICATION_TEAM_LABELS,
  type ApplicationTeam,
  type TeamQuestion,
} from "@/types/applications";

function AddQuestionRow({ team }: { team: ApplicationTeam }) {
  const create = useCreateTeamQuestion();
  const [text, setText] = useState("");
  const [required, setRequired] = useState(true);

  function handleAdd() {
    if (!text.trim()) return;
    create.mutate(
      { team, text: text.trim(), required },
      { onSuccess: () => setText("") },
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed p-3 sm:flex-row sm:items-center">
      <Input
        placeholder="New question for this team..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={required} onCheckedChange={(v) => setRequired(v === true)} />
        Required
      </label>
      <Button type="button" size="sm" disabled={create.isPending || !text.trim()} onClick={handleAdd}>
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}

function QuestionRow({
  team,
  question,
  index,
  count,
  orderedIds,
}: {
  team: ApplicationTeam;
  question: TeamQuestion;
  index: number;
  count: number;
  orderedIds: string[];
}) {
  const update = useUpdateTeamQuestion();
  const del = useDeleteTeamQuestion();
  const reorder = useReorderTeamQuestions();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(question.text);
  const [required, setRequired] = useState(question.required);

  function move(direction: -1 | 1) {
    const next = [...orderedIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate({ team, orderedIds: next });
  }

  function handleSave() {
    if (!text.trim()) return;
    update.mutate(
      { id: question.id, text: text.trim(), required },
      { onSuccess: () => setEditing(false) },
    );
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-md border p-3">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={required} onCheckedChange={(v) => setRequired(v === true)} />
            Required
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={update.isPending} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 rounded-md border p-3">
      <div className="space-y-1">
        <p className="text-sm">{question.text}</p>
        {question.required && (
          <Badge variant="outline" className="text-xs">
            Required
          </Badge>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={index === 0 || reorder.isPending}
          onClick={() => move(-1)}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={index === count - 1 || reorder.isPending}
          onClick={() => move(1)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={del.isPending}
          onClick={() => del.mutate(question.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function TeamQuestionDefinitionsPanel() {
  const { data, isLoading } = useTeamQuestionDefinitions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListChecks className="h-4 w-4" />
          Team questions
        </CardTitle>
        <CardDescription>
          The questions applicants answer for each team they applied to. Editing is limited to
          that team&apos;s own admins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Accordion type="single" collapsible>
            {APPLICATION_TEAMS.map((team) => {
              const entry = data?.[team];
              const questions = entry?.questions ?? [];
              const canEdit = entry?.can_edit ?? false;
              const orderedIds = questions.map((q) => q.id);

              return (
                <AccordionItem key={team} value={team}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span>{APPLICATION_TEAM_LABELS[team]}</span>
                      <Badge variant="secondary">{questions.length}</Badge>
                      {!canEdit && (
                        <span className="text-xs text-muted-foreground">view only</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    {questions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No questions configured yet for this team.
                      </p>
                    )}
                    {questions.map((question, index) =>
                      canEdit ? (
                        <QuestionRow
                          key={question.id}
                          team={team}
                          question={question}
                          index={index}
                          count={questions.length}
                          orderedIds={orderedIds}
                        />
                      ) : (
                        <div key={question.id} className="rounded-md border p-3">
                          <p className="text-sm">{question.text}</p>
                          {question.required && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ),
                    )}
                    {canEdit && <AddQuestionRow team={team} />}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
