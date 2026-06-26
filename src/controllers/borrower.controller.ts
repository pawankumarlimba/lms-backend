import { Request, Response } from "express";
import { BaseController } from "@core/base/BaseController";
import { LoanService } from "@services/loan.service";
import { PersonalDetailsDto } from "@dto/loan/personal-details.dto";
import { ApplyLoanDto } from "@dto/loan/apply-loan.dto";
import { BadRequestError } from "@core/errors/ApiError";

export class BorrowerController extends BaseController {
  constructor(private readonly loanService: LoanService = new LoanService()) {
    super();
  }

  public submitPersonalDetails = async (req: Request, res: Response): Promise<Response> => {
    const profile = await this.loanService.submitPersonalDetails(
      req.user!.userId,
      req.body as PersonalDetailsDto
    );
    return this.ok(res, "Eligibility check passed", profile);
  };

  public applyForLoan = async (req: Request, res: Response): Promise<Response> => {
    if (!req.file) {
      throw new BadRequestError("Salary slip file is required (PDF/JPG/PNG, max 5MB)");
    }
    const loan = await this.loanService.applyForLoan(
      req.user!.userId,
      req.body as ApplyLoanDto,
      req.file
    );
    return this.created(res, "Loan application submitted", loan);
  };

  public getMyApplications = async (req: Request, res: Response): Promise<Response> => {
    const loans = await this.loanService.getMyApplications(req.user!.userId);
    return this.ok(res, "Applications fetched", loans);
  };

  public getApplicationById = async (req: Request, res: Response): Promise<Response> => {
    const loan = await this.loanService.getLoanByIdOrThrow(req.params.loanId);
    return this.ok(res, "Application fetched", loan);
  };
}
