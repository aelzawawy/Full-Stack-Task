# AI Assistance & Engineering Ownership Report (AI.md)

## 1. Executive Overview
In accordance with the evaluation guidelines, AI was utilized as an **engineering force multiplier** to accelerate scaffolding, boilerplate generation, validation regex construction, and API documentation setup. 

Rather than adopting generated suggestions uncritically, strict senior-level judgment was exercised to evaluate architectural trade-offs, reject unnecessary dependency bloat, fix critical environment incompatibilities, and ensure production-readiness across the stack.

---

## 2. Breakdown of AI Assistance: What Was Generated vs. Human-Authored

| Component / Layer | AI-Assisted Generation | Engineering Ownership & Human Overrides |
| :--- | :--- | :--- |
| **Frontend Architecture** | Initial template files via Vite. | **Rejected external state & form libraries** (`zustand`, `redux`, `react-hook-form`, `zod`). Implemented a native React `AuthContext` and custom generic `useAuthForm<T>` hook with zero runtime dependency overhead. |
| **Frontend Routing & Guards** | Suggested installing `react-router-dom` or keeping raw state toggles. | **Rejected `react-router-dom`**. Engineered a zero-dependency native router utilizing the HTML5 History API (`pushState`, `popstate`), with automated guest/session route guards and a dedicated 404 Not Found fallback. |
| **Styling & Design** | Tailwind CSS v4 setup with `@tailwindcss/vite`. | Hand-crafted dark-mode glassmorphic and neumorphic design system with soft specular highlights, sunken inset wells, tactile buttons, accessibility attributes (`aria-invalid`, labels), and clear error feedback states. |
| **HTTP Communication** | Prompt suggested installing `axios`. | **Rejected `axios`**. Authored a typed native `apiClient` using modern Web `fetch`, automatically injecting `Authorization: Bearer <token>`, intercepting raw network failures (e.g., *"Failed to fetch"*) with user-friendly connection messages, and normalizing backend error envelopes. |
| **NestJS Backend Core** | Scaffolding module skeletons and controller decorators. | Enforced strict DTO validation rules with `@Transform` sanitization, `@ApiProperty` Swagger schemas, and strict TypeScript types. Removed dangerous secret fallbacks to guarantee fail-fast behavior on missing environment variables. |
| **Data Persistence & Security** | Mongoose schema syntax. | Configured schema `{ toJSON: { transform } }` with `select: false` on the password field to guarantee password hashes are never leaked over the wire. Replaced fragile Mongoose pre-save hooks with explicit service-layer salting and hashing using `bcryptjs`. |
| **Infrastructure & Kernel Fix** | Standard `docker-compose.yml` boilerplate. | **Identified and resolved Linux kernel 6.19+ / 7.x MongoDB crash (`SERVER-121912`)** by injecting `GLIBC_TUNABLES=glibc.pthread.rseq=1`. Created a unified `./dev.sh` runner for one-command startup with graceful process management. |

---

## 3. Critical Decisions Made Differently Than What AI Suggested

### Decision 1: Zero External Form & State Libraries on Frontend
- **AI Recommendation**: Install `react-hook-form` + `zod` and `zustand`.
- **Engineering Verdict**: **Rejected**.
- **Rationale**: For an authentication module with 2 forms and 3 fields total, adding 100 KB+ of third-party dependencies adds unnecessary bundle overhead, increases vulnerability attack surface, and obscures core React competence. Writing a clean, reusable 50-line `useAuthForm` hook demonstrates deep understanding of React re-renders, closures, and HTML5 form validation events.

### Decision 2: Zero-Dependency Client-Side Routing vs. `react-router-dom`
- **AI Recommendation**: Install `react-router-dom` v7 for client-side routing, route guards, and 404 handling.
- **Engineering Verdict**: **Rejected `react-router-dom` in favor of a native HTML5 History API router (`useRouter` + `RouterProvider`)**.
- **Rationale**: For an auth-focused application with 4 primary views (`/signin`, `/signup`, `/dashboard`, and 404), adding the heavy `react-router-dom` package tree introduces bundle bloat and unnecessary abstractions on React 19. Implementing a reactive 35-line `RouterProvider` with `popstate` listeners demonstrates solid mastery of native browser Web APIs while delivering full deep-linking, browser history navigation, bidirectional route guards, and a custom 404 page with zero third-party packages.

### Decision 3: Replacing Native `bcrypt` with Pure `bcryptjs`
- **AI Recommendation**: Standard `bcrypt`.
- **Engineering Verdict**: **Adapted to `bcryptjs`**.
- **Rationale**: Native `bcrypt` requires node-gyp and native build scripts that frequently fail in lightweight containerized environments and cross-platform CI pipelines. `bcryptjs` provides identical hashing security with zero compilation friction.

### Decision 4: Resolving MongoDB Linux Kernel 6.19+ / 7.x Incompatibility (`SERVER-121912`)
- **AI Initial Output**: Standard `docker run -d mongo:latest`.
- **Observed Failure**: Container crashed immediately with `MongoDB cannot start: Linux kernel versions 6.19 and newer has a known incompatibility with this version of MongoDB (SERVER-121912)`.
- **Engineering Fix**: Researched the TCMalloc/glibc allocator collision on newer kernels (our host runs kernel `7.1.11`) and configured `GLIBC_TUNABLES=glibc.pthread.rseq=1` in both Docker and `docker-compose.yml`, stabilizing MongoDB immediately.

### Decision 5: Centralized Error Mapping for MongoDB Unique Constraints
- **AI Initial Output**: Rely on default NestJS exception handling.
- **Observed Behavior**: Duplicate email signups produced an unformatted 500 internal server error or unhandled Mongo driver error.
- **Engineering Fix**: Created a global `AllExceptionsFilter` that intercepts Mongo error code `11000` and translates it to `409 Conflict: Email already registered`.

---

## 4. Prompt History & Iteration Log

### Prompt 1: DTO Validation Rules
- **Prompt**: *"Generate NestJS DTOs for signup with email, name (min 3 chars), and password (min 8 chars with 1 letter, 1 number, 1 special character @$!%*#?&)."*
- **Effectiveness**: High. The regex `^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$` accurately matched the prompt criteria.
- **Manual Correction**: Added class-transformer `@Transform` to trim strings and lowercase emails at the network boundary, and added custom user-friendly error strings to decorators.

### Prompt 2: Zero-Dependency Form Hook
- **Prompt**: *"Create a custom React hook in TypeScript for form validation without any external libraries."*
- **Effectiveness**: Medium. The initial output only validated on submit, which gave poor UX feedback.
- **Manual Correction**: Refactored the hook to track `touched` states and run instant validation on `onBlur`, while re-validating on `onChange` only after a field has already been touched.

### Prompt 3: Route Guards & 404 Not Found Handling
- **Prompt**: *"Should we have route guards and a 404 Not Found page on the frontend?"*
- **Effectiveness**: High. Evaluated whether to add `react-router-dom` or build a native Web API solution.
- **Manual Correction**: Chose the zero-dependency route. Implemented bidirectional route guards (unauthenticated redirected from `/dashboard` to `/signin`; authenticated redirected from `/signin`/`/signup` to `/dashboard`) and a glassmorphic 404 fallback page that displays the invalid URL path.

### Prompt 4: Swagger OpenAPI Configuration
- **Prompt**: *"Add Swagger documentation to NestJS with JWT Bearer authentication."*
- **Effectiveness**: High. Quickly scaffolded `DocumentBuilder().addBearerAuth(...)` and controller decorators.
- **Manual Correction**: Added explicit response schema descriptions and status codes (`200`, `201`, `400`, `401`, `409`).

---

## 5. Verification & Quality Assurance Summary
1. **Automated Unit Tests**: Vitest test suites across both backend and frontend: 7/7 backend tests passed and 26/26 frontend component/hook tests passed (33/33 tests total, 100% pass rate).
2. **Browser End-to-End Testing**: Verified full flow on `http://localhost:5173/` (empty form validation triggers, successful registration, redirect to dashboard, verification of dashboard data, live test of protected `GET /auth/profile`, and logout session clearance).
3. **Route Guards & 404 Verification**: Verified deep-linking to `/signin`, `/signup`, and `/dashboard`. Confirmed that visiting an unauthenticated `/dashboard` redirects to `/signin`, visiting `/signin` while logged in redirects to `/dashboard`, and entering unknown URLs (e.g. `/foo`, `/settings`) correctly renders the 404 Not Found page.
4. **API Contract Verification**: Direct `curl` test sequence verified all positive and negative HTTP status codes (200, 201, 400, 401, 409).
