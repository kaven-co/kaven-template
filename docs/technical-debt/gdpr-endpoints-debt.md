# Technical Debt: GDPR Compliance Endpoints

**Date:** 2026-02-08
**Sprint:** Sprint 1
**Priority:** Medium (post-launch)

## Description

GDPR compliance test files were created but corresponding API endpoints were never implemented.

## Missing Endpoints

| Endpoint                    | Method   | Description                                  |
| --------------------------- | -------- | -------------------------------------------- |
| `/api/users/:id/gdpr-erase` | DELETE   | Right to Erasure (account deletion)          |
| `/api/users/:id/export`     | GET      | Right to Access (data export - JSON/CSV/XML) |
| `/api/users/:id/consent`    | GET/POST | Consent management                           |

## Test Files Affected

- `apps/api/tests/compliance/right-to-access.spec.ts`
- `apps/api/tests/compliance/right-to-erasure.spec.ts`
- `apps/api/tests/compliance/consent-management.spec.ts`
- `apps/api/tests/compliance/data-portability.spec.ts`

## Original Commit

- `27f0e5e826499f88eaf9faa02f0257bbe3b95086` - GDPR Compliance Tests

## Documentation

- `docs/compliance/gdpr.md` - Complete GDPR implementation guide (already exists)

## Effort Estimate

16-24 hours (implement all endpoints with proper GDPR compliance)

## Dependencies

- User model (already exists)
- Capability system (already exists)
- Background job system (for async erasure processing)

## Actions Required

1. Implement GDPR endpoints in user module
2. Add background job processing for async operations
3. Uncomment and run GDPR tests
4. Add to CI pipeline

## References

- Brazil LGPD: 7-year fiscal data retention
- EU GDPR: 5-year audit log retention
- See: `docs/compliance/gdpr.md`
