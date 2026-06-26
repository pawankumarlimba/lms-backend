import { UserRepository } from "@repositories/user.repository";
import { BorrowerProfileRepository } from "@repositories/borrower-profile.repository";
import { LoanApplicationRepository } from "@repositories/loan-application.repository";
import { BusinessRuleEngine } from "@services/bre/BusinessRuleEngine";
import { UploadService } from "@services/upload.service";
import { SimpleInterestCalculator } from "@services/loan/InterestCalculator";
import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { ApplyLoanDto } from "@dto/loan/apply-loan.dto";
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "@core/errors/ApiError";
import { LoanStatus, LoanStatusTransitionMap } from "@constants/loan-status.enum";
import { IPaginationParams } from "@core/base/BaseRepository";
import { IBorrowerProfile } from "@models/BorrowerProfile/borrower-profile.types";
import { ILoanApplication } from "@models/LoanApplication/loan-application.types";

const INTEREST_RATE_PERCENT = 12;

/**
 * LoanService is the single orchestrator for the borrower journey (steps
 * 2-4) and every executive action on a loan (sanction/reject/disburse).
 * It composes repositories + the BRE + the calculator + the upload service
 * rather than inheriting from any of them (composition over inheritance).
 */
export class LoanService {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly borrowerProfileRepository: BorrowerProfileRepository = new BorrowerProfileRepository(),
    private readonly loanRepository: LoanApplicationRepository = new LoanApplicationRepository(),
    private readonly bre: BusinessRuleEngine = new BusinessRuleEngine(),
    private readonly uploadService: UploadService = new UploadService(),
    private readonly interestCalculator: SimpleInterestCalculator = new SimpleInterestCalculator(
      INTEREST_RATE_PERCENT
    )
  ) {}

  // ---------------------------------------------------------------------
  // Step 2: Personal Details + BRE (server-side, authoritative)
  // ---------------------------------------------------------------------
  public async submitPersonalDetails(userId: string, dto: PersonalDetailsDto): Promise<IBorrowerProfile> {
    const verdict = this.bre.run(dto);

    const payload: Partial<IBorrowerProfile> = {
      userId: userId as unknown as IBorrowerProfile["userId"],
      panNumber: dto.panNumber.toUpperCase(),
      dateOfBirth: new Date(dto.dateOfBirth),
      monthlySalary: dto.monthlySalary,
      employmentMode: dto.employmentMode,
      breStatus: verdict.status,
      breResults: verdict.results,
      breEvaluatedAt: new Date(),
    };

    const existing = await this.borrowerProfileRepository.findByUserId(userId);
    const profile = existing
      ? await this.borrowerProfileRepository.updateByIdOrThrow(existing.id, payload)
      : await this.borrowerProfileRepository.create(payload);

    if (verdict.status === "REJECTED") {
      // Block the application here, with a clear, specific error per rule.
      throw new ValidationError(
        { breResults: verdict.results, failedReasons: verdict.failedReasons },
        "Application rejected by eligibility check (BRE)"
      );
    }

    return profile;
  }

  // ---------------------------------------------------------------------
  // Step 4: Loan Configuration & Apply
  // ---------------------------------------------------------------------
  public async applyForLoan(
    userId: string,
    dto: ApplyLoanDto,
    file: Express.Multer.File
  ): Promise<ILoanApplication> {
    const profile = await this.borrowerProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new BadRequestError("Complete personal details before applying for a loan");
    }
    if (profile.breStatus !== "PASSED") {
      throw new ForbiddenError("Your eligibility check did not pass - you cannot apply for a loan");
    }

    const salarySlip = await this.uploadService.uploadSalarySlip(file, userId);
    const breakdown = this.interestCalculator.calculate(dto.principal, dto.tenureDays);

    return this.loanRepository.create({
      borrowerId: userId as unknown as ILoanApplication["borrowerId"],
      borrowerProfileId: profile.id as unknown as ILoanApplication["borrowerProfileId"],
      salarySlip,
      principal: breakdown.principal,
      tenureDays: dto.tenureDays,
      interestRate: INTEREST_RATE_PERCENT,
      simpleInterest: breakdown.interest,
      totalRepayment: breakdown.totalRepayment,
      totalPaid: 0,
      outstandingAmount: breakdown.totalRepayment,
      status: LoanStatus.APPLIED,
    });
  }

  public async getMyApplications(userId: string): Promise<ILoanApplication[]> {
    return this.loanRepository.findByBorrower(userId);
  }

  public async getLoanByIdOrThrow(loanId: string): Promise<ILoanApplication> {
    const loan = await this.loanRepository.findByIdWithDetails(loanId);
    if (!loan) throw new NotFoundError("Loan application not found");
    return loan;
  }

  // ---------------------------------------------------------------------
  // Sales module: leads = borrowers who registered but have NOT applied yet
  // ---------------------------------------------------------------------
  public async getLeads(pagination: IPaginationParams = {}) {
    const borrowerIdsWithApplications = await this.loanRepository.findActiveBorrowerIds();
    return this.userRepository.find(
      { role: "BORROWER", _id: { $nin: borrowerIdsWithApplications } },
      pagination
    );
  }

  // ---------------------------------------------------------------------
  // Sanction module
  // ---------------------------------------------------------------------
  public async getAppliedLoans(pagination: IPaginationParams = {}) {
    return this.loanRepository.findByStatus(LoanStatus.APPLIED, pagination);
  }

  public async sanctionLoan(loanId: string, sanctionedByUserId: string): Promise<ILoanApplication> {
    const loan = await this.loanRepository.findByIdOrThrow(loanId);
    this.assertTransition(loan.status, LoanStatus.SANCTIONED);

    return this.loanRepository.updateByIdOrThrow(loanId, {
      status: LoanStatus.SANCTIONED,
      sanctionedBy: sanctionedByUserId as unknown as ILoanApplication["sanctionedBy"],
      sanctionedAt: new Date(),
    });
  }

  public async rejectLoan(loanId: string, reason: string, sanctionedByUserId: string): Promise<ILoanApplication> {
    const loan = await this.loanRepository.findByIdOrThrow(loanId);
    this.assertTransition(loan.status, LoanStatus.REJECTED);

    return this.loanRepository.updateByIdOrThrow(loanId, {
      status: LoanStatus.REJECTED,
      rejectionReason: reason,
      sanctionedBy: sanctionedByUserId as unknown as ILoanApplication["sanctionedBy"],
      sanctionedAt: new Date(),
    });
  }

  // ---------------------------------------------------------------------
  // Disbursement module
  // ---------------------------------------------------------------------
  public async getSanctionedLoans(pagination: IPaginationParams = {}) {
    return this.loanRepository.findByStatus(LoanStatus.SANCTIONED, pagination);
  }

  public async disburseLoan(loanId: string, disbursedByUserId: string): Promise<ILoanApplication> {
    const loan = await this.loanRepository.findByIdOrThrow(loanId);
    this.assertTransition(loan.status, LoanStatus.DISBURSED);

    return this.loanRepository.updateByIdOrThrow(loanId, {
      status: LoanStatus.DISBURSED,
      disbursedBy: disbursedByUserId as unknown as ILoanApplication["disbursedBy"],
      disbursedAt: new Date(),
    });
  }

  // ---------------------------------------------------------------------
  // Collection module (read side - mutation happens in PaymentService)
  // ---------------------------------------------------------------------
  public async getDisbursedLoans(pagination: IPaginationParams = {}) {
    return this.loanRepository.findByStatus(LoanStatus.DISBURSED, pagination);
  }

  // ---------------------------------------------------------------------
  // Admin module: cross-cutting overview across all 4 modules
  // ---------------------------------------------------------------------
  public async getOverview() {
    const [leadsCount, applied, sanctioned, rejected, disbursed, closed] = await Promise.all([
      this.getLeads({ limit: 1 }).then((r) => r.total),
      this.loanRepository.count({ status: LoanStatus.APPLIED }),
      this.loanRepository.count({ status: LoanStatus.SANCTIONED }),
      this.loanRepository.count({ status: LoanStatus.REJECTED }),
      this.loanRepository.count({ status: LoanStatus.DISBURSED }),
      this.loanRepository.count({ status: LoanStatus.CLOSED }),
    ]);

    return {
      leads: leadsCount,
      applied,
      sanctioned,
      rejected,
      disbursed,
      closed,
      totalLoans: applied + sanctioned + rejected + disbursed + closed,
    };
  }

  private assertTransition(from: LoanStatus, to: LoanStatus): void {
    if (!LoanStatusTransitionMap.isValidTransition(from, to)) {
      throw new BadRequestError(`Cannot move loan from ${from} to ${to}`);
    }
  }
}
