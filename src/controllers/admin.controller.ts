import { Request, Response } from "express";
import { BaseController } from "../core/base/BaseController";
import { LoanService } from "../services/loan.service";

export class AdminController extends BaseController {
  constructor(private readonly loanService: LoanService = new LoanService()) {
    super();
  }

  public getOverview = async (_req: Request, res: Response): Promise<Response> => {
    const overview = await this.loanService.getOverview();
    return this.ok(res, "Overview fetched", overview);
  };
}
