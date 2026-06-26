import { Request, Response } from "express";
import { BaseController } from "../core/base/BaseController";
import { LoanService } from "../services/loan.service";
import { parsePagination } from "../utils/pagination.util";

export class SalesController extends BaseController {
  constructor(private readonly loanService: LoanService = new LoanService()) {
    super();
  }

  public getLeads = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.loanService.getLeads(parsePagination(req));
    return this.ok(res, "Leads fetched", result);
  };
}
