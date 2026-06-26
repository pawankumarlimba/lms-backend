/**
 * Loan lifecycle states.
 *
 * APPLIED      -> created the moment the borrower clicks "Apply" (after BRE pass).
 * SANCTIONED   -> approved by a Sanction executive.
 * REJECTED     -> rejected by a Sanction executive (terminal, reason required).
 * DISBURSED    -> funds released by a Disbursement executive.
 * CLOSED       -> auto-closed by the system once totalPaid >= totalRepayment.
 */
export enum LoanStatus {
  APPLIED = "APPLIED",
  SANCTIONED = "SANCTIONED",
  REJECTED = "REJECTED",
  DISBURSED = "DISBURSED",
  CLOSED = "CLOSED",
}

/**
 * Centralised state machine: every valid transition lives here.
 * Any service that wants to move a loan to a new status MUST go through
 * LoanStatusTransitionMap.isValidTransition() so the rule can never be
 * duplicated/forgotten in a controller.
 */
export class LoanStatusTransitionMap {
  private static readonly transitions: Record<LoanStatus, LoanStatus[]> = {
    [LoanStatus.APPLIED]: [LoanStatus.SANCTIONED, LoanStatus.REJECTED],
    [LoanStatus.SANCTIONED]: [LoanStatus.DISBURSED],
    [LoanStatus.REJECTED]: [],
    [LoanStatus.DISBURSED]: [LoanStatus.CLOSED],
    [LoanStatus.CLOSED]: [],
  };

  public static isValidTransition(from: LoanStatus, to: LoanStatus): boolean {
    return this.transitions[from]?.includes(to) ?? false;
  }

  public static nextStates(from: LoanStatus): LoanStatus[] {
    return this.transitions[from] ?? [];
  }
}
