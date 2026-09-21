# VehicleWorkshop Agent Guide

## Project Shape

- This is an Angular 21 standalone application named `workshop`, bootstrapped with `bootstrapApplication`.
- Keep feature code under `src/app`: pages for routed screens, components for reusable UI, services for API/data access, models and interfaces for domain types, and layout for the shared application shell.
- Routes are defined in [src/app.routes.ts](src/app.routes.ts). Preserve the existing lazy `loadComponent` pattern for routed standalone pages and keep authenticated features behind the existing auth boundary.
- Global providers, locale, currency, PrimeNG theme, HTTP, and zoneless change detection are configured in [src/app.config.ts](src/app.config.ts).
- Use the `@/*` TypeScript path alias for imports from `src`.

## UI And Code Conventions

- Components are standalone and normally use colocated `.component.ts`, `.component.html`, and `.component.scss` files. New components should use SCSS, matching [angular.json](angular.json).
- Reuse PrimeNG 21, PrimeIcons, Tailwind CSS 4, and the existing Sakai-style layout classes before introducing new UI primitives. Global styles live in [src/assets/styles.scss](src/assets/styles.scss) and [src/assets/tailwind.css](src/assets/tailwind.css).
- Follow the existing Portuguese UI, `pt-BR` locale, and `BRL` currency conventions unless a feature explicitly requires another locale.
- TypeScript and Angular templates are strict. Prefer explicit types, reactive forms where the surrounding feature uses them, and existing services/models/interfaces over duplicate data shapes.
- Keep component styles below the production `4kb` maximum. Run formatting after source changes with `npm run format`.
- The configured selectors use `p` as the component/directive prefix; follow the existing selector style when creating Angular declarations.

## Validation Commands

- Install dependencies with `npm install` when needed.
- Start development: `npm start`.
- Production build: `npm run build`.
- Development build: `npx ng build --configuration development`.
- Unit tests: `npm test`.
- Format: `npm run format`.
- There is no working `lint` script currently; `eslint.config.js` references Angular ESLint packages that are not declared in `package.json`. Do not treat lint as available until that dependency/configuration gap is resolved.

For a focused change, validate the narrowest relevant command first, then run the production build when the change affects shared routing, providers, services, or templates. Do not add tests that depend on an e2e framework unless one is introduced; the configured test runner is Karma/Jasmine.

## Environments And Capacitor

- Development builds replace [src/environments/environment.ts](src/environments/environment.ts) with [src/environments/environment.development.ts](src/environments/environment.development.ts); check both before changing API configuration.
- Browser development uses local backend settings, while Android/device development must use a reachable LAN host instead of `localhost`.
- Existing services attach bearer tokens from storage; preserve the established authentication/storage flow when adding API calls.
- Angular writes production output to `dist/atena-truck` in [angular.json](angular.json), while [capacitor.config.ts](capacitor.config.ts) currently declares `webDir: 'dist'`. Check this mismatch before running Capacitor sync or packaging commands.
- Treat the hard-coded Google Maps key in [src/index.html](src/index.html) as sensitive configuration; do not expose or copy it into new files.

## Documentation And Workflow

- The repository README is the Angular CLI baseline: [README.md](README.md). Update it only when project setup or user-facing commands materially change.
- Use nearby implementations as the source of truth, especially [src/app/pages/workshop/equipment/register/material/material.component.ts](src/app/pages/workshop/equipment/register/material/material.component.ts) for standalone CRUD pages and [src/app/services/workshop/tool.control/tool.control.material.service.ts](src/app/services/workshop/tool.control/tool.control.material.service.ts) for service/environment patterns.
- Keep changes scoped to the requested feature and do not rewrite unrelated generated or user-modified files.
- When improving these instructions from future session friction, use `/chronicle improve` and update this file with concise, verified patterns.
