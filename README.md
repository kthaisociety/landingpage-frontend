# kthaisociety/frontend

Next-generation frontend for KTH AI Society website.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Code Structure & Best Practices

### Folder Structure

- `src/app/`: Contains Next.js App Router pages and layouts
  - Only page components (`page.tsx`) and layout components (`layout.tsx`) should be here
  - No reusable components should be placed in this directory
- `src/components/`: Contains all reusable React components
  - `ui/`: UI components (buttons, forms, etc.) - mostly from shadcn/ui
  - `dashboard/`, `home/`, etc.: Feature-specific components
  - Each primary component should be in its own folder with an `index.tsx` for exporting and sub-components can have file names
- `src/hooks/`: Custom React hooks
- `src/lib/`: Utility functions and configuration
- `src/types/`: TypeScript type definitions

e.g. of how to structure components:

```tsx
// src/components/home/index.tsx
export function Homepage() {
  return <div>Home</div>;
}
```

```tsx
// src/app/page.tsx
import { Homepage } from "@/components/home";

export default Homepage;
```

### ESLint & TypeScript Best Practices

- Use named exports instead of default exports for components (except for page/layout components)
- Use TypeScript for type safety - avoid using `any` type
- Use consistent type imports with `import type { ... } from '...'`
- Use React function components with explicit return types
- Use path aliases (`@/components/...`) for imports
- UI components from shadcn have special ESLint exceptions to accommodate their patterns
- We use Prettier for code formatting to ensure consistent style across the codebase

See [eslint.config.mjs](eslint.config.mjs) for more details.

### Component Guidelines

- Create client components with the `"use client"` directive when they use hooks or browser APIs
- Keep components small and focused on a single responsibility
- Use TypeScript interfaces to define component props
- Use custom hooks to extract complex logic from components
- For data fetching components, separate the data fetching logic from the presentation

## Git Workflow

This project adheres to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. This is to ensure that the project is easily maintainable and that the commit history is clean and easy to understand.

### Complete Workflow: From Issue to Merged PR

1. **Issue Assignment**

   - Assign yourself to an issue from our [project board](https://github.com/orgs/kthaisociety/projects/2)
   - Team members can self-assign issues or may be tasked with specific issues during workshops/meetings

2. **Project Management**

   - Ensure the issue is added to our [project view](https://github.com/orgs/kthaisociety/projects/2)
   - Update the issue status to "In Progress" when you start working on it

3. **Branch Creation & Development**

   - Check out the project locally
   - Name your branch either `issue-X` (where X is the issue number) or use GitHub's "Create a branch" feature
   - Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages
   - Include `fixes #X` in your commit message if it fixes issue X
   - Example commit message:

     ```text
     ci: add deployment notification to Mattermost

     * notify on mattermost upon deployment

     fixes #17
     ```

4. **Pull Request Creation**

   - Create a pull request when your work is ready for review
   - Use "Draft Pull Request" if you want early feedback but the work is not yet complete

5. **Code Review Process**

   - Request reviews in the team Mattermost channel
   - Primary reviewer is typically the Head of IT
   - The review process may involve multiple rounds of feedback and changes
   - It is generally the responsibility of the PR creator to merge once approved
   - Coordinate with Head of IT before merging if it triggers a production deployment
   - All merges should be squashed

6. **Showcase**
   - Present your completed work during the next team meeting

## Notice about license

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.

This does **not** apply to logos, icons, and images used in this project. They are the property of KTH AI Society and are not licensed for public, commercial, or personal use. If you wish to use them, please contact us at [contact@kthais.com](mailto:contact@kthais.com).
 