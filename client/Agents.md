# ProfilizePro - Agent Guidelines & Standards

## Overview

**ProfilizePro** is a Next.js-based online testing and assessment platform with admin dashboards, real-time test attempts, and role-based access control. This document defines the standards, conventions, and architectural patterns used across the project.

---

## ⚠️ CRITICAL RULE: Maintain agents.md as Single Source of Truth

**When any code changes or new patterns are introduced that differ from this document, this agents.md file MUST be updated immediately to reflect the new behavior.** 

This ensures consistency across the codebase and serves as a reliable reference for future development. Non-compliance will break the contract between agents and developers.

---

## Tech Stack

- **Framework:** Next.js 14.2.3 with App Router
- **Language:** TypeScript with path aliases (tsconfig.json)
- **Styling:** Tailwind CSS 3.3.0 with custom color extensions
- **UI Components:** NextUI, Flowbite  Lucide  React Icons
- **State Management:** React Context API (ThemeContext, TestContext, UserContext)
- **Backend Integration:** Fetch API and Axios
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Email:** Nodemailer
- **Forms/Input:** React OTP Input
- **Charts:** Chart.js & React ChartJS2
- **Animations:** Lottie (react-lottie, JSON animations)
- **Code Quality:** Prettier, Husky, lint-staged, ESLint
- **Type Safety:** TypeScript 6.0.3 with strict mode enabled

---

## Project Structure

```
d:\Portfolio\ProfilizerPro\client\
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication routes (login, register, etc.)
│   ├── api/v1/                   # API route handlers
│   ├── admin/                    # Admin dashboard page
│   ├── dashboard/                # User dashboard page
│   ├── explore/                  # Explore tests page
│   ├── test/                     # Test viewing and attempt pages
│   └── [other pages]
├── Components/                   # React components (organized by feature)
│   ├── Navbar/
│   ├── Dashboard/
│   ├── Admin/
│   ├── Landing/
│   ├── ViewTest/
│   ├── Login/
│   ├── Signup/
│   └── [other components]
├── Utils/                        # Utilities and context
│   ├── ThemeContext.ts           # Dark/light mode context
│   ├── UserContext.ts            # User state management
│   ├── TestContext.ts            # Test state management
│   ├── constants.ts              # Application constants
│   ├── Toast.ts                  # Toast notification utility
│   ├── api/                      # Backend integration files
│   │   ├── Controllers/          # API logic/business logic
│   │   ├── Models/               # Database schemas
│   │   └── Apicalls/             # API endpoint wrappers
│   └── types/                    # Shared TypeScript types and interfaces
├── public/                       # Static assets, images, animations
├── package.json
├── tailwind.config.js
├── next.config.mjs
├── jsconfig.json
└── middleware.js
```

---

## File Organization & Naming Conventions

### Components

- **Location:** `/Components/{FeatureName}/`
- **Naming:** PascalCase for component files (e.g., `Dashboard.tsx`, `Navbar.tsx`)
- **File Extension:** `.tsx` for React components using TypeScript
- **Structure:** Each component typically has:
  - Component file (e.g., `Dashboard.tsx`)
  - Optional sub-components in subdirectories
  - Optional CSS files for component-specific styling (e.g., `Footer.css`)
- **Exports:** Use `export default` for main component

**Example:**
```
Components/
├── Navbar/
│   └── Navbar.tsx
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── DashBoardView.tsx
│   ├── TestsAttempted.tsx
│   └── TestAttemptedModal/
│       ├── Modal.tsx
│       └── QuestionCard.tsx
```

### Utilities & API Calls

- **Location:** `/Utils/`
- **Naming:** camelCase for files (e.g., `ThemeContext.ts`, `constants.ts`)
- **File Extension:** `.ts` for TypeScript files
- **API Calls:** `/Utils/Apicalls/{FeatureName}.ts` (e.g., `Login.ts`, `User.ts`)
- **Controllers:** `/Utils/api/Controllers/{FeatureController}.ts`
- **Types:** `/Utils/types/` for shared TypeScript interfaces and types

### Pages

- **Location:** `/app/`
- **Naming:** Use kebab-case with directory structure matching routes
- **Special Patterns:**
  - Auth pages use `(auth)` route group: `app/(auth)/login/`, `app/(auth)/register/`
  - Dynamic routes use `[...id]` for catch-all parameters
  - API routes use `/api/v1/{feature}/` pattern

---

## Code Conventions

### Component Structure (Client Components)

All components must include the `"use client"` directive at the top:

```javascript
"use client";
import  { useState, useLayoutEffect } from "react";
// ... other imports
```

### Imports Organization

1. React imports
2. Third-party library imports
3. Custom utilities/contexts
4. Next.js imports
5. Custom components (if any)

```typescript
import  { useState, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../Utils/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { getUser } from "@/Utils/Apicalls/User";
```

### Use Path Aliases

Always use `@/` alias for imports from root:
- ✅ `import { getUser } from "@/Utils/Apicalls/User";`
- ❌ `import { getUser } from "../../../Utils/Apicalls/User";`

### State Management

- **Theme:** Use `useTheme()` hook from `ThemeContext`
- **User Data:** Use `UserContext` or `getUser()` API call
- **Test Data:** Use `TestContext` for test-related state
- **Local State:** Use `useState()` for component-specific state

Example:
```typescript
const { darkMode, toggleDarkMode } = useTheme();
const [isLogin, setIsLogin] = useState<boolean>(false);
```

### Effects & Lifecycle

- **Data Fetching:** Use `useLayoutEffect()` for pre-render data fetching
- **Logging:** Add console logs for debugging but remove before production
- **Dependencies:** Always include dependency arrays for effects

---

## TypeScript Standards

### Strict Mode Enabled

All TypeScript files must compile with strict mode. The `tsconfig.json` includes:
- `strict: true` - All strict type checking options enabled
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused function parameters
- `noFallthroughCasesInSwitch: true` - Error on switch fallthrough

### Type Annotations

**Always provide explicit type annotations for:**
- Function parameters and return types
- State variables (via generics: `useState<Type>()`)
- Context values and providers
- Component props interfaces

Example:
```typescript
import { FC, ReactNode } from "react";

interface ComponentProps {
  title: string;
  count: number;
  onClose: () => void;
}

const MyComponent: FC<ComponentProps> = ({ title, count, onClose }) => {
  return <div>{title}</div>;
};
```

### Component Type Definition

Use `FC` (FunctionComponent) from React for proper typing:

```typescript
"use client";
import  { FC, useState } from "react";

interface NavbarProps {
  items?: string[];
}

const Navbar: FC<NavbarProps> = ({ items = [] }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  return <nav>{/* content */}</nav>;
};

export default Navbar;
```

### Context Typing

Always define context interfaces and use them in providers:

```typescript
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
```

### API Call Typing

Define request and response interfaces for all API calls:

```typescript
interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (data: LoginData): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  return await fetch(`${LOGIN_API}`, requestOptions);
};
```

### Creating Type Definitions

Location: `/Utils/types/{FeatureName}.ts`

Example:
```typescript
// Utils/types/User.ts
export interface User {
  _id?: string;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  user: User;
}
```

---

## Styling Standards

### Tailwind CSS Usage

1. **Dark Mode:** Classes use `dark:` prefix for dark mode styles
   - Example: `dark:bg-[#121212]/98`, `dark:text-white`

2. **Color System:**
   - Primary color: `text-primary`, `bg-[var(--color-primary)]`
   - Use custom palette extensions from `tailwind.config.js`
   - Dark mode variants: `dark:bg-[#00000020]`, `dark:text-white`

3. **Transitions & Effects:**
   - Standard transition: `transition-all duration-300`
   - Hover states: `hover:text-[var(--color-secondary)]`
   - Animations: Use Tailwind's built-in animations or Lottie

4. **Layout Utilities:**
   - Flexbox: `flex`, `flex-col`, `gap-3`, `items-center`, `justify-center`
   - Responsive: `md:flex`, `md:w-[90%]`, `md:flex-row`
   - Spacing: `px-4`, `py-2`, `rounded-lg`

### Navbar Component Pattern (Reference)

The Navbar component demonstrates best practices:
- **Responsive Layout:** Mobile hamburger menu + desktop nav
- **Interactive Elements:** Smooth transitions and animations
- **Dark Mode:** Full support with `dark:` classes
- **Hover Effects:** Animated underlines on links
- **Toggle Button:** iOS-style dark mode switcher with sliding animation

### Interactive Elements

All interactive elements should have:
- Smooth transitions: `transition-all duration-300`
- Clear hover states
- Focus states for accessibility
- Aria labels where appropriate

Example:
```jsx
<button 
  onClick={toggleDarkMode}
  className="relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 bg-gray-300 dark:bg-gray-600"
  aria-label="Toggle dark mode"
>
  {/* content */}
</button>
```

---

## Component Patterns

### Link Styling

Use consistent link styles across components:

```javascript
const linkStyle = "text-primary transition-all duration-300 py-2 px-1 font-medium text-sm relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] after:transition-all after:duration-300 hover:after:w-full"
```

Features:
- Animated underline on hover
- Smooth color transitions
- Consistent typography (font-medium, text-sm)
- Dark mode support

### Button Styling

- **Primary CTA:** `bg-[var(--color-primary)] dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg`
- **Add Effects:** `shadow-md hover:shadow-lg`
- **Transitions:** `transition-all duration-300`

### Toggle/Switch Components

iOS-style toggle switch pattern:
- Container: `relative inline-flex items-center h-6 w-12 rounded-full`
- Slider: `transform rounded-full transition-transform duration-300`
- Position: `darkMode ? 'translate-x-6' : 'translate-x-0.5'`
- Icon inside slider for visual feedback

---

## API & Backend Integration

### API Call Structure

Location: `/Utils/Apicalls/{Feature}.ts`

```typescript
export const getUser = async (): Promise<Response> => {
  try {
    const resp = await axios.get("/api/v1/users/profile");
    return resp;
  } catch (error) {
    console.error("Error fetching user:", error);
    return false;
  }
};
```

### Response Handling

- Always handle failures gracefully
- Return `false` on error or meaningful error object
- Parse JSON responses before returning

### API Route Pattern

Location: `/app/api/v1/{feature}/`

---

## Context Providers

### ThemeContext (Reference Implementation)

```typescript
"use client";
import  { createContext, useState, useContext, ReactNode } from "react";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
```

---

## Authentication Flow

- **Storage:** JWT tokens stored in localStorage
- **Retrieval:** Use `getUser()` from API calls
- **Fallback:** Remove token if user fetch returns `false`
- **Check:** Conditional rendering based on `isLogin` state and `user.isAdmin` role

---

## Development Standards

### Code Quality

- **Formatter:** Prettier (auto-formats on commit via husky)
- **Linting:** ESLint with Next.js config
- **Pre-commit Hooks:** lint-staged runs prettier on staged files

### Console Usage

- Use `console.log()` for debugging during development
- Remove debug logs before committing to production branches
- Use meaningful messages

### Comments

- Add comments for complex logic
- Use JSDoc style for functions when needed
- Keep comments up-to-date with code changes

---

## Accessibility Standards

- Add `aria-label` to interactive elements without visible text
- Use semantic HTML elements
- Ensure color contrast meets WCAG standards
- Include `alt` text for images

---

## Performance Considerations

1. **Images:** Use Next.js `Image` component with dimensions
   ```jsx
   <Image src={"/logo.svg"} width={20} height={20} alt="logo" />
   ```

2. **Lazy Loading:** Utilize Next.js automatic code splitting

3. **Avoid:**
   - Inline functions in className (move to separate constants)
   - Unnecessary re-renders (use proper dependency arrays)
   - Large bundle imports (tree-shake where possible)

---

## Common Patterns & Examples

### Conditional Rendering with Authentication

```typescript
{!isLogin && (
  <>
    <li><Link href={"/login"}>Login</Link></li>
    <li><Link href={"/register"}>SignUp</Link></li>
  </>
)}

{isLogin && (
  <>
    <li><Link href={user.isAdmin ? "/admin" : "/dashboard"}>Dashboard</Link></li>
    <li>Welcome, {user.username}</li>
  </>
)}
```

### Mobile Responsive Menu

```typescript
<button 
  onClick={() => setIsMenuOpen(!isMenuOpen)} 
  className="md:hidden"
>
  {isMenuOpen ? <MdClose /> : <MdMenu />}
</button>

<ul className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row`}>
  {/* menu items */}
</ul>
```

---

## Known Issues & Workarounds

- Remove unused imports (e.g., `FaSun, FaMoon` from react-icons if using lucide-react)
- Ensure all API endpoints return proper JSON responses
- Handle localStorage carefully in SSR contexts

---

## Future Improvements & TODOs

- [ ] Complete conversion of all remaining components to TypeScript
- [ ] Create comprehensive type definition files for all API responses
- [ ] Implement global error boundary with TypeScript
- [ ] Add loading states to all API calls with proper typing
- [ ] Improve error messages for users
- [ ] Add analytics tracking
- [ ] Optimize image sizes for different breakpoints
- [ ] Implement proper caching strategy
- [ ] Add comprehensive error logging
- [ ] Set up pre-commit hooks to enforce type checking

---

## Related Files

- **Configuration:** `tailwind.config.js`, `next.config.mjs`, `tsconfig.json`
- **Theme:** `Utils/ThemeContext.ts`
- **Package Info:** `package.json`
- **Reference Component:** `Components/Navbar/Navbar.tsx`

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-06-20 | 2.0 | Complete TypeScript migration - all files converted from JS/JSX to TS/TSX with strict mode enabled; added TypeScript standards section |
| 2026-06-20 | 1.0 | Initial comprehensive documentation created including Navbar component updates with iOS-style toggle switch and elegant link styling |

---

**Last Updated:** 2026-06-20  
**Maintained By:** Development Team  
**Status:** Active & Maintained
