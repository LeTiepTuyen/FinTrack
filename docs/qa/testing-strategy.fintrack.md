# Fintrack Testing Strategy

**Author:** Fintrack Team  
**Version:** 0.2  
**Date:** 2026-05-05  
**Security Classification:** Internal use

---

## Document History

| Version | Effective Date | Author | Details | Reviewer | Approver |
|---|---|---|---|---|---|
| 0.2 | 2026-05-05 | Fintrack Team | Expanded from repository evidence and current API/UI flows |  |  |
| 0.1 | 2026-05-05 | Fintrack Team | Initial     draft created from repository evidence |  |  |

---

## Confidentiality

This document is intended for internal project use. It should be reviewed and updated as the Fintrack repository evolves.

---

## 1. Introduction

### Document Objective
This Testing Strategy defines the quality approach for the Fintrack project. It describes how the team will verify the Vue 3 frontend, Node.js and Express backend, MongoDB data layer, and the business journeys that support personal finance management.

### Product / Project Overview
Fintrack is a full-stack personal finance platform that supports user registration, login, transaction tracking, monthly budget management, dashboard analytics, profile/security updates, and an AI assistant simulation. The repository contains a Vue 3 + Vite frontend, a Node.js + Express API, and MongoDB persistence through Mongoose.

The backend currently exposes three protected business domains:
- authentication and profile management under /api/auth
- transaction management under /api/transactions
- budget management under /api/budgets

The frontend consumes these APIs through a shared Axios client that injects the stored bearer token automatically.

### Testing Team Scope
The current project team owns both feature delivery and quality review. The strategy focuses on repository-level testing activities for the product itself, not on external third-party services that are not represented in the codebase. The repository README lists three core contributors: Le Tiep Tuyen, Mai Thieu Tin, and Doan Hong Ngoc.

---

## 2. Principles of Software Testing

- Testing is risk-based and should focus first on authentication, data isolation, and money-related behavior.
- Early validation is preferred over late defect discovery.
- Test evidence should be traceable to repository behavior, user stories, or documented requirements.
- Exhaustive testing is not realistic, so the team should prioritize critical user journeys and regression-sensitive areas.
- Missing information should be recorded as an assumption instead of being invented.
- Frontend state, backend response, and MongoDB persistence should be validated together whenever a change affects a shared flow.
- Protected requests should be validated with and without a bearer token.
- Where the repository already defines schema constraints, test design should include duplicate-key and validation-negative coverage.

---

## 3. Scope

### 3.1 In Scope
| Area | Scope |
|---|---|
| Frontend views | Home, Login, Dashboard, Transactions, Budgets, Settings, Features, Blog, and AI Assistant views in frontend/src/views |
| Frontend state | Auth persistence in frontend/src/stores/authStore.js, finance orchestration in frontend/src/stores/financeStore.js, route protection in frontend/src/router/index.js, and Axios auth injection in frontend/src/services/api.js |
| Backend routes | Auth, transaction, and budget APIs in backend/routes |
| Backend behavior | JWT protection, request validation, create/update/delete flows, filtering, pagination, summary calculations, and duplicate-budget handling |
| Data model behavior | User, Transaction, and Budget schema rules in backend/models and DATABASE.md |
| Core journeys | Register, login, profile update, password update, add transaction, edit transaction, delete transaction, filter/search transactions, add budget, update budget, delete budget, and dashboard summary rendering |
| Quality signals | Smoke checks, regression checks, exploratory charters, defect evidence, and environment readiness checks |

### 3.2 Out of Scope
- Features that are not present in the repository.
- Production deployment validation beyond the local development setup and repository documentation.
- Third-party integrations that are not implemented in the codebase.
- Full automation frameworks that are not currently configured in the repo.
- Native mobile testing, because the repository does not contain a mobile application.
- Backend linting or formatting policy enforcement, because the repository does not define one.
- Advanced performance engineering beyond lightweight sprint-based checks.

### 3.3 Risks & Issues
| Ref | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| 1 | No dedicated automated test framework is currently configured. | High | High | Use a manual baseline strategy first, then add automation incrementally. |
| 2 | Backend test script is a placeholder and does not run real tests yet. | Medium | High | Replace the placeholder with a real test runner when the project adds a framework. |
| 3 | Authentication and user ownership errors could expose another user's data. | High | Medium | Prioritize negative testing and cross-user access checks on protected routes and UI flows. |
| 4 | Budget uniqueness depends on a compound unique index and backend duplicate-key handling. | High | Medium | Explicitly test duplicate category/month submissions and update collisions. |
| 5 | Transaction filtering and dashboard totals are derived from shared store/API behavior and can drift if one side changes. | High | Medium | Verify frontend store calculations against API responses and sample data. |
| 6 | Environment variables are required for backend startup and may block test execution if not configured. | Medium | Medium | Document required .env values and verify local setup before execution. |
| 7 | Regression risk is high because the app has multiple related flows: transactions, budgets, dashboard, and login. | High | Medium | Keep a small but stable regression pack for core flows. |

---

## 4. Test Methodology

Fintrack should be tested using an Agile, continuous testing approach. Each change should be validated as close as possible to the code update, with immediate feedback on authentication, transaction handling, budget management, and frontend navigation. The repository currently supports local development for both backend and frontend, so the strategy should favor lightweight, repeatable checks during each iteration.

The backend returns JSON success/error envelopes and relies on protect middleware for every private domain route. The frontend uses Pinia stores as the main orchestration layer, so test execution should validate both API outcomes and the resulting store state after each action.

---

## 5. Test Approach

The project should use risk-based testing with priority given to features that affect user trust, financial data integrity, and security. The initial test focus should be:
- login and session handling
- transaction create, update, delete, filter, and search flows
- budget create and update flows
- dashboard calculations and summaries
- protected API access and data isolation
- recovery from invalid or missing input

As the project matures, the team can add broader regression coverage, exploratory testing charters, and eventually automation.

The most likely defect clusters in this repository are:
- token persistence or authorization header issues in the frontend Axios client
- route authorization failures in protect
- duplicate budget handling caused by the unique index
- summary drift between stored transactions and dashboard computations
- normalization or mapping errors between API payloads and the store

---

## 6. Test Coverage

### 6.1 Formal Test Cases
Formal test cases should be written for each user story or change request that affects core financial behavior. At minimum, coverage should include happy paths, negative paths, permission checks, and data validation.

The highest-value formal cases for the current codebase are:
- register a new user and receive a token
- reject registration when required fields are missing or the email already exists
- log in with valid credentials and persist token/user state in localStorage
- block access to protected routes and APIs when the token is missing or invalid
- create, list, update, and delete transactions for the signed-in user only
- verify transaction search, type filtering, pagination, and sort order
- verify dashboard totals and summary numbers against the underlying transaction set
- create, update, and delete budgets for the signed-in user only
- reject duplicate budget submissions for the same category and month
- verify profile update and password update behavior

### 6.2 Test Charters
Test charters should be used alongside formal test cases when the team needs exploratory coverage or wants to explore a risky area without over-specifying every step.

#### Pre-Charter Notes
- Test objective
- Feature or workflow under review
- Environment and test data to be used
- Links to related test cases or work items
- Expected API route or frontend screen

#### Test Notes
- Observed behavior during execution
- Deviations from expected behavior
- Questions or follow-up items
- Any defect IDs or evidence captured during the session
- Request payloads and response codes where relevant

#### Debrief Notes
- Summary of findings
- Coverage gaps discovered
- Suggestions for follow-up test cases
- Final status of the charter session
- Recommendation for automation candidates

---

## 7. Type of Testing

### 7.1 Functional Testing
Functional testing should validate the behavior of the frontend screens and backend APIs against expected user actions and data rules. It should cover authentication, transaction management, budgeting, dashboard summaries, and account settings.

The current frontend architecture uses route-level protection in frontend/src/router/index.js, shared state in Pinia stores, and a centralized API client. Functional coverage should therefore include route guards, store updates, and data rendering after API success and failure states.

### 7.2 Non-Functional Testing
Non-functional testing should focus on compatibility, reliability, data handling, and basic security behavior. Since the repository does not yet include a dedicated non-functional test toolchain, the first iteration can be manual and evidence-driven.

The most important non-functional concern in this project is not throughput; it is correctness under auth, data isolation, and data consistency pressure.

#### 7.2.1 Sprint-based Performance Testing
##### Objective
Validate that the core flows remain responsive enough for everyday use as features are added, especially transaction listing, summary calculation, and budget rendering.

##### Entry Criteria
- Backend and frontend are running locally.
- Core happy-path functional checks pass.
- Test data is available for the scenario under review.
- The relevant route and store behavior has already passed basic smoke checks.

##### Exit Criteria
- No blocking performance issue is observed in the targeted flow.
- Any slowdown or timeout is documented and assigned.
- The flow remains usable with the expected local dataset size.

##### Special Considerations
- This project does not currently include a performance test framework.
- Performance checks should be lightweight and focused on the highest-risk flows.
- If performance becomes a release blocker, a dedicated tool should be introduced.
- Dashboard and transaction queries should be checked with realistic filter combinations because those paths are computed from live collections.

### 7.3 User Acceptance Test (UAT)
UAT should be performed by the project stakeholders or the assigned reviewers after the main functional flows are stable. QA support should focus on preparation, defect clarification, and retest support. For Fintrack, UAT should concentrate on the business-visible journeys: sign up, log in, record income or expense, review dashboard totals, set budgets, and update profile data.

---

## 8. Test Management

Test management should be simple and visible. The team should maintain a small set of reusable test cases, exploratory charters, and defect notes. If the project uses an issue tracker or board, each test run should link back to the relevant work item.

Given the current repository state, the most practical test-management approach is a lightweight baseline: one core regression pack for auth, transactions, and budgets; a small exploratory charter set for dashboard and settings; and a repeatable smoke checklist for backend and frontend startup.

---

## 9. Test Data Management

Test data should be created to match the MongoDB model and the user-owned data pattern described in DATABASE.md. The repository already contains seed_budgets.js, which can be used as a starting point for repeatable budget data. Test data should avoid real personal information and should include:
- valid user records
- multiple transaction types
- monthly budget examples
- invalid payloads for negative testing
- cross-user data to verify access isolation

Because User.email is unique and budgets have a unique compound index, test data should also include duplicate-user and duplicate-budget scenarios.

---

## 10. Test Environment Management

The expected local environment is:
- Backend on port 8000
- Frontend on port 5173
- MongoDB local instance or Atlas connection through MONGODB_URI
- Backend environment variables such as MONGODB_URI, JWT_SECRET, and optionally PORT

The team should confirm environment readiness before each test cycle, especially after changes to the backend startup, authentication, or database schema.

The frontend should be exercised through the Vite dev server with the API base URL pointed either at http://127.0.0.1:8000/api or a configured VITE_API_URL. The backend should be started in a way that preserves the JWT signing secret used by both auth and middleware.

---

## 11. Bug Management

Defects should be logged with clear reproduction steps, expected vs actual results, environment details, and supporting evidence such as screenshots, request payloads, or console output. Severity should reflect business impact, especially for authentication failures, data loss, incorrect balances, or cross-user data exposure. Priority should reflect release urgency and regression risk.

Bug triage should treat authorization, data isolation, and duplicate-budget handling as release-sensitive by default.

---

## 12. Test Deliverables

- Testing Strategy document
- Test cases for core user stories
- Exploratory testing charters where needed
- Execution notes and evidence
- Defect reports and retest notes
- Sprint-level QA summary or sign-off notes
- Smoke checklist for backend and frontend startup
- Core regression checklist for auth, transactions, budgets, and dashboard

---

## 13. Roles and Responsibilities

- Project team members own feature development, defect correction, and product knowledge.
- The team lead should ensure testing priorities follow business risk.
- Developers should support defect analysis and fix verification.
- Reviewers should validate that the strategy and test evidence are complete enough for sign-off.

The repository does not define a separate QA team or product owner role, so this strategy assumes the core contributors collaborate on both implementation and verification. That assumption should be revisited if the team structure changes.

---

## 14. Testing Activity

Testing should follow the feature flow of the repository:
1. Review the change or user story.
2. Identify impacted backend routes, controllers, models, frontend views, and Pinia store actions.
3. Prepare test data and environment variables.
4. Execute formal test cases and exploratory charters.
5. Log defects and verify fixes.
6. Perform regression on login, transactions, budgets, and dashboard summaries before closure.

When a change touches auth, transaction filtering, or budget uniqueness, the test activity should also include token handling and cross-user access checks.

---

## 15. Suspension / Exit Criteria

### Suspension Criteria
Testing may be suspended when the backend cannot start, the database is unavailable, or a blocking defect prevents reliable execution of the core flow under review.

Testing should also pause when token generation or authorization middleware is broken, because that would invalidate most downstream functional checks.

### Exit Criteria
A test cycle may be closed when:
- critical login, transaction, and budget flows have been exercised
- no unresolved critical defects remain open for the tested scope
- known issues are documented and accepted by the team
- the execution evidence is complete enough for review
- the latest smoke checks for backend startup and frontend navigation have passed

---

## 16. Relevant Documents

- README.md
- DATABASE.md
- backend/package.json
- frontend/package.json
- backend/server.js
- backend/routes/authRoutes.js
- backend/routes/transactionRoutes.js
- backend/routes/budgetRoutes.js
- backend/controllers/authController.js
- backend/controllers/transactionController.js
- backend/controllers/budgetController.js
- backend/middleware/authMiddleware.js
- backend/models/User.js
- backend/models/Transaction.js
- backend/models/Budget.js
- frontend/src/router/index.js
- frontend/src/stores/authStore.js
- frontend/src/stores/financeStore.js
- frontend/src/services/api.js
- frontend/src/views/*.vue
- ado-import-fintrack-sprint2-week7.csv

---

## Open Questions / Assumptions

- No automated test framework is configured yet, so the first version of the strategy assumes a manual baseline.
- The repository does not include CI/CD configuration, so environment checks are currently local-development oriented.
- The issue tracker and release workflow are not defined in the repository, so defect lifecycle details should be confirmed by the team.
- This strategy assumes the AI assistant page is simulation-only and does not require integration testing with an external AI service.
