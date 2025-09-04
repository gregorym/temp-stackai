# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a T3 Stack (Next.js) project using pnpm as the package manager. Key commands:

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build production version  
- `pnpm start` - Start production server
- `pnpm preview` - Build and start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm typecheck` - Run TypeScript compiler without emitting files
- `pnpm check` - Run both linting and type checking
- `pnpm format:check` - Check code formatting with Prettier
- `pnpm format:write` - Format code with Prettier

Always run `pnpm check` after making changes to ensure code quality.

## Architecture Overview

### Stack Components
- **Next.js 15** - React framework with App Router
- **TypeScript** - Strict type checking enabled with `noUncheckedIndexedAccess`
- **tRPC** - End-to-end type-safe APIs between client and server
- **TanStack Query** - Data fetching and caching (integrated with tRPC)
- **Tailwind CSS** - Utility-first CSS with Tailwind CSS v4
- **Radix UI** - Unstyled, accessible UI components 
- **shadcn/ui** - Pre-styled components built on Radix UI
- **Zod** - Runtime type validation

### Directory Structure
```
src/
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── lib/                # Shared utilities (cn() helper)
├── server/             # Server-side code
│   └── api/           # tRPC router definitions
├── trpc/              # tRPC client/server setup
└── styles/            # Global CSS
```

### Key Patterns

**Environment Variables**: Use `src/env.js` with `@t3-oss/env-nextjs` for type-safe env var validation. Server vars go in `server` object, client vars (prefixed with `NEXT_PUBLIC_`) go in `client` object.

**tRPC Setup**: 
- Server routers in `src/server/api/routers/`
- Main router in `src/server/api/root.ts` 
- Client usage via `src/trpc/react.tsx` hook
- Server-side calls via `src/trpc/server.ts`

**Styling**: Uses Tailwind CSS v4 with `cn()` utility from `src/lib/utils.ts` for conditional classes. Components follow shadcn/ui patterns with Radix UI primitives.

**Path Aliases**: Uses `~/` alias mapped to `src/` directory (configured in tsconfig.json).

### Code Quality
- ESLint with TypeScript-specific rules and Next.js config
- Prettier with Tailwind CSS plugin for class sorting
- Strict TypeScript configuration with comprehensive type checking
- Type-safe imports preferred with inline style: `import { type Foo } from "..."`

When adding new features, follow T3 Stack patterns: create tRPC procedures for data operations, use TypeScript throughout, and leverage the existing component architecture with shadcn/ui styling.