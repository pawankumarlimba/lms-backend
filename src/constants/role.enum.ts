/**
 * All roles recognised by the system.
 * Stored verbatim on the User document and checked by RBAC middleware.
 */
export enum Role {
  ADMIN = "ADMIN",
  SALES = "SALES",
  SANCTION = "SANCTION",
  DISBURSEMENT = "DISBURSEMENT",
  COLLECTION = "COLLECTION",
  BORROWER = "BORROWER",
}

/** Roles that are internal "executive" roles with dashboard access. */
export const EXECUTIVE_ROLES: Role[] = [
  Role.SALES,
  Role.SANCTION,
  Role.DISBURSEMENT,
  Role.COLLECTION,
];

export const ALL_ROLES: Role[] = [Role.ADMIN, ...EXECUTIVE_ROLES, Role.BORROWER];
