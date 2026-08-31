"use client";

import { useMemo, useState } from "react";
import { eachDayOfInterval, format, parseISO, startOfDay } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPLICATION_TEAMS,
  APPLICATION_TEAM_LABELS,
  type ApplicationTeam,
  type GeneralApplication,
} from "@/types/applications";

// Fixed hue-order categorical palette, colorblind-validated (adjacent-pair
// gates) at both light and dark surfaces — see the dataviz skill. Assigned in
// APPLICATION_TEAMS order so a team's color means the same thing everywhere
// this dashboard is read.
const TEAM_COLORS: Record<ApplicationTeam, { light: string; dark: string }> = {
  Business: { light: "#2a78d6", dark: "#3987e5" },
  Development: { light: "#eb6834", dark: "#d95926" },
  Research: { light: "#1baf7a", dark: "#199e70" },
  Growth: { light: "#eda100", dark: "#c98500" },
  IT: { light: "#e87ba4", dark: "#d55181" },
};

const teamChartConfig: ChartConfig = Object.fromEntries(
  APPLICATION_TEAMS.map((team) => [
    team,
    { label: APPLICATION_TEAM_LABELS[team], theme: TEAM_COLORS[team] },
  ]),
);

const aggregateChartConfig: ChartConfig = {
  total: { label: "Applications", theme: TEAM_COLORS.Business },
};

type DayBucket = { date: string; label: string; total: number } & Record<
  ApplicationTeam,
  number
>;

function emptyTeamCounts(): Record<ApplicationTeam, number> {
  return Object.fromEntries(APPLICATION_TEAMS.map((team) => [team, 0])) as Record<
    ApplicationTeam,
    number
  >;
}

export function ApplicationAnalyticsPanel({
  applications,
  isLoading,
}: {
  applications: GeneralApplication[];
  isLoading: boolean;
}) {
  const [showTable, setShowTable] = useState(false);

  const { totalApplicants, teamCounts, series, dateRangeLabel } = useMemo(() => {
    const counts = emptyTeamCounts();
    applications.forEach((application) => {
      application.teams.forEach((team) => {
        counts[team] += 1;
      });
    });

    if (applications.length === 0) {
      return { totalApplicants: 0, teamCounts: counts, series: [] as DayBucket[], dateRangeLabel: "" };
    }

    const submittedDays = applications.map((application) =>
      startOfDay(parseISO(application.created_at)),
    );
    const minDay = submittedDays.reduce((a, b) => (a < b ? a : b));
    const maxDay = submittedDays.reduce((a, b) => (a > b ? a : b));

    const buckets = new Map<string, DayBucket>();
    eachDayOfInterval({ start: minDay, end: maxDay }).forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      buckets.set(key, { date: key, label: format(day, "MMM d"), total: 0, ...emptyTeamCounts() });
    });

    applications.forEach((application) => {
      const key = format(startOfDay(parseISO(application.created_at)), "yyyy-MM-dd");
      const bucket = buckets.get(key);
      if (!bucket) return;
      bucket.total += 1;
      application.teams.forEach((team) => {
        bucket[team] += 1;
      });
    });

    return {
      totalApplicants: applications.length,
      teamCounts: counts,
      series: Array.from(buckets.values()),
      dateRangeLabel: `${format(minDay, "MMM d, yyyy")} – ${format(maxDay, "MMM d, yyyy")}`,
    };
  }, [applications]);

  // Cap the number of rendered X-axis ticks so a long recruitment window
  // doesn't cram illegible labels together; short windows show every day.
  const xAxisInterval = series.length > 14 ? Math.ceil(series.length / 10) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {["total", ...APPLICATION_TEAMS].map((key) => (
            <Skeleton key={key} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No applications yet</CardTitle>
          <CardDescription>
            Analytics will appear here once applicants start submitting.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total applicants</CardDescription>
            <CardTitle className="font-mono text-2xl">{totalApplicants}</CardTitle>
          </CardHeader>
        </Card>
        {APPLICATION_TEAMS.map((team) => (
          <Card key={team}>
            <CardHeader className="pb-2">
              <CardDescription>{APPLICATION_TEAM_LABELS[team]}</CardDescription>
              <CardTitle className="font-mono text-2xl">{teamCounts[team]}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications over time</CardTitle>
          <CardDescription>{dateRangeLabel} · all teams combined</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={aggregateChartConfig} className="h-64 w-full">
            <AreaChart data={series} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={xAxisInterval}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                strokeWidth={2}
                fill="var(--color-total)"
                fillOpacity={0.1}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications by team over time</CardTitle>
          <CardDescription>{dateRangeLabel}</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setShowTable((prev) => !prev)}>
              {showTable ? "Hide" : "Show"} data table
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChartContainer config={teamChartConfig} className="h-72 w-full">
            <LineChart data={series} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={xAxisInterval}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
              <ChartLegend content={<ChartLegendContent />} />
              {APPLICATION_TEAMS.map((team) => (
                <Line
                  key={team}
                  type="monotone"
                  dataKey={team}
                  stroke={`var(--color-${team})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>

          {/* Relief for the chart's lower-contrast series (dataviz skill: a
              tooltip enhances but never gates — every value must be reachable
              without hovering). */}
          {showTable && (
            <div className="max-h-72 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {APPLICATION_TEAMS.map((team) => (
                      <TableHead key={team} className="text-right">
                        {APPLICATION_TEAM_LABELS[team]}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {series.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{day.label}</TableCell>
                      {APPLICATION_TEAMS.map((team) => (
                        <TableCell key={team} className="text-right font-mono">
                          {day[team]}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-mono font-medium">
                        {day.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
