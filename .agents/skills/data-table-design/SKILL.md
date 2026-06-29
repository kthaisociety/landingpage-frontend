---
name: data-table-design
description: >-
  Design clear, scannable data tables that follow established UX conventions
  for alignment, formatting, and readability. Use this skill when building
  data tables, grids, list views, dashboards, reports, or any tabular display.
  Also triggers for: "design this table", "how should I display this data",
  "table layout", "column alignment", "grid design", "data grid", "table UX",
  "report table", "spreadsheet layout", "make this table easier to read", or
  "numeric column formatting". Covers column ordering, alignment rules, number
  formatting, status indicators, row density, sorting, and responsive behavior.
  Do NOT use for database schema design, API response design (use api-design),
  or chart/visualization design.
license: Apache-2.0
metadata:
  author: baufest
  version: "1.0"
---

# Data Table Design

## Overview

Design data tables that users can scan, compare, and act on quickly. Tables are the most information-dense UI component — small design decisions (column order, alignment, number formatting) compound into large differences in usability. This skill applies established conventions so every table your team builds is consistent and readable.

## When to Use

- Designing a new data table or grid component
- Reviewing an existing table for usability issues
- Building dashboards, reports, or admin interfaces with tabular data
- Choosing column order, alignment, or formatting
- Making tables responsive for smaller screens
- Formatting numbers, dates, currencies, or status values in tables

## Instructions

### Step 1: Understand the Data and Context

Gather from the user (skip what's already provided):

1. **What data is being displayed?** — What are the columns? What are the data types?
2. **Who is the audience?** — Power users scanning fast, or casual users exploring?
3. **Primary task?** — Comparing values, finding a specific row, taking action, or exporting?
4. **How many rows?** — Dozens (show all), hundreds (paginate), thousands (virtual scroll)?
5. **Where does it live?** — Full-page table, dashboard widget, modal, or embedded in content?

### Step 2: Order the Columns

Column order determines what the eye hits first. Follow this priority:

1. **Identifier first.** The column that tells the user "what row am I looking at" goes leftmost. Usually a name, title, or ID.
2. **Most-compared dimension next.** The column users compare most across rows sits to the right of the identifier. Often status, date, or a key metric.
3. **Numeric and quantitative columns on the right.** Numbers are right-aligned and read best when grouped together on the right side of the table. This matches how spreadsheets and financial reports work — the eye scans left for context, right for values.
4. **Actions rightmost.** Edit, delete, view, or other row-level actions go in the last column. Users expect actions at the end of a row.
5. **Metadata and secondary info in the middle.** Columns that provide context but aren't the primary comparison (category, assignee, tags) fill the middle.

**Example column order for an orders table:**

```
| Order # | Customer | Status | Date | Items | Total | Actions |
|---------|----------|--------|------|-------|-------|---------|
  ↑ ID      ↑ Context  ↑ Key    ↑ Mid   ↑ Num   ↑ Num   ↑ Acts
```

### Step 3: Apply Alignment Rules

Alignment is the single most impactful table design decision. Wrong alignment makes numbers unreadable and text jagged.

| Data Type | Alignment | Reason |
|-----------|-----------|--------|
| Text (names, descriptions) | Left | Natural reading direction; ragged right is expected |
| Numbers (counts, amounts, IDs) | Right | Aligns decimal points and digit places for comparison |
| Currency | Right | Must align decimal points; use consistent decimal places |
| Percentages | Right | Numeric — align for comparison |
| Dates | Left or Right | Left if displayed as text ("Mar 15, 2025"); Right if displayed as numbers ("2025-03-15") |
| Status / Tags | Left or Center | Center if using badges/pills; Left if plain text |
| Boolean (yes/no, checkboxes) | Center | Symmetrical content looks best centered |
| Actions (buttons, icons) | Center or Right | Center for icon buttons; Right for text actions |

**Critical rule: Numbers are always right-aligned.** This is non-negotiable. Right-aligned numbers let users compare magnitudes by scanning the leading digits. Left-aligned numbers force the eye to count digits to compare 1,234 vs 12,345.

**Column headers match their data alignment.** If the data is right-aligned, the header is right-aligned. This maintains the visual column axis.

### Step 4: Format Data Consistently

See [references/table-formatting.md](references/table-formatting.md) for the full formatting reference. Key rules:

**Numbers:**
- Use locale-appropriate thousands separators: `1,234,567` (not `1234567`)
- Fixed decimal places within a column: if one value is `4.50`, all values show two decimals
- Right-align, monospace or tabular numerals if the font supports them
- Abbreviate large numbers in dashboards: `1.2M`, `$34K` — but show full precision on hover or in detail views

**Currency:**
- Symbol before the number, no space: `$1,234.56`
- Always show two decimal places for currencies that use them
- Right-align the full string including the symbol

**Percentages:**
- Number followed by `%`, no space: `42.5%`
- Consistent decimal places within a column
- Consider a visual bar or spark indicator alongside the number for quick scanning

**Dates:**
- Choose one format per table and stick to it
- Relative dates (`3 hours ago`) for recent items in active workflows
- Absolute dates (`Mar 15, 2025`) for records and reports
- Include time only if it matters for the user's task
- Use `<time>` element with ISO datetime for accessibility

**Status:**
- Use color-coded badges/pills: Green for success/active, Amber for warning/pending, Red for error/critical, Gray for inactive/draft
- Always include a text label alongside color — never rely on color alone (accessibility)
- Use consistent status vocabulary across the application

**Null / Empty values:**
- Use an em-dash `—` or `–` for missing values, not "N/A", empty string, or "null"
- Distinguish between "no value" and "zero" — `—` vs `0`

### Step 5: Design Row Behavior

**Density.** Choose based on data type and audience:

| Density | Row Height | When to Use |
|---------|-----------|-------------|
| Compact | 32–36px | Data-heavy tables, power users, financial data |
| Default | 40–48px | Most tables, mixed audiences |
| Comfortable | 52–64px | Tables with avatars, multi-line content, or touch targets |

**Hover state.** Subtle background highlight on hover (`background: rgba(0,0,0,0.04)` on light, `rgba(255,255,255,0.06)` on dark). Helps track across wide rows.

**Striped rows.** Use alternating row backgrounds only for wide tables (6+ columns) where tracking across is difficult. For narrow tables, striped rows add visual noise.

**Selection.** If rows are selectable, add a checkbox column as the very first column (before the identifier). Use indeterminate state for "some selected" in the header checkbox.

**Sorting.** Indicate the current sort column and direction with an arrow icon in the header. Default sort should match the user's most common task. Allow multi-column sort for power users, but don't require it.

### Step 6: Handle Responsive Behavior

Tables on small screens require deliberate choices:

1. **Priority columns.** Define which columns are essential (always visible) vs which can be hidden at breakpoints. The identifier and primary metric should always be visible.
2. **Horizontal scroll.** For data-dense tables, horizontal scroll with a sticky first column (the identifier) is often the best option. Better than cramming or truncating.
3. **Card layout.** Below a threshold (usually < 600px), consider transforming each row into a card with label-value pairs stacked vertically.
4. **Column toggle.** Let users show/hide columns. Remember their preference.

### Step 7: Review Checklist

Before finalizing, verify:

- [ ] Identifier column is leftmost
- [ ] All numeric columns are right-aligned
- [ ] Column headers match their data alignment
- [ ] Numbers use consistent decimal places and thousands separators
- [ ] Currency values show symbol and consistent decimals
- [ ] Status uses color AND text labels
- [ ] Null values use em-dash, not blank or "N/A"
- [ ] Actions column is rightmost
- [ ] Row density matches the use case
- [ ] Hover state aids row tracking
- [ ] Sort is indicated visually and defaults to the most useful order
- [ ] Responsive strategy is defined for small screens
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI elements)

## Output Format

Deliver one or more of:
- A table design specification (columns, types, alignment, formatting, sort defaults)
- Markup/code for the table implementation (HTML, React, etc.)
- A review of an existing table with specific findings and fixes

## References

- See [table-formatting.md](references/table-formatting.md) for the complete formatting reference with examples
