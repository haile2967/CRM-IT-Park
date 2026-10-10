# Frontend Folder Structure

This document outlines the architectural structure, design conventions, and organization of the **CRM_frontend** React application.

---

## Directory Overview

```text
CRM_frontend/
├── public/                 # Static public assets served directly
├── src/
│   ├── assets/             # Bundled static media (images, icons, SVGs)
│   ├── components/         # Shared UI and layout presentation components
│   │   ├── ui/             # Primitive, headless/atomic UI elements (Buttons, Inputs, Modals)
│   │   ├── layout/         # Structural components (Sidebar, Navbar, Footer, AppShell)
│   │   └── common/         # Composite components shared across domains
│   ├── features/           # Domain/business-driven vertical modules
│   ├── hooks/              # Reusable custom React hooks
│   ├── services/           # Axios HTTP client, API interceptors, and endpoints
│   ├── store/              # Global application state management
│   ├── types/              # TypeScript declarations, interfaces, and DTOs
│   ├── utils/              # Pure utility functions and formatters
│   ├── routes/             # Route configurations, guards, and navigation layouts
│   ├── styles/             # Global styles and Tailwind CSS configurations
│   ├── App.tsx             # Root application component
│   └── main.tsx            # React application entry point (DOM mount)
├── Dockerfile              # Docker container build & development setup
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript compilation configuration
└── vite.config.ts          # Vite configuration and backend API proxying
```

---

## Clear Explanation of Each Folder

### `src/assets/`
Contains bundled static assets such as logos, company branding images, custom SVGs, and fonts imported directly into TypeScript/React code.

### `src/components/ui/`
Contains basic, reusable, atomic UI building blocks.  
- Examples: `Button.tsx`, `Input.tsx`, `Select.tsx`, `Modal.tsx`, `Table.tsx`, `Badge.tsx`, `Dropdown.tsx`.  
- These components should be domain-agnostic and styled using Tailwind CSS classes.

### `src/components/layout/`
Contains structural layout components that form the framework of the application.  
- Examples: `Sidebar.tsx`, `Header.tsx`, `Navbar.tsx`, `Footer.tsx`, `DashboardLayout.tsx`, `AuthLayout.tsx`.

### `src/components/common/`
Shared composite components used across multiple features that are more specialized than atomic UI elements.  
- Examples: `ConfirmDialog.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`, `Pagination.tsx`, `SearchBar.tsx`.

### `src/features/`
Organized by business domain / CRM feature (vertical slice architecture). Each feature folder encapsulates its own components, hooks, api calls, and types.  
- Planned folders:
  - `features/auth/` (Login, Logout, Password Reset)
  - `features/dashboard/` (Analytics, Metrics, Recent Activities)
  - `features/leads/` (Lead list, Lead details, Status update, Lead conversion)
  - `features/customers/` (Accounts, Contacts, Customer profile)
  - `features/tickets/` (Support tickets, Escalations, SLA tracker)
  - `features/tasks/` (Reminders, Activity log, Follow-ups)

### `src/hooks/`
Contains reusable custom React hooks used across multiple features.  
- Examples: `useAuth.ts`, `useDebounce.ts`, `useLocalStorage.ts`, `useMediaQuery.ts`, `usePagination.ts`.

### `src/services/`
Handles HTTP communication with the Laravel `CRM_backend`.  
- Contains the configured Axios client instance (`api.ts`), request/response interceptors (attaching Bearer auth tokens, handling 401 unauthenticated errors, handling validation errors).

### `src/store/`
Contains global client-side state management (such as Zustand, Context API, or Redux).  
- Handles state that needs to persist or be accessed across different modules, such as current authenticated user, theme preferences, and global notifications/toasts.

### `src/types/`
Contains global TypeScript definitions, interfaces, and enums.  
- Defines data contracts matching backend models (e.g., `User`, `Lead`, `Customer`, `Ticket`, `ApiResponse<T>`, `PaginatedResponse<T>`).

### `src/utils/`
Contains pure helper utility functions that have no React-specific dependencies.  
- Examples: `formatDate.ts`, `formatCurrency.ts`, `cn.ts` (Tailwind class merging helper), `validators.ts`, `storage.ts`.

### `src/routes/`
Contains application routing configuration and route guards.  
- Uses `react-router-dom` to configure routes.  
- Includes route protection logic (e.g., `ProtectedRoute.tsx` for authenticated users, `RoleRoute.tsx` for role-based access control like CRM Manager, BDO, Support Agent).

### `src/styles/`
Contains global stylesheets and Tailwind CSS directives.  
- Includes `index.css` configured with `@import "tailwindcss";` and custom design tokens or CSS variables.

---

## Quick Reference Summary Table

| Folder | Purpose |
|--------|---------|
| `assets/` | Static files (images, icons, fonts) |
| `components/ui/` | Basic reusable UI elements (Button, Input, Modal, Table...) |
| `components/layout/` | Layout components (Sidebar, Header, Footer...) |
| `components/common/` | Shared components used across multiple features |
| `features/` | Feature-based modules (Auth, Leads, Customers, Tickets, Dashboard) |
| `hooks/` | Custom React hooks |
| `services/` | API calls and Axios client to the Laravel backend |
| `store/` | Global state management |
| `types/` | TypeScript interfaces and types |
| `utils/` | Helper / utility functions (date formatters, validators, class mergers) |
| `routes/` | Application routing configuration and protected route guards |
| `styles/` | Global styles and Tailwind related files |

---

## Configuration & Root Files

| File | Explanation |
|------|-------------|
| `vite.config.ts` | Configures the Vite development server, Tailwind plugin, and reverse-proxy `/api` to the backend. |
| `tsconfig.json` | TypeScript configuration and compiler options. |
| `package.json` | Project dependencies (React 19, Axios, Lucide React, React Router 7, Tailwind CSS v4) and scripts. |
| `Dockerfile` | Containerization recipe running Vite dev server on port `5173`. |
| `.env` | Frontend environment variables (such as `VITE_API_BASE_URL`). |
| `App.tsx` | Root component hosting routing and providers. |
| `main.tsx` | Application mounting script rendering into `index.html`. |
