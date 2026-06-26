# LMS Backend
Project Link=https://lms-backend-nine-azure.vercel.app/health
Node.js + Express + TypeScript + MongoDB (Mongoose) API for the Loan Management System.

## Architecture

```
src/
  config/        Typed env config singleton, Cloudinary config
  core/
    database/    Database singleton (the ONLY place mongoose.connect is called)
    base/        BaseSchema factory, BaseRepository<T>, BaseController
    errors/      ApiError + typed subclasses (BadRequestError, NotFoundError, ...)
    http/        ApiResponse envelope, asyncHandler
  constants/     Role, LoanStatus (+ transition map), EmploymentMode, HttpStatus
  models/        Mongoose schemas/models, one folder per collection
  repositories/  One class per collection, all extend BaseRepository<T>
  dto/           class-validator request DTOs
  services/
    bre/         Business Rule Engine (Strategy pattern - one class per rule)
    loan/        InterestCalculator (abstract) + SimpleInterestCalculator
    *.service.ts AuthService, LoanService, PaymentService, JwtService, UploadService
  controllers/   One per module (auth, borrower, sales, sanction, disbursement, collection, admin)
  middlewares/   auth (JWT), rbac, validation, upload (multer), global error handler
  routes/        One router per module, mounted under /api
  seed/          seed.ts - creates one account per role
  app.ts         App class - express wiring
  server.ts      bootstrap - connects DB, starts HTTP server, graceful shutdown
```

### Why these design decisions

**BaseRepository<T>.** Every repository (`UserRepository`, `LoanApplicationRepository`,
`BorrowerProfileRepository`, `PaymentRepository`) extends one generic `BaseRepository<T>` that
implements `create`, `createMany`, `find` (paginated), `findAll`, `findById`, `updateById`,
`updateMany`, `bulkWrite`, soft `deleteById`, hard `hardDeleteById`, `exists`, `count`. New
collections get full CRUD + bulk ops for free by extending this class and adding only their
collection-specific queries (Open/Closed Principle).

**Soft deletes.** `BaseSchema` adds `isDeleted` to every collection; `BaseRepository` filters it
out of every read automatically. An LMS is audit-sensitive - records are never hard-deleted except
by the seed script's cleanup path.

**BRE runs server-side only.** The client mirrors the same rules for instant UX feedback, but the
server is the authoritative gate, since client-side checks can be bypassed by calling the API
directly. `BusinessRuleEngine` composes 4 independent `IBreRule` strategies (Age, Salary, PAN
format, Employment) - adding a 5th rule later means adding one class, not touching the engine.

**PAN regex.** `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` (5 letters, 4 digits, 1 letter) - the real Indian PAN
format. Lives in one place (`utils/regex.util.ts`) and is imported by both the DTO validator and
the BRE rule so it can never drift.

**Loan status transitions.** `LoanStatusTransitionMap` (in `constants/loan-status.enum.ts`) is the
single source of truth for which status can move to which: `APPLIED -> SANCTIONED | REJECTED`,
`SANCTIONED -> DISBURSED`, `DISBURSED -> CLOSED` (auto, by `PaymentService` once
`totalPaid >= totalRepayment`). Every service method that mutates status calls
`LoanStatusTransitionMap.isValidTransition()` first.

**RBAC.** Role is a string enum stored directly on the `User` document (`role` field, indexed).
`authenticate` middleware verifies the JWT and attaches `{ userId, role }` to `req.user`.
`authorize(...roles)` middleware checks `req.user.role` against the allowed list for that route -
**Admin implicitly passes every `authorize()` check** (per spec: "Admin can access all modules").
The one exception is the borrower application portal, which uses `requireExactRole(BORROWER)` with
no Admin bypass, since the spec scopes Admin's universal access to the *dashboard*, not the
borrower journey. Unauthenticated -> `401`. Authenticated but wrong role -> `403`.

**Validation.** Every request DTO is a `class-validator` class. `validateBody(SomeDto)`
middleware transforms `req.body` into that class and validates it before the controller ever sees
it - controllers never re-validate input themselves.

## Setup

```bash
npm install
npm run seed            # creates one account per role (see below)
npm run dev              # http://localhost:5000
```

Build for production: `npm run build && npm start`.

## Seeded accounts (`npm run seed`)

| Role         | Email                  | Password       |
|--------------|------------------------|----------------|
| Admin        | admin@lms.test         | Password@123   |
| Sales        | sales@lms.test         | Password@123   |
| Sanction     | sanction@lms.test      | Password@123   |
| Disbursement | disbursement@lms.test  | Password@123   |
| Collection   | collection@lms.test    | Password@123   |
| Borrower     | borrower@lms.test      | Password@123   |

## API summary

All responses: `{ success, message, data, meta? }`. Auth via httpOnly cookie (`lms_token`) set on
login/signup; also accepted as `Authorization: Bearer <token>`.

| Method | Route                                         | Role(s)            | Purpose |
|--------|------------------------------------------------|--------------------|---------|
| POST   | /api/auth/signup                              | public             | Borrower signup |
| POST   | /api/auth/login                               | public             | Login (any role) |
| POST   | /api/auth/logout                              | any                | Clear session cookie |
| GET    | /api/auth/me                                  | any                | Current user profile |
| POST   | /api/borrower/personal-details                | Borrower           | Step 2 + server-side BRE |
| POST   | /api/borrower/apply                           | Borrower           | Step 3+4: upload slip + apply (multipart, field `salarySlip`) |
| GET    | /api/borrower/applications                    | Borrower           | My loan applications |
| GET    | /api/borrower/applications/:loanId            | Borrower           | One application |
| GET    | /api/dashboard/sales/leads                    | Sales, Admin       | Registered, not yet applied |
| GET    | /api/dashboard/sanction/applied               | Sanction, Admin    | Loans with status APPLIED |
| PATCH  | /api/dashboard/sanction/:loanId/sanction      | Sanction, Admin    | APPLIED -> SANCTIONED |
| PATCH  | /api/dashboard/sanction/:loanId/reject        | Sanction, Admin    | APPLIED -> REJECTED (body: `reason`) |
| GET    | /api/dashboard/disbursement/sanctioned        | Disbursement, Admin| Loans with status SANCTIONED |
| PATCH  | /api/dashboard/disbursement/:loanId/disburse  | Disbursement, Admin| SANCTIONED -> DISBURSED |
| GET    | /api/dashboard/collection/disbursed           | Collection, Admin  | Loans with status DISBURSED |
| POST   | /api/dashboard/collection/:loanId/payments    | Collection, Admin  | Record a payment (UTR unique, amount <= outstanding) |
| GET    | /api/dashboard/collection/:loanId/payments    | Collection, Admin  | Payment history for a loan |
| GET    | /api/dashboard/admin/overview                 | Admin              | Counts across every stage |

## Loan math

`Simple Interest = (Principal x 12 x TenureDays) / (365 x 100)`
`Total Repayment = Principal + Simple Interest`

Implemented in `services/loan/InterestCalculator.ts` as `SimpleInterestCalculator extends
InterestCalculator` (abstract) - a future compound/slab-rate model can extend the same base class
without changing `LoanService`.
