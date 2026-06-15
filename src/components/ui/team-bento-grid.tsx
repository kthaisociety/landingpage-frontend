"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  FlaskConical,
  Handshake,
  Server,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const INK = "#1954A6";

/**
 * Abstract, generative SVG art for each team tile. Full-bleed, layered, and
 * looping — evocative of the team rather than literal icons.
 */
function ArtFrame({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={INK} stopOpacity="0.32" />
          <stop offset="100%" stopColor={INK} stopOpacity="0.02" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={INK} stopOpacity="0.22" />
          <stop offset="100%" stopColor={INK} stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
}

/** Business — partnership: two orbiting hubs linked by a breathing tether. */
function HandshakeArt() {
  return (
    <ArtFrame id="art-business">
      <rect width="200" height="120" fill="url(#art-business-glow)" />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 60px" }}
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <line
              key={i}
              x1="100"
              y1="60"
              x2={100 + Math.cos(a) * 70}
              y2={60 + Math.sin(a) * 40}
              stroke={INK}
              strokeOpacity="0.15"
              strokeWidth="0.75"
            />
          );
        })}
      </motion.g>
      {[
        { cx: 62, cy: 60 },
        { cx: 138, cy: 60 },
      ].map((n, i) => (
        <motion.circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r="11"
          fill="none"
          stroke={INK}
          strokeWidth="1.5"
          strokeOpacity="0.7"
          animate={{ r: [11, 13, 11] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
      <motion.line
        x1="73"
        y1="60"
        x2="127"
        y2="60"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ strokeOpacity: [0.25, 0.9, 0.25] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </ArtFrame>
  );
}

/** Development — flowing braided paths, like structured logic building up. */
function DevelopmentArt() {
  const rows = [42, 60, 78];
  return (
    <ArtFrame id="art-dev">
      {rows.map((y, i) => (
        <motion.path
          key={i}
          d={`M -20 ${y} C 50 ${y - 22}, 90 ${y + 22}, 220 ${y}`}
          fill="none"
          stroke={INK}
          strokeWidth="1.5"
          strokeOpacity={0.5 - i * 0.1}
          strokeDasharray="6 10"
          animate={{ strokeDashoffset: [0, -32] }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      <motion.g
        animate={{ x: [-6, 6, -6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M70 48 L58 60 L70 72"
          fill="none"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.8"
        />
        <path
          d="M130 48 L142 60 L130 72"
          fill="none"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.8"
        />
      </motion.g>
    </ArtFrame>
  );
}

/** Research — particle field drifting around expanding probe rings. */
function ResearchArt() {
  const rings = [0, 1, 2];
  const dots = Array.from({ length: 14 });
  return (
    <ArtFrame id="art-research">
      <rect width="200" height="120" fill="url(#art-research-glow)" />
      {dots.map((_, i) => {
        const x = 18 + ((i * 53) % 170);
        const y = 16 + ((i * 37) % 90);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="1.6"
            fill={INK}
            animate={{ opacity: [0.15, 0.7, 0.15], cy: [y, y - 6, y] }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: (i % 5) * 0.4,
              ease: "easeInOut",
            }}
          />
        );
      })}
      {rings.map((r) => (
        <motion.circle
          key={r}
          cx="100"
          cy="60"
          fill="none"
          stroke={INK}
          strokeWidth="1.25"
          initial={{ r: 6, opacity: 0.7 }}
          animate={{ r: 46, opacity: 0 }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            delay: r * 1.2,
            ease: "easeOut",
          }}
        />
      ))}
      <circle cx="100" cy="60" r="3" fill={INK} />
    </ArtFrame>
  );
}

/** Growth — rising area curve that draws in, with a climbing trace. */
function GrowthArt() {
  return (
    <ArtFrame id="art-growth">
      <motion.path
        d="M0 110 C 40 96, 70 82, 100 60 C 130 38, 160 26, 200 12 L200 120 L0 120 Z"
        fill="url(#art-growth-fill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: easeOutExpo }}
      />
      <motion.path
        d="M0 110 C 40 96, 70 82, 100 60 C 130 38, 160 26, 200 12"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.85"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: easeOutExpo }}
      />
      <motion.circle
        r="3.5"
        fill={INK}
        initial={{ cx: 0, cy: 110, opacity: 0 }}
        whileInView={{ cx: 200, cy: 12, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: easeOutExpo }}
      />
    </ArtFrame>
  );
}

/** IT — connected lattice mesh with a signal pulse hopping across nodes. */
function ITArt() {
  const cols = 5;
  const rows = 3;
  const nodes = Array.from({ length: cols * rows }, (_, i) => ({
    x: 24 + (i % cols) * 38,
    y: 28 + Math.floor(i / cols) * 32,
  }));
  return (
    <ArtFrame id="art-it">
      {nodes.map((n, i) => {
        const right = (i % cols) + 1 < cols ? nodes[i + 1] : null;
        const down = i + cols < nodes.length ? nodes[i + cols] : null;
        return (
          <g key={i}>
            {right && (
              <line
                x1={n.x}
                y1={n.y}
                x2={right.x}
                y2={right.y}
                stroke={INK}
                strokeOpacity="0.14"
                strokeWidth="0.75"
              />
            )}
            {down && (
              <line
                x1={n.x}
                y1={n.y}
                x2={down.x}
                y2={down.y}
                stroke={INK}
                strokeOpacity="0.14"
                strokeWidth="0.75"
              />
            )}
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r="2.4"
          fill={INK}
          animate={{ opacity: [0.2, 0.9, 0.2], r: [2.4, 3.4, 2.4] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: (i % 7) * 0.28,
            ease: "easeInOut",
          }}
        />
      ))}
    </ArtFrame>
  );
}

export type TeamBentoItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  art: React.ComponentType;
  /** Tailwind col/row span classes for the bento layout. */
  className: string;
};

export const TEAM_ART: Record<
  string,
  { icon: LucideIcon; art: React.ComponentType; className: string }
> = {
  Business: {
    icon: Handshake,
    art: HandshakeArt,
    className: "sm:col-span-2 sm:row-span-2",
  },
  Development: {
    icon: Code2,
    art: DevelopmentArt,
    className: "sm:col-span-2",
  },
  Research: {
    icon: FlaskConical,
    art: ResearchArt,
    className: "sm:col-span-2 sm:row-span-2",
  },
  Growth: {
    icon: TrendingUp,
    art: GrowthArt,
    className: "sm:col-span-2",
  },
  IT: {
    icon: Server,
    art: ITArt,
    className: "sm:col-span-4",
  },
};

export function TeamBentoGrid({ items }: { items: TeamBentoItem[] }) {
  return (
    <div className="grid auto-rows-[150px] grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-4">
      {items.map((item, index) => {
        const { icon: Icon, art: Art } = item;
        return (
          <motion.div
            key={item.title}
            className={cn(
              "group relative flex flex-col rounded-xl border bg-background p-4 transition-colors hover:border-[#1954A6]/40",
              item.className,
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: easeOutExpo }}
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              <Art />
            </div>
            <div className="mt-3 shrink-0">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon className="size-4 text-[#1954A6]" />
                {item.title}
              </h4>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
