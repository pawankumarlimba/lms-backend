import { Request, Response } from "express";
import { BaseController } from "@core/base/BaseController";
import { LoanService } from "@services/loan.service";
import { RejectLoanDto } from "@dto/loan/reject-loan.dto";
import { parsePagination } from "@utils/pagination.util";

export class SanctionController extends BaseController {
  constructor(private readonly loanService: LoanService = new LoanService()) {
    super();
  }

  public getAppliedLoans = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.loanService.getAppliedLoans(parsePagination(req));
    return this.ok(res, "Applied loans fetched", result);
  };

  public sanctionLoan = async (req: Request, res: Response): Promise<Response> => {
    const loan = await this.loanService.sanctionLoan(req.params.loanId, req.user!.userId);
    return this.ok(res, "Loan sanctioned", loan);
  };

  public rejectLoan = async (req: Request, res: Response): Promise<Response> => {
    const { reason } = req.body as RejectLoanDto;
    const loan = await this.loanService.rejectLoan(req.params.loanId, reason, req.user!.userId);
    return this.ok(res, "Loan rejected", loan);
  };
}
