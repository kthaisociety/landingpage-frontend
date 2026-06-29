# Table Formatting Reference

Complete formatting rules and examples for data table content.

## Number Formatting

### Integers

| Raw Value | Formatted | Context |
|-----------|-----------|---------|
| 1234567 | 1,234,567 | Full precision (detail views, exports) |
| 1234567 | 1.2M | Abbreviated (dashboards, summaries) |
| 0 | 0 | Never blank — zero is meaningful |
| -500 | -500 | Use minus sign, not parentheses (unless financial context) |

### Decimals

| Rule | Example |
|------|---------|
| Fixed decimals per column | If one value is `4.50`, all show `X.XX` |
| No trailing zeros in mixed columns | Only when the column has varying precision needs |
| Align on decimal point | Right-align achieves this automatically |

### Large Numbers in Dashboards

| Range | Abbreviation | Example |
|-------|-------------|---------|
| < 1,000 | None | 847 |
| 1,000 – 999,999 | K | 12.3K |
| 1,000,000 – 999,999,999 | M | 4.7M |
| 1,000,000,000+ | B | 1.2B |

- Show one decimal for abbreviated values
- Show full value on hover/tooltip
- Be consistent: if one cell says "12.3K", don't show "4,700,000" in another

## Currency Formatting

| Currency | Format | Example |
|----------|--------|---------|
| USD | $X,XXX.XX | $1,234.56 |
| EUR | €X.XXX,XX | €1.234,56 |
| GBP | £X,XXX.XX | £1,234.56 |
| ARS | ARS X.XXX,XX | ARS 1.234,56 |

Rules:
- Symbol precedes the number with no space (most Western currencies)
- Always two decimal places for currencies that use cents/centavos
- Right-align — the symbols will be ragged but the numbers will align on the decimal
- For mixed-currency tables, use ISO codes (`USD`, `EUR`) instead of symbols to avoid ambiguity
- Negative values: `-$500.00` (minus before symbol)

## Date and Time Formatting

### Date Formats by Context

| Context | Format | Example |
|---------|--------|---------|
| Reports and records | MMM DD, YYYY | Mar 15, 2025 |
| Compact tables | MM/DD/YY or DD/MM/YY | 03/15/25 |
| ISO (for sorting/export) | YYYY-MM-DD | 2025-03-15 |
| Relative (active workflows) | Time ago | 3 hours ago |

### Relative Date Thresholds

| Time Elapsed | Display |
|-------------|---------|
| < 1 minute | Just now |
| 1–59 minutes | Xm ago |
| 1–23 hours | Xh ago |
| 1–6 days | Xd ago |
| 7+ days | Absolute date |

### Date + Time

- Only show time if it adds value for the user's task
- Use 12-hour format for user-facing: `Mar 15, 2025 2:30 PM`
- Use 24-hour format for technical/log contexts: `2025-03-15 14:30:00`
- Always show timezone if users span zones: `2:30 PM EST`

## Status Formatting

### Color Mapping

| Status Category | Color | Hex (on dark bg) | Hex (on light bg) |
|----------------|-------|-------------------|-------------------|
| Success / Active / Complete | Green | #4ADE80 | #16A34A |
| Warning / Pending / At Risk | Amber | #FBBF24 | #D97706 |
| Error / Critical / Blocked | Red | #F87171 | #DC2626 |
| Info / In Progress | Blue | #60A5FA | #2563EB |
| Inactive / Draft / Archived | Gray | #9CA3AF | #6B7280 |

### Badge/Pill Implementation

```
[● Active]   [● Pending]   [● Error]   [● Draft]
  green         amber         red         gray
```

- Dot indicator + text label
- Background tint of the status color at 10–15% opacity
- Text in the status color (dark mode) or a darker shade (light mode)
- Minimum touch target: 24px height for interactive status pills

### Status Text Rules

- Use consistent vocabulary across the app. Pick one: "Active" not sometimes "Active" and sometimes "Enabled"
- Capitalize the first letter: "In Progress", not "in progress" or "IN PROGRESS"
- Keep short: max 2 words for badge text

## Boolean and Indicator Formatting

| Type | Display | Alignment |
|------|---------|-----------|
| Yes/No | Checkmark icon (✓) / em-dash (—) | Center |
| True/False | Toggle or checkbox (interactive) | Center |
| Enabled/Disabled | Status badge (see above) | Center or Left |
| Present/Absent | Icon or dot indicator | Center |

- Never display raw `true`/`false` — translate to meaningful labels or icons
- For non-interactive display, use ✓ for true and — for false (not ✗, which implies error)

## Empty and Null Values

| Scenario | Display | Note |
|----------|---------|------|
| No value exists | — (em-dash) | Means "not applicable" or "no data" |
| Value is zero | 0 | Zero is data — display it |
| Value is loading | Skeleton/shimmer | Show loading state, not blank |
| Value errored | Error icon + tooltip | Indicate the failure |
| Empty string | — (em-dash) | Treat empty strings same as null |

**Never use:**
- "N/A" (ambiguous — does it mean not applicable or not available?)
- "null" or "undefined" (technical jargon)
- Empty cell with no indicator (looks like a rendering bug)

## Text Truncation

| Rule | Details |
|------|---------|
| Truncate with ellipsis | `text-overflow: ellipsis` + `overflow: hidden` |
| Minimum visible width | At least 120px or 12 characters before truncating |
| Show full text on hover | Tooltip with the complete value |
| Multi-line cells | Allow 2 lines max, then truncate. Set `line-clamp: 2`. |
| Never truncate numbers | Numbers must always show in full. Abbreviate instead (K, M, B). |
| Never truncate status | Status labels must always be fully visible. |

## Spacing and Density

### Cell Padding

| Density | Vertical | Horizontal |
|---------|----------|------------|
| Compact | 4–6px | 8–12px |
| Default | 8–12px | 12–16px |
| Comfortable | 12–16px | 16–20px |

### Column Width Heuristics

| Content Type | Suggested Min Width |
|-------------|-------------------|
| Checkbox | 40–48px |
| Short ID | 80–100px |
| Name/Title | 150–250px |
| Status badge | 100–120px |
| Date | 100–140px |
| Number (small) | 60–80px |
| Currency | 100–120px |
| Actions (1–2 buttons) | 80–120px |
| Actions (3+ buttons) | Use overflow menu |

### Header Styling

- Headers are visually distinct: bolder weight, subtle background, or bottom border
- Sticky headers for scrollable tables (> 10 visible rows)
- Sort indicator: arrow icon aligned with header text
- Active sort column: slightly bolder or highlighted header
