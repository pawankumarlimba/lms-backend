export interface IInterestBreakdown {
  principal: number;
  interest: number;
  totalRepayment: number;
}

/**
 * InterestCalculator is the extension point for loan math. LoanService
 * depends on this abstract type, not on a concrete formula - if the
 * business later needs compound interest or slab-based rates, a new class
 * extends this one and is swapped in without touching LoanService.
 */
export abstract class InterestCalculator {
  protected constructor(protected readonly annualRatePercent: number) {}

  public abstract calculate(principal: number, tenureDays: number): IInterestBreakdown;
}

/**
 * Simple Interest: SI = (P x R x T) / (365 x 100), T in days.
 * Total Repayment = P + SI. Matches the spec exactly.
 */
export class SimpleInterestCalculator extends InterestCalculator {
  constructor(annualRatePercent: number = 12) {
    super(annualRatePercent);
  }

  public calculate(principal: number, tenureDays: number): IInterestBreakdown {
    const interest = (principal * this.annualRatePercent * tenureDays) / (365 * 100);
    const roundedInterest = Math.round(interest * 100) / 100;
    const totalRepayment = Math.round((principal + roundedInterest) * 100) / 100;

    return {
      principal,
      interest: roundedInterest,
      totalRepayment,
    };
  }
}
