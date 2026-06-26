import { Request, Response } from "express";
import { BaseController } from "../core/base/BaseController";
import { LoanService } from "../services/loan.service";
import { parsePagination } from "../utils/pagination.util";

export class DisbursementController extends BaseController {
  constructor(private readonly loanService: LoanService = new LoanService()) {
    super();
  }

  public getSanctionedLoans = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.loanService.getSanctionedLoans(parsePagination(req));
    return this.ok(res, "Sanctioned loans fetched", result);
  };

  public disburseLoan = async (req: Request, res: Response): Promise<Response> => {
    const loan = await this.loanService.disburseLoan(req.params.loanId, req.user!.userId);
    return this.ok(res, "Loan disbursed", loan);
  };
}
