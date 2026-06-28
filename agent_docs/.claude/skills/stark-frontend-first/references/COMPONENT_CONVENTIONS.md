# Component Conventions

## Stack

- shadcn/ui (base: zinc) — composable primitives
- Tailwind CSS — utility-first styling
- Zustand — client state (when needed)
- react-hook-form + Zod — forms + validation

## File Organization

```
src/components/
├── ui/                  ← shadcn primitives (auto-generated, do not edit)
├── auth/                ← auth-specific components (LoginForm, RegisterForm)
├── layout/              ← Header, Footer, Sidebar
└── shared/              ← Generic re-usable components
```

## Server vs Client Components

Default to Server Components. Add `'use client'` only when needed:
- Event handlers (onClick, onChange)
- Browser-only APIs
- React hooks (useState, useEffect)
- Form interactivity

Phase 1 placeholder pages are mostly Server Components.

## Brand Token Usage

Use Tailwind classes referencing CSS variables:

```tsx
// CORRECT
<Button className="bg-brand-primary text-brand-primary-foreground">

// WRONG — hard-coded color
<Button style={{ backgroundColor: '#FF6F00' }}>
```

Brand tokens defined in `tailwind.config.ts` extend block, sourced from CSS vars in `globals.css`.

## Form Pattern

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  // ...
}
```

## Loading / Empty / Error States

Every data-dependent screen needs three states. Phase 1 placeholder pages have minimal needs, but the pattern is established:

```tsx
if (isLoading) return <Spinner />;
if (isError) return <ErrorState message={error.message} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataView data={data} />;
```

## Accessibility Baseline

- All form fields have labels
- All buttons have accessible names (text or aria-label)
- Color contrast meets WCAG AA
- Keyboard navigation works on every interactive element
- Focus visible on all focusable elements
